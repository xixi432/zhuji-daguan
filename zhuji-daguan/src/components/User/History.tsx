import { Clock3, FileText, Search, Sparkles, Trash2 } from 'lucide-react';
import { useStore } from '@/store';

const typeLabelMap = {
  document: '阅读',
  search: '搜索',
  analysis: '分析',
  report: '报告',
};

export function HistoryPanel() {
  const { clearHistory, documents, history, openDocument, setActiveTab, setSearchQuery } = useStore();

  const handleOpen = async (item: (typeof history)[number]) => {
    if (item.documentId) {
      const document = documents.find((doc) => doc.id === item.documentId);
      if (document) {
        await openDocument(document, 'history');
        return;
      }
    }

    if (item.type === 'search' && item.query) {
      setSearchQuery(item.query);
      setActiveTab('search');
      return;
    }

    if (item.type === 'analysis') {
      setActiveTab('analysis');
      return;
    }

    if (item.type === 'report') {
      setActiveTab('report');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText size={18} className="text-lingnan-600" />;
      case 'search':
        return <Search size={18} className="text-sky-600" />;
      default:
        return <Sparkles size={18} className="text-amber-600" />;
    }
  };

  return (
    <div className="flex h-full flex-col bg-ink-50">
      <div className="flex h-16 items-center justify-between border-b border-ink-200 bg-white px-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-ink-900">浏览历史</h2>
          <p className="text-sm text-ink-500">系统会自动记录阅读、搜索和分析行为。</p>
        </div>
        <button
          onClick={() => void clearHistory()}
          className="flex items-center gap-2 rounded-xl border border-ink-200 px-4 py-2 text-sm text-ink-600 transition hover:bg-ink-50"
        >
          <Trash2 size={16} />
          清空历史
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {history.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-ink-200 bg-white">
            <div className="text-center">
              <Clock3 size={42} className="mx-auto mb-4 text-ink-300" />
              <p className="text-lg font-medium text-ink-700">还没有历史记录</p>
              <p className="mt-2 text-sm text-ink-400">阅读文献、搜索内容后会自动出现在这里。</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => void handleOpen(item)}
                className="w-full rounded-2xl border border-ink-200 bg-white p-5 text-left transition hover:border-lingnan-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-50">
                      {getIcon(item.type)}
                    </div>
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-lingnan-50 px-2.5 py-1 text-xs font-medium text-lingnan-700">
                          {typeLabelMap[item.type]}
                        </span>
                        <span className="text-xs text-ink-400">
                          {new Date(item.createdAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-ink-900">{item.title}</h3>
                      {item.description && <p className="mt-1 text-sm text-ink-500">{item.description}</p>}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
