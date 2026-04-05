import { Database, Languages, Network, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { mockAIAnalysis, nodeTypeColors, nodeTypeLabels } from '@/data/mockData';
import { useStore } from '@/store';

export function AIAnalysisPanel() {
  const { currentDocument, performRAG, ragResult } = useStore();
  const [tab, setTab] = useState<'translation' | 'entities' | 'relations' | 'rag'>('translation');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  if (!currentDocument) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="text-center">
          <Sparkles size={42} className="mx-auto mb-4 text-ink-300" />
          <p className="text-lg font-medium text-ink-700">请先选择一篇文献</p>
        </div>
      </div>
    );
  }

  const analysis = mockAIAnalysis[currentDocument.id];

  const handleRag = async () => {
    if (!query.trim()) return;
    setLoading(true);
    await performRAG(query);
    setLoading(false);
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-ink-100 px-6 py-6">
        <h1 className="font-serif text-3xl font-bold text-ink-900">AI 智能分析</h1>
        <p className="mt-2 text-sm text-ink-500">当前文献：{currentDocument.title}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {[
            ['translation', '文白转换'],
            ['entities', '实体识别'],
            ['relations', '关系抽取'],
            ['rag', 'GraphRAG'],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value as typeof tab)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                tab === value ? 'bg-lingnan-600 text-white' : 'bg-ink-50 text-ink-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-ink-50 p-6">
        {tab === 'translation' && (
          <div className="mx-auto max-w-4xl rounded-3xl border border-ink-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <Languages size={18} className="text-lingnan-600" />
              <h2 className="font-medium text-ink-900">文白转换</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-ink-50 p-4">
                <p className="mb-2 text-sm font-medium text-ink-700">原文</p>
                <p className="font-serif leading-8 text-ink-800">
                  {analysis?.translation?.original || currentDocument.content.slice(0, 80)}
                </p>
              </div>
              <div className="rounded-2xl bg-lingnan-50 p-4">
                <p className="mb-2 text-sm font-medium text-lingnan-700">现代说明</p>
                <p className="leading-8 text-ink-700">
                  {analysis?.translation?.modern || '当前文献暂无预置翻译说明，可接入后端大模型接口继续增强。'}
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === 'entities' && (
          <div className="mx-auto max-w-4xl rounded-3xl border border-ink-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <Network size={18} className="text-lingnan-600" />
              <h2 className="font-medium text-ink-900">实体识别</h2>
            </div>
            <div className="space-y-3">
              {(analysis?.entities || []).map((entity) => (
                <div key={`${entity.text}-${entity.type}`} className="rounded-2xl border border-ink-200 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: `${nodeTypeColors[entity.type]}20`,
                        color: nodeTypeColors[entity.type],
                      }}
                    >
                      {nodeTypeLabels[entity.type]}
                    </span>
                    <span className="font-medium text-ink-900">{entity.text}</span>
                  </div>
                  <p className="text-sm text-ink-500">{entity.context}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'relations' && (
          <div className="mx-auto max-w-4xl rounded-3xl border border-ink-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <Network size={18} className="text-lingnan-600" />
              <h2 className="font-medium text-ink-900">关系抽取</h2>
            </div>
            <div className="space-y-3">
              {(analysis?.relations || []).map((relation, index) => (
                <div key={`${relation.source}-${relation.target}-${index}`} className="rounded-2xl bg-ink-50 p-4">
                  <p className="text-sm text-ink-600">
                    <span className="font-medium text-ink-900">{relation.source}</span>
                    <span className="mx-2 rounded-full bg-white px-2 py-1 text-xs text-lingnan-700">
                      {relation.relation}
                    </span>
                    <span className="font-medium text-ink-900">{relation.target}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'rag' && (
          <div className="mx-auto max-w-4xl space-y-4">
            <div className="rounded-3xl border border-ink-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <Database size={18} className="text-lingnan-600" />
                <h2 className="font-medium text-ink-900">GraphRAG 问答</h2>
              </div>
              <div className="flex gap-3">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="例如：清代岭南镬耳屋的防风结构如何演变？"
                  className="flex-1 rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 outline-none transition focus:border-lingnan-300 focus:ring-2 focus:ring-lingnan-200"
                />
                <button
                  onClick={() => void handleRag()}
                  className="rounded-2xl bg-lingnan-600 px-5 text-sm font-medium text-white transition hover:bg-lingnan-700"
                >
                  {loading ? '分析中...' : '开始分析'}
                </button>
              </div>
            </div>

            {ragResult && (
              <div className="rounded-3xl border border-ink-200 bg-white p-6">
                <p className="mb-3 text-sm font-medium text-lingnan-700">分析结果</p>
                <p className="leading-8 text-ink-700">{ragResult.answer}</p>
                <div className="mt-6 space-y-3">
                  {ragResult.sources.map((source) => (
                    <div key={`${source.documentId}-${source.page}`} className="rounded-2xl bg-ink-50 p-4">
                      <p className="text-sm font-medium text-ink-900">{source.documentId}</p>
                      <p className="mt-1 text-sm text-ink-500">{source.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
