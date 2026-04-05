import {
  Bookmark,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  History,
  Network,
  Search,
  Settings,
  Sparkles,
  Upload,
} from 'lucide-react';
import { nodeTypeColors, nodeTypeLabels } from '@/data/mockData';
import { useStore } from '@/store';
import type { NodeType } from '@/types';

const primaryTabs = [
  { id: 'reader', label: '文献阅读', icon: BookOpen },
  { id: 'graph', label: '知识图谱', icon: Network },
  { id: 'search', label: '智能检索', icon: Search },
  { id: 'analysis', label: 'AI 分析', icon: Sparkles },
  { id: 'upload', label: '文献上传', icon: Upload },
  { id: 'report', label: '报告生成', icon: FileText },
] as const;

const secondaryTabs = [
  { id: 'bookmarks', label: '我的书签', icon: Bookmark },
  { id: 'history', label: '浏览历史', icon: History },
  { id: 'settings', label: '设置', icon: Settings },
] as const;

const nodeTypes: NodeType[] = [
  'building',
  'component',
  'material',
  'technique',
  'person',
  'document',
  'location',
  'dynasty',
  'term',
  'concept',
];

export function Sidebar() {
  const {
    activeTab,
    currentDocument,
    documents,
    openDocument,
    setActiveTab,
    sidebarOpen,
    toggleSidebar,
  } = useStore();

  return (
    <aside
      className={`flex flex-col border-r border-ink-200 bg-white transition-all duration-300 ${
        sidebarOpen ? 'w-80' : 'w-20'
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-ink-100 px-4">
        {sidebarOpen ? (
          <div>
            <h1 className="font-serif text-xl font-bold text-ink-900">筑迹大观</h1>
            <p className="text-xs text-ink-500">古建筑文献智能研究平台</p>
          </div>
        ) : (
          <div className="mx-auto font-serif text-lg font-bold text-lingnan-700">筑</div>
        )}
        <button onClick={toggleSidebar} className="rounded-xl p-2 transition hover:bg-ink-50">
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-6 space-y-1">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={!sidebarOpen ? tab.label : undefined}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                  active ? 'bg-lingnan-50 text-lingnan-700' : 'text-ink-600 hover:bg-ink-50'
                } ${!sidebarOpen ? 'justify-center' : ''}`}
              >
                <Icon size={18} />
                {sidebarOpen && <span className="text-sm font-medium">{tab.label}</span>}
              </button>
            );
          })}
        </div>

        {sidebarOpen && (
          <div className="mb-6">
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-[0.2em] text-ink-400">
              文献库
            </p>
            <div className="space-y-2">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => void openDocument(doc)}
                  className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                    currentDocument?.id === doc.id
                      ? 'border-lingnan-200 bg-lingnan-50'
                      : 'border-transparent hover:border-ink-200 hover:bg-ink-50'
                  }`}
                >
                  <p className="text-sm font-medium text-ink-900">{doc.title}</p>
                  <p className="mt-1 text-xs text-ink-500">
                    {doc.dynasty || '未标注朝代'} · {doc.author || '佚名'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {sidebarOpen && activeTab === 'graph' && (
          <div className="rounded-3xl border border-ink-200 bg-ink-50 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-ink-400">图谱图例</p>
            <div className="grid grid-cols-2 gap-2">
              {nodeTypes.map((type) => (
                <div key={type} className="flex items-center gap-2 text-sm text-ink-600">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: nodeTypeColors[type] }}
                  />
                  {nodeTypeLabels[type]}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-ink-100 p-3">
        {secondaryTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              title={!sidebarOpen ? tab.label : undefined}
              className={`mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                active ? 'bg-lingnan-50 text-lingnan-700' : 'text-ink-600 hover:bg-ink-50'
              } ${!sidebarOpen ? 'justify-center' : ''}`}
            >
              <Icon size={18} />
              {sidebarOpen && <span className="text-sm font-medium">{tab.label}</span>}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
