import { create } from 'zustand';
import {
  mockDocuments,
  mockKnowledgeGraph,
} from '@/data/mockData';
import type {
  BookmarkItem,
  Document,
  FileUpload,
  HistoryItem,
  KnowledgeGraph,
  KnowledgeNode,
  LLMConfig,
  RAGResult,
  Report,
  ReportConfig,
  SearchQuery,
  SearchResult,
  User,
} from '@/types';

const API_BASE_URL = 'http://localhost:8000/api';

type AppTab =
  | 'reader'
  | 'graph'
  | 'search'
  | 'analysis'
  | 'upload'
  | 'report'
  | 'history'
  | 'bookmarks'
  | 'settings';

interface AuthPayload {
  name?: string;
  email: string;
  password: string;
}

interface AppState {
  user: User | null;
  loadingUser: boolean;
  authError: string | null;
  login: (payload: AuthPayload) => Promise<boolean>;
  register: (payload: AuthPayload) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;

  documents: Document[];
  currentDocument: Document | null;
  loadDocuments: () => Promise<void>;
  setCurrentDocument: (doc: Document | null) => void;
  openDocument: (doc: Document, source?: 'document' | 'bookmark' | 'history') => Promise<void>;
  addDocument: (doc: Document) => void;
  uploadDocument: (
    file: File,
    metadata: { title: string; author?: string; dynasty?: string; category?: string },
  ) => Promise<Document>;

  knowledgeGraph: KnowledgeGraph;
  selectedNode: KnowledgeNode | null;
  setSelectedNode: (node: KnowledgeNode | null) => void;
  loadKnowledgeGraph: () => Promise<void>;
  updateKnowledgeGraph: (graph: KnowledgeGraph) => void;

  searchQuery: string;
  searchResults: SearchResult | null;
  setSearchQuery: (query: string) => void;
  performSearch: (query: SearchQuery) => Promise<SearchResult>;

  uploads: FileUpload[];
  addUpload: (upload: FileUpload) => void;
  updateUpload: (id: string, updates: Partial<FileUpload>) => void;
  removeUpload: (id: string) => void;

  llmConfig: LLMConfig;
  updateLLMConfig: (config: Partial<LLMConfig>) => Promise<void>;

  ragResult: RAGResult | null;
  setRagResult: (result: RAGResult | null) => void;
  performRAG: (query: string) => Promise<RAGResult>;

  reports: Report[];
  currentReport: Report | null;
  generateReport: (config: ReportConfig) => Promise<Report>;
  setCurrentReport: (report: Report | null) => void;

  sidebarOpen: boolean;
  toggleSidebar: () => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  showTranslation: boolean;
  toggleTranslation: () => void;
  showAnnotations: boolean;
  toggleAnnotations: () => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;

  history: HistoryItem[];
  loadHistory: () => Promise<void>;
  addToHistory: (item: Omit<HistoryItem, 'id' | 'createdAt'>) => Promise<void>;
  clearHistory: () => Promise<void>;

  bookmarks: BookmarkItem[];
  loadBookmarks: () => Promise<void>;
  addBookmark: (item: Omit<BookmarkItem, 'id' | 'createdAt'>) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  clearBookmarks: () => Promise<void>;

