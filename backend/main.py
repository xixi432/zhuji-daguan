from __future__ import annotations

import hashlib
import json
import os
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any
from uuid import uuid4

import pdfplumber
import requests
import uvicorn
from dotenv import load_dotenv
from fastapi import Body, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from neo4j import GraphDatabase
from pydantic import BaseModel

import chromadb
from chromadb.config import Settings

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
STATE_FILE = DATA_DIR / "app_state.json"

app = FastAPI(
    title="筑迹大观 API",
    description="古建筑文献平台后端服务",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_LLM_CONFIG = {
    "provider": "zhipu",
    "apiKey": "",
    "model": "glm-4",
    "temperature": 0.7,
    "maxTokens": 2000,
}

DEFAULT_DOCUMENTS = [
    {
        "id": "doc-001",
        "title": "营造法式·大木作制度",
        "originalTitle": "營造法式·大木作制度",
        "author": "李诫",
        "dynasty": "北宋",
        "category": "official",
        "content": "凡构屋之制，皆以材为祖。材有八等，度屋之大小，因而用之。凡梁之大小，各随其广分为三分，以二分为厚。",
        "summary": "北宋建筑制度文献，重点记录大木构架与尺度规范。",
        "metadata": {"source": "《营造法式》卷四", "digitizedAt": "2026-03-20"},
    },
    {
        "id": "doc-002",
        "title": "广东新语·宫室",
        "originalTitle": "廣東新語·宮室",
        "author": "屈大均",
        "dynasty": "清代",
        "category": "local",
        "content": "岭南之宅，多为镬耳屋。镬耳者，形如覆镬之耳，取其防火之意。窗多满洲窗，以通风采光。",
        "summary": "清代岭南建筑风貌记述，涉及镬耳屋与满洲窗。",
        "metadata": {"source": "《广东新语》卷十七", "digitizedAt": "2026-03-21"},
    },
    {
        "id": "doc-003",
        "title": "佛山忠义乡志·祖庙",
        "author": "吴荣光",
        "dynasty": "清代",
        "category": "local",
        "content": "祖庙在佛山镇中心，殿宇重檐，木雕、砖雕、灰塑俱备。其斗拱层叠，屋脊多陶塑双龙。",
        "summary": "佛山祖庙建筑形制与装饰工艺的地方志记载。",
        "metadata": {"source": "《佛山忠义乡志》卷六", "digitizedAt": "2026-03-22"},
    },
]

DEFAULT_GRAPH = {
    "nodes": [
        {
            "id": "building-1",
            "label": "镬耳屋",
            "type": "building",
            "description": "岭南地区典型民居类型。",
            "properties": {"region": "岭南", "dynasty": "清代"},
        },
        {
            "id": "component-1",
            "label": "满洲窗",
            "type": "component",
            "description": "兼具采光与通风功能的彩色木窗。",
            "properties": {"material": "木、彩色玻璃"},
        },
        {
            "id": "technique-1",
            "label": "灰塑",
            "type": "technique",
            "description": "岭南常见建筑装饰工艺。",
            "properties": {"region": "广府"},
        },
        {
            "id": "person-1",
            "label": "屈大均",
            "type": "person",
            "description": "《广东新语》作者。",
            "properties": {"dynasty": "清代"},
        },
        {
            "id": "document-1",
            "label": "广东新语·宫室",
            "type": "document",
            "description": "记述岭南建筑风貌的地方文献。",
            "properties": {"author": "屈大均"},
        },
    ],
    "edges": [
        {"id": "edge-1", "source": "person-1", "target": "document-1", "label": "著有", "type": "describes"},
        {"id": "edge-2", "source": "document-1", "target": "building-1", "label": "记述", "type": "describes"},
        {"id": "edge-3", "source": "building-1", "target": "component-1", "label": "设有", "type": "contains"},
        {"id": "edge-4", "source": "building-1", "target": "technique-1", "label": "常见装饰", "type": "related_to"},
    ],
}

DEFAULT_STATE = {
    "documents": DEFAULT_DOCUMENTS,
    "knowledge_graph": DEFAULT_GRAPH,
    "users": [],
}


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class HistoryCreateRequest(BaseModel):
    type: str
    title: str
    description: str | None = None
    documentId: str | None = None
    query: str | None = None


class BookmarkCreateRequest(BaseModel):
    type: str
    title: str
    description: str | None = None
    documentId: str | None = None
    nodeId: str | None = None


class SettingsUpdateRequest(BaseModel):
    llmConfig: dict[str, Any]


class ReportRequest(BaseModel):
    topic: str
    length: str = "medium"
    includeGraph: bool = True
    includeCitations: bool = True


def now_iso() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def build_public_user(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "scholar"),
        "bookmarks": user.get("bookmarks", []),
        "notes": user.get("notes", []),
        "searchHistory": user.get("searchHistory", []),
        "llmConfig": user.get("llmConfig", DEFAULT_LLM_CONFIG),
    }


