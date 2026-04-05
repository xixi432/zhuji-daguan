import { Bookmark, Network, Trash2 } from 'lucide-react';
import { useStore } from '@/store';

export function BookmarksPanel() {
  const {
    bookmarks,
    clearBookmarks,
    documents,
    knowledgeGraph,
    openDocument,
    removeBookmark,
    setActiveTab,
    setSelectedNode,
  } = useStore();

  const handleOpen = async (bookmark: (typeof bookmarks)[number]) => {
    if (bookmark.documentId) {
      const document = documents.find((doc) => doc.id === bookmark.documentId);
      if (document) {
        await openDocument(document, 'bookmark');
      }
      return;
    }

    if (bookmark.nodeId) {
      const node = knowledgeGraph.nodes.find((item) => item.id === bookmark.nodeId);
      if (node) {
        setSelectedNode(node);
        setActiveTab('graph');
      }
    }
  };

  return (
    <div className="flex h-full flex-col bg-ink-50">
      <div className="flex h-16 items-center justify-between border-b border-ink-200 bg-white px-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-ink-900">我的书签</h2>
          <p className="text-sm text-ink-500">收藏重点文献与图谱节点，方便快速回看。</p>
        </div>
        <button
          onClick={() => void clearBookmarks()}
          className="flex items-center gap-2 rounded-xl border border-ink-200 px-4 py-2 text-sm text-ink-600 transition hover:bg-ink-50"
        >
          <Trash2 size={16} />
          清空书签
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {bookmarks.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-ink-200 bg-white">
            <div className="text-center">
              <Bookmark size={42} className="mx-auto mb-4 text-ink-300" />
              <p className="text-lg font-medium text-ink-700">还没有书签</p>
              <p className="mt-2 text-sm text-ink-400">在文献阅读页或知识图谱页添加后会显示在这里。</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {bookmarks.map((item) => (
              <div key={item.id} className="rounded-2xl border border-ink-200 bg-white p-5">
                <button className="w-full text-left" onClick={() => void handleOpen(item)}>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lingnan-50 text-lingnan-700">
                      {item.type === 'node' ? <Network size={18} /> : <Bookmark size={18} />}
                    </div>
                    <div>
                      <span className="text-xs text-ink-400">
                        {item.type === 'node' ? '图谱节点' : '文献书签'}
                      </span>
                      <h3 className="font-medium text-ink-900">{item.title}</h3>
                    </div>
                  </div>
                  {item.description && <p className="text-sm text-ink-500">{item.description}</p>}
                  <p className="mt-3 text-xs text-ink-400">
                    收藏于 {new Date(item.createdAt).toLocaleString('zh-CN')}
                  </p>
                </button>
                <button
                  onClick={() => void removeBookmark(item.id)}
                  className="mt-4 rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-600 transition hover:bg-ink-50"
                >
                  删除书签
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