  settings: {
    language: string;
    theme: string;
    notifications: boolean;
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `请求失败：${response.status}`;
    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return response.json();
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  return parseResponse<T>(response);
}

const defaultLLMConfig: LLMConfig = {
  provider: 'zhipu',
  apiKey: '',
  model: 'glm-4',
  temperature: 0.7,
  maxTokens: 2000,
};

export const useStore = create<AppState>((set, get) => ({
  user: null,
  loadingUser: false,
  authError: null,
  async login(payload) {
    set({ loadingUser: true, authError: null });
    try {
      const user = await fetchAPI<User>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: payload.email, password: payload.password }),
      });
      set({ user, llmConfig: user.llmConfig, loadingUser: false });
      await Promise.all([get().loadHistory(), get().loadBookmarks()]);
      return true;
    } catch (error) {
      set({
        authError: error instanceof Error ? error.message : '登录失败',
        loadingUser: false,
      });
      return false;
    }
  },
  async register(payload) {
    set({ loadingUser: true, authError: null });
    try {
      const user = await fetchAPI<User>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          password: payload.password,
        }),
      });
      set({ user, llmConfig: user.llmConfig, loadingUser: false });
      return true;
    } catch (error) {
      set({
        authError: error instanceof Error ? error.message : '注册失败',
        loadingUser: false,
      });
      return false;
    }
  },
  logout() {
    set({
      user: null,
      history: [],
      bookmarks: [],
      authError: null,
      activeTab: 'reader',
    });
  },
  setUser(user) {
    set({ user, llmConfig: user?.llmConfig || defaultLLMConfig });
  },

  documents: mockDocuments,
  currentDocument: mockDocuments[0] || null,
  async loadDocuments() {
    try {
      const documents = await fetchAPI<Document[]>('/documents');
      set({
        documents,
        currentDocument: get().currentDocument || documents[0] || null,
      });
    } catch {
      set({ documents: mockDocuments, currentDocument: get().currentDocument || mockDocuments[0] });
    }
  },
  setCurrentDocument(doc) {
    set({ currentDocument: doc });
  },
  async openDocument(doc, _source) {
    set({ currentDocument: doc, activeTab: 'reader' });
    await get().addToHistory({
      type: 'document',
      title: doc.title,
      description: doc.summary,
      documentId: doc.id,
    });
  },
  addDocument(doc) {
    set((state) => ({ documents: [doc, ...state.documents] }));
  },
  async uploadDocument(file, metadata) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', metadata.title);
    if (metadata.author) formData.append('author', metadata.author);
    if (metadata.dynasty) formData.append('dynasty', metadata.dynasty);
    if (metadata.category) formData.append('category', metadata.category);

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    const document = await parseResponse<Document>(response);
    set((state) => ({
      documents: [document, ...state.documents],
      currentDocument: document,
      activeTab: 'reader',
    }));
    await get().addToHistory({
      type: 'document',
      title: `上传文献：${document.title}`,
      description: '已完成文献上传与解析',
      documentId: document.id,
    });
    return document;
  },

  knowledgeGraph: mockKnowledgeGraph,
  selectedNode: null,
  setSelectedNode(node) {
    set({ selectedNode: node });
  },
  async loadKnowledgeGraph() {
    try {
      const graph = await fetchAPI<KnowledgeGraph>('/knowledge-graph');
      set({ knowledgeGraph: graph });
    } catch {
      set({ knowledgeGraph: mockKnowledgeGraph });
    }
  },
  updateKnowledgeGraph(graph) {
    set({ knowledgeGraph: graph });
  },

  searchQuery: '',
  searchResults: null,
  setSearchQuery(query) {
    set({ searchQuery: query });
  },
  async performSearch(query) {
    const { documents, knowledgeGraph, user } = get();
    const keyword = query.keyword.trim().toLowerCase();
    const filteredDocs = documents.filter((doc) => {
      const text = [doc.title, doc.summary, doc.content, doc.author, doc.dynasty]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const categoryMatch =
        !query.filters?.categories?.length || query.filters.categories.includes(doc.category);
      return categoryMatch && text.includes(keyword);
    });

    const filteredNodes = knowledgeGraph.nodes.filter((node) => {
      const text = [node.label, node.description, JSON.stringify(node.properties)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const nodeTypeMatch =
        !query.filters?.nodeTypes?.length || query.filters.nodeTypes.includes(node.type);
      return nodeTypeMatch && text.includes(keyword);
    });

    const result: SearchResult = {
      documents: filteredDocs,
      nodes: filteredNodes,
      total: filteredDocs.length + filteredNodes.length,
      suggestions: keyword
        ? [`${query.keyword} 构件`, `${query.keyword} 文献`, `${query.keyword} 演变`]
        : [],
    };

    set({ searchQuery: query.keyword, searchResults: result, activeTab: 'search' });
    if (user && keyword) {
      await get().addToHistory({
        type: 'search',
        title: query.keyword,
        description: `检索到 ${result.total} 条相关结果`,
        query: query.keyword,
      });
    }
    return result;
  },

  uploads: [],
  addUpload(upload) {
    set((state) => ({ uploads: [upload, ...state.uploads] }));
  },
  updateUpload(id, updates) {
    set((state) => ({
      uploads: state.uploads.map((upload) => (upload.id === id ? { ...upload, ...updates } : upload)),
    }));
  },
  removeUpload(id) {
    set((state) => ({
      uploads: state.uploads.filter((upload) => upload.id !== id),
    }));
  },

  llmConfig: defaultLLMConfig,
  async updateLLMConfig(config) {
    const nextConfig = { ...get().llmConfig, ...config };
    set({ llmConfig: nextConfig });
    const user = get().user;
    if (!user) return;
    try {
      const updatedUser = await fetchAPI<User>(`/users/${user.id}/settings`, {
        method: 'PUT',
        body: JSON.stringify({ llmConfig: nextConfig }),
      });
      set({ user: updatedUser, llmConfig: updatedUser.llmConfig });
    } catch {
      set((state) =>
        state.user
          ? {
              user: {
                ...state.user,
                llmConfig: nextConfig,
              },
            }
          : {},
      );
    }
  },

  ragResult: null,
  setRagResult(result) {
    set({ ragResult: result });
  },
  async performRAG(query) {
    try {
      const result = await fetchAPI<RAGResult>('/rag/query', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
      set({ ragResult: result });
      await get().addToHistory({
        type: 'analysis',
        title: query,
        description: '执行了一次 GraphRAG 分析',
      });
      return result;
    } catch {
      const result: RAGResult = {
        answer: `围绕“${query}”，系统暂时返回了模拟分析结果：相关主题集中在岭南建筑构件、地方志记述和清代民居形制。`,
        sources: mockDocuments.slice(0, 2).map((doc, index) => ({
          documentId: doc.id,
          page: 1,
          text: doc.content.slice(0, 80),
          score: 0.92 - index * 0.06,
        })),
        entities: mockKnowledgeGraph.nodes.slice(0, 3),
        confidence: 0.82,
      };
      set({ ragResult: result });
      return result;
    }
  },

  reports: [],
  currentReport: null,
  async generateReport(config) {
    try {
      const report = await fetchAPI<Report>('/report/generate', {
        method: 'POST',
        body: JSON.stringify(config),
      });
      set((state) => ({
        reports: [report, ...state.reports],
        currentReport: report,
        activeTab: 'report',
      }));
      await get().addToHistory({
        type: 'report',
        title: report.title,
        description: '生成了一份研究报告',
      });
      return report;
    } catch {
      const report: Report = {
        id: `report-${Date.now()}`,
        title: config.topic,
        content: `这是一份关于“${config.topic}”的模拟报告，包含文献脉络、构件线索和研究建议。`,
        topics: [config.topic],
        citations: [],
        graphs: config.includeGraph ? [mockKnowledgeGraph] : [],
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        reports: [report, ...state.reports],
        currentReport: report,
      }));
      return report;
    }
  },
  setCurrentReport(report) {
    set({ currentReport: report });
  },

  sidebarOpen: true,
  toggleSidebar() {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },
  activeTab: 'reader',
  setActiveTab(tab) {
    set({ activeTab: tab });
  },

  showTranslation: false,
  toggleTranslation() {
    set((state) => ({ showTranslation: !state.showTranslation }));
  },
  showAnnotations: true,
  toggleAnnotations() {
    set((state) => ({ showAnnotations: !state.showAnnotations }));
  },
  fontSize: 'medium',
  setFontSize(size) {
    set({ fontSize: size });
  },

  history: [],
  async loadHistory() {
    const user = get().user;
    if (!user) {
      set({ history: [] });
      return;
    }
    try {
      const history = await fetchAPI<HistoryItem[]>(`/users/${user.id}/history`);
      set({ history });
    } catch {
      set({ history: [] });
    }
  },
  async addToHistory(item) {
    const user = get().user;
    if (!user) return;
    try {
      const history = await fetchAPI<HistoryItem[]>(`/users/${user.id}/history`, {
        method: 'POST',
        body: JSON.stringify(item),
      });
      set({ history });
    } catch {
      set((state) => ({
        history: [
          {
            id: `history-${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...item,
          },
          ...state.history,
        ].slice(0, 50),
      }));
    }
  },
  async clearHistory() {
    const user = get().user;
    if (!user) return;
    try {
      await fetchAPI(`/users/${user.id}/history`, { method: 'DELETE' });
    } finally {
      set({ history: [] });
    }
  },

  bookmarks: [],
  async loadBookmarks() {
    const user = get().user;
    if (!user) {
      set({ bookmarks: [] });
      return;
    }
    try {
      const bookmarks = await fetchAPI<BookmarkItem[]>(`/users/${user.id}/bookmarks`);
      set({ bookmarks });
    } catch {
      set({ bookmarks: [] });
    }
  },
  async addBookmark(item) {
    const user = get().user;
    if (!user) return;
    try {
      const bookmarks = await fetchAPI<BookmarkItem[]>(`/users/${user.id}/bookmarks`, {
        method: 'POST',
        body: JSON.stringify(item),
      });
      set({ bookmarks });
    } catch {
      set((state) => ({
        bookmarks: [
          {
            id: `bookmark-${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...item,
          },
          ...state.bookmarks,
        ],
      }));
    }
  },
  async removeBookmark(id) {
    const user = get().user;
    if (!user) return;
    try {
      await fetchAPI(`/users/${user.id}/bookmarks/${id}`, { method: 'DELETE' });
    } finally {
      set((state) => ({
        bookmarks: state.bookmarks.filter((bookmark) => bookmark.id !== id),
      }));
    }
  },
  async clearBookmarks() {
    const user = get().user;
    if (!user) return;
    try {
      await fetchAPI(`/users/${user.id}/bookmarks`, { method: 'DELETE' });
    } finally {
      set({ bookmarks: [] });
    }
  },

  settings: {
    language: 'zh-CN',
    theme: 'light',
    notifications: true,
  },
}));
