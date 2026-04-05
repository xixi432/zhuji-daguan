import { BookOpen, Filter, Network, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { nodeTypeColors, nodeTypeLabels } from '@/data/mockData';
import { useStore } from '@/store';
import type { DocumentCategory, NodeType } from '@/types';

const categories: { value: DocumentCategory; label: string }[] = [
  { value: 'official', label: '官修典籍' },
  { value: 'local', label: '地方文献' },
  { value: 'private', label: '私人著述' },
  { value: 'inscription', label: '碑刻铭文' },
  { value: 'drawing', label: '图绘资料' },
];

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

export function SearchPanel() {
  const {
    performSearch,
    searchQuery,
    searchResults,
    setSearchQuery,
    openDocument,
    setActiveTab,
    setSelectedNode,
  } = useStore();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<DocumentCategory>>(new Set());
  const [selectedNodeTypes, setSelectedNodeTypes] = useState<Set<NodeType>>(new Set());

  const filteredDocs = useMemo(() => {
    return (searchResults?.documents || []).filter(
      (doc) => !selectedCategories.size || selectedCategories.has(doc.category),
    );
  }, [searchResults, selectedCategories]);

  const filteredNodes = useMemo(() => {
    return (searchResults?.nodes || []).filter(
      (node) => !selectedNodeTypes.size || selectedNodeTypes.has(node.type),
    );
  }, [searchResults, selectedNodeTypes]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    await performSearch({
      keyword: searchQuery,
      filters: {
        categories: selectedCategories.size ? Array.from(selectedCategories) : undefined,
        nodeTypes: selectedNodeTypes.size ? Array.from(selectedNodeTypes) : undefined,
      },
    });
  };

  const toggleCategory = (value: DocumentCategory) => {
    setSelectedCategories((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const toggleNodeType = (value: NodeType) => {
    setSelectedNodeTypes((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-ink-100 px-6 py-6">
        <h1 className="font-serif text-3xl font-bold text-ink-900">智能检索</h1>
        <p className="mt-2 text-sm text-ink-500">支持文献内容、建筑术语和图谱节点的联动检索。</p>

        <div className="mt-5 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && void handleSearch()}
              placeholder="例如：镬耳屋、防风结构、满洲窗"
              className="w-full rounded-2xl border border-ink-200 bg-ink-50 py-3 pl-11 pr-4 outline-none transition focus:border-lingnan-300 focus:ring-2 focus:ring-lingnan-200"
            />
          </div>
          <button
            onClick={() => setShowFilters((value) => !value)}
            className="rounded-2xl border border-ink-200 px-4 text-ink-600 transition hover:bg-ink-50"
          >
            <Filter size={18} />
          </button>
          <button
            onClick={() => void handleSearch()}
            className="rounded-2xl bg-lingnan-600 px-5 text-sm font-medium text-white transition hover:bg-lingnan-700"
          >
            搜索
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 rounded-3xl bg-ink-50 p-4">
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-ink-700">文献类别</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => toggleCategory(item.value)}
                    className={`rounded-full px-3 py-2 text-sm transition ${
                      selectedCategories.has(item.value)
                        ? 'bg-lingnan-600 text-white'
                        : 'bg-white text-ink-600 hover:bg-ink-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-ink-700">图谱类型</p>
              <div className="flex flex-wrap gap-2">
                {nodeTypes.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleNodeType(item)}
                    className={`rounded-full px-3 py-2 text-sm transition ${
                      selectedNodeTypes.has(item)
                        ? 'bg-lingnan-600 text-white'
                        : 'bg-white text-ink-600 hover:bg-ink-100'
                    }`}
                  >
                    {nodeTypeLabels[item]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-ink-50 p-6">
        {!searchResults ? (
          <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-ink-200 bg-white">
            <div className="text-center">
              <Search size={42} className="mx-auto mb-4 text-ink-300" />
              <p className="text-lg font-medium text-ink-700">输入关键词开始搜索</p>
              <p className="mt-2 text-sm text-ink-400">结果会同时展示文献和知识图谱节点。</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-3xl border border-ink-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen size={18} className="text-lingnan-600" />
                <h2 className="font-medium text-ink-900">相关文献</h2>
              </div>
              <div className="space-y-3">
                {filteredDocs.length === 0 && <p className="text-sm text-ink-400">暂无匹配文献。</p>}
                {filteredDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => void openDocument(doc)}
                    className="w-full rounded-2xl border border-ink-200 p-4 text-left transition hover:border-lingnan-300"
                  >
                    <p className="font-medium text-ink-900">{doc.title}</p>
                    <p className="mt-1 text-sm text-ink-500">{doc.summary}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-ink-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <Network size={18} className="text-lingnan-600" />
                <h2 className="font-medium text-ink-900">相关节点</h2>
              </div>
              <div className="space-y-3">
                {filteredNodes.length === 0 && <p className="text-sm text-ink-400">暂无匹配节点。</p>}
                {filteredNodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => {
                      setSelectedNode(node);
                      setActiveTab('graph');
                    }}
                    className="flex w-full items-start gap-3 rounded-2xl border border-ink-200 p-4 text-left transition hover:border-lingnan-300"
                  >
                    <span
                      className="mt-1 h-3 w-3 rounded-full"
                      style={{ backgroundColor: nodeTypeColors[node.type] }}
                    />
                    <div>
                      <p className="font-medium text-ink-900">{node.label}</p>
                      <p className="mt-1 text-sm text-ink-500">{node.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