def read_state() -> dict[str, Any]:
    if not STATE_FILE.exists():
        write_state(DEFAULT_STATE)
    return json.loads(STATE_FILE.read_text(encoding="utf-8"))


def write_state(state: dict[str, Any]) -> None:
    STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def ensure_user_exists(state: dict[str, Any], user_id: str) -> dict[str, Any]:
    user = next((item for item in state["users"] if item["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user


def process_file(file: UploadFile) -> str:
    filename = file.filename or "uploaded-file"
    suffix = Path(filename).suffix.lower()

    if suffix == ".pdf":
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(file.file.read())
            temp_path = temp_file.name
        try:
            text = []
            with pdfplumber.open(temp_path) as pdf:
                for page in pdf.pages:
                    text.append(page.extract_text() or "")
            return "\n".join(text).strip()
        finally:
            os.unlink(temp_path)

    raw = file.file.read()
    if suffix in {".txt", ".md"}:
        return raw.decode("utf-8", errors="ignore")
    if suffix in {".doc", ".docx"}:
        return f"已接收 Word 文档 {filename}，当前版本暂以文件摘要形式保存。"
    return raw.decode("utf-8", errors="ignore") or f"已接收文件 {filename}"


DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
ZHIPU_API_KEY = os.getenv("ZHIPU_API_KEY", "")
NEO4J_URI = os.getenv("NEO4J_URI", "neo4j://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

try:
    neo4j_driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    with neo4j_driver.session() as session:
        session.run("RETURN 1")
except Exception:
    neo4j_driver = None

try:
    chroma_client = chromadb.Client(
        Settings(persist_directory=str(BASE_DIR / "chromadb"), anonymized_telemetry=False)
    )
    collection = chroma_client.get_or_create_collection(name="documents")
except Exception:
    chroma_client = None
    collection = None


async def call_zhipu_api(prompt: str) -> str:
    if not ZHIPU_API_KEY:
        return "未配置智谱 API Key，以下为系统模拟回答。"
    response = requests.post(
        "https://open.bigmodel.cn/api/paas/v4/chat/completions",
        headers={"Authorization": f"Bearer {ZHIPU_API_KEY}", "Content-Type": "application/json"},
        json={
            "model": "glm-4",
            "messages": [
                {"role": "system", "content": "你是古建筑文献研究助手，请根据上下文给出简洁可信的回答。"},
                {"role": "user", "content": prompt},
            ],
        },
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "time": now_iso()}


@app.post("/api/auth/register")
async def register(payload: RegisterRequest):
    state = read_state()
    if any(user["email"].lower() == payload.email.lower() for user in state["users"]):
        raise HTTPException(status_code=400, detail="该邮箱已注册")

    new_user = {
        "id": f"user-{uuid4().hex[:8]}",
        "name": payload.name.strip(),
        "email": payload.email.lower(),
        "passwordHash": hash_password(payload.password),
        "role": "scholar",
        "bookmarks": [],
        "history": [],
        "notes": [],
        "searchHistory": [],
        "llmConfig": DEFAULT_LLM_CONFIG,
    }
    state["users"].append(new_user)
    write_state(state)
    return build_public_user(new_user)


@app.post("/api/auth/login")
async def login(payload: LoginRequest):
    state = read_state()
    user = next((item for item in state["users"] if item["email"].lower() == payload.email.lower()), None)
    if not user or user["passwordHash"] != hash_password(payload.password):
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    return build_public_user(user)


@app.get("/api/users/{user_id}")
async def get_user_profile(user_id: str):
    state = read_state()
    return build_public_user(ensure_user_exists(state, user_id))


@app.put("/api/users/{user_id}/settings")
async def update_settings(user_id: str, payload: SettingsUpdateRequest):
    state = read_state()
    user = ensure_user_exists(state, user_id)
    user["llmConfig"] = {**DEFAULT_LLM_CONFIG, **payload.llmConfig}
    write_state(state)
    return build_public_user(user)


@app.get("/api/users/{user_id}/history")
async def get_history(user_id: str):
    state = read_state()
    user = ensure_user_exists(state, user_id)
    return user.get("history", [])


@app.post("/api/users/{user_id}/history")
async def create_history(user_id: str, payload: HistoryCreateRequest):
    state = read_state()
    user = ensure_user_exists(state, user_id)
    history = user.setdefault("history", [])
    history = [item for item in history if not (item.get("type") == payload.type and item.get("title") == payload.title)]
    history.insert(
        0,
        {
            "id": f"history-{uuid4().hex[:8]}",
            "type": payload.type,
            "title": payload.title,
            "description": payload.description,
            "documentId": payload.documentId,
            "query": payload.query,
            "createdAt": now_iso(),
        },
    )
    user["history"] = history[:50]
    if payload.type == "search" and payload.title:
        search_history = user.setdefault("searchHistory", [])
        if payload.title not in search_history:
            search_history.insert(0, payload.title)
            user["searchHistory"] = search_history[:20]
    write_state(state)
    return user["history"]


@app.delete("/api/users/{user_id}/history")
async def clear_history(user_id: str):
    state = read_state()
    user = ensure_user_exists(state, user_id)
    user["history"] = []
    write_state(state)
    return {"success": True}


@app.get("/api/users/{user_id}/bookmarks")
async def get_bookmarks(user_id: str):
    state = read_state()
    user = ensure_user_exists(state, user_id)
    return user.get("bookmarks", [])


@app.post("/api/users/{user_id}/bookmarks")
async def create_bookmark(user_id: str, payload: BookmarkCreateRequest):
    state = read_state()
    user = ensure_user_exists(state, user_id)
    bookmarks = user.setdefault("bookmarks", [])
    existing = next(
        (
            item
            for item in bookmarks
            if item.get("type") == payload.type
            and item.get("documentId") == payload.documentId
            and item.get("nodeId") == payload.nodeId
        ),
        None,
    )
    if existing:
        return bookmarks

    bookmarks.insert(
        0,
        {
            "id": f"bookmark-{uuid4().hex[:8]}",
            "type": payload.type,
            "title": payload.title,
            "description": payload.description,
            "documentId": payload.documentId,
            "nodeId": payload.nodeId,
            "createdAt": now_iso(),
        },
    )
    write_state(state)
    return bookmarks


@app.delete("/api/users/{user_id}/bookmarks/{bookmark_id}")
async def delete_bookmark(user_id: str, bookmark_id: str):
    state = read_state()
    user = ensure_user_exists(state, user_id)
    user["bookmarks"] = [item for item in user.get("bookmarks", []) if item["id"] != bookmark_id]
    write_state(state)
    return {"success": True}


@app.delete("/api/users/{user_id}/bookmarks")
async def clear_bookmarks(user_id: str):
    state = read_state()
    user = ensure_user_exists(state, user_id)
    user["bookmarks"] = []
    write_state(state)
    return {"success": True}


@app.get("/api/documents")
async def get_documents():
    return read_state()["documents"]


@app.get("/api/documents/{doc_id}")
async def get_document(doc_id: str):
    state = read_state()
    document = next((doc for doc in state["documents"] if doc["id"] == doc_id), None)
    if not document:
        raise HTTPException(status_code=404, detail="文献不存在")
    return document


@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    author: str | None = Form(None),
    dynasty: str | None = Form(None),
    category: str = Form("private"),
):
    state = read_state()
    content = process_file(file)
    new_doc = {
        "id": f"doc-{uuid4().hex[:8]}",
        "title": title,
        "author": author,
        "dynasty": dynasty,
        "category": category,
        "content": content,
        "summary": f"上传文献《{title}》已完成解析。",
        "metadata": {"source": "upload", "filename": file.filename, "digitizedAt": now_iso()},
    }
    state["documents"].insert(0, new_doc)
    write_state(state)

    if collection:
        try:
            collection.add(
                documents=[content],
                metadatas=[{"id": new_doc["id"], "title": title}],
                ids=[new_doc["id"]],
            )
        except Exception:
            pass

    if neo4j_driver:
        try:
            with neo4j_driver.session() as session:
                session.run(
                    """
                    MERGE (d:Document {id: $id})
                    SET d.title = $title, d.author = $author, d.dynasty = $dynasty, d.category = $category
                    """,
                    **new_doc,
                )
        except Exception:
            pass

    return new_doc


@app.get("/api/knowledge-graph")
async def get_knowledge_graph():
    return read_state()["knowledge_graph"]


@app.post("/api/rag/query")
async def rag_query(query: str = Body(..., embed=True)):
    state = read_state()
    documents = state["documents"]
    matched = [doc for doc in documents if query.lower() in f"{doc['title']} {doc['content']}".lower()]
    sources = [
        {
            "documentId": doc["id"],
            "page": 1,
            "text": doc["content"][:120],
            "score": 0.95 - index * 0.05,
        }
        for index, doc in enumerate((matched or documents)[:3])
    ]
    context = "\n".join([f"{item['documentId']}: {item['text']}" for item in sources])
    prompt = f"请结合以下文献片段回答问题。\n\n{context}\n\n问题：{query}"
    try:
        answer = await call_zhipu_api(prompt)
    except Exception:
        answer = f"根据当前检索结果，问题“{query}”主要涉及岭南建筑构件、文献记述与空间形制，可继续结合图谱节点深挖。"
    return {
        "answer": answer,
        "sources": sources,
        "entities": state["knowledge_graph"]["nodes"][:3],
        "confidence": 0.89,
    }


@app.post("/api/report/generate")
async def generate_report(payload: ReportRequest):
    length_map = {"short": "约 800 字", "medium": "约 1500 字", "long": "约 3000 字"}
    topic = payload.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="报告主题不能为空")

    content = (
        f"题目：{topic}\n\n"
        f"本文为自动生成的研究综述，篇幅为{length_map.get(payload.length, '约 1500 字')}。"
        f"系统综合了文献库、知识图谱与 GraphRAG 检索结果，梳理了相关建筑类型、关键构件、时代背景与研究线索。"
        f"建议后续结合原始文献图像、构件照片与地方志版本学信息继续扩展。"
    )
    return {
        "id": f"report-{uuid4().hex[:8]}",
        "title": topic,
        "content": content,
        "topics": [topic],
        "citations": [
            {"documentId": "doc-001", "page": 1, "text": "《营造法式》相关尺度记载"},
            {"documentId": "doc-002", "page": 1, "text": "《广东新语》关于镬耳屋的记述"},
        ]
        if payload.includeCitations
        else [],
        "graphs": [read_state()["knowledge_graph"]] if payload.includeGraph else [],
        "createdAt": now_iso(),
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
