import { Filter, Network, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { nodeTypeColors, nodeTypeLabels } from '@/data/mockData';
import { useStore } from '@/store';

export function KnowledgeGraphView() {
  const { knowledgeGraph, selectedNode, setSelectedNode } = useStore();
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());

  const visibleNodes = useMemo(() => {
    if (!activeTypes.size) return knowledgeGraph.nodes;
    return knowledgeGraph.nodes.filter((node) => activeTypes.has(node.type));
  }, [activeTypes, knowledgeGraph.nodes]);

  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges = knowledgeGraph.edges.filter(
    (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target),
  );

  const toggleType = (type: string) => {
    setActiveTypes((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  return (
    <div className="flex h-full bg-ink-50">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-16 items-center justify-between border-b border-ink-200 bg-white px-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink-900">知识图谱</h2>
            <p className="text-sm text-ink-500">
              共 {visibleNodes.length} 个节点，{visibleEdges.length} 条关系
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-ink-200 px-4 py-2 text-sm text-ink-600">
            <Filter size={16} />
            类型筛选
          </div>
        </div>

        <div className="grid flex-1 gap-6 overflow-y-auto p-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl border border-ink-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <Network size={18} className="text-lingnan-600" />
              <h3 className="font-medium text-ink-900">节点列表</h3>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {Object.entries(nodeTypeLabels).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`rounded-full px-3 py-2 text-sm transition ${
                    activeTypes.has(type) ? 'bg-lingnan-600 text-white' : 'bg-ink-50 text-ink-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {visibleNodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedNode?.id === node.id
                      ? 'border-lingnan-200 bg-lingnan-50'
                      : 'border-ink-200 hover:border-lingnan-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: nodeTypeColors[node.type] }}
                    />
                    <div>
                      <p className="font-medium text-ink-900">{node.label}</p>
                      <p className="text-sm text-ink-500">{nodeTypeLabels[node.type]}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-5">
            {selectedNode ? (
              <>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <span
                      className="inline-block rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: `${nodeTypeColors[selectedNode.type]}20`,
                        color: nodeTypeColors[selectedNode.type],
                      }}
                    >
                      {nodeTypeLabels[selectedNode.type]}
                    </span>
                    <h3 className="mt-3 font-serif text-3xl font-bold text-ink-900">{selectedNode.label}</h3>
                    {selectedNode.description && (
                      <p className="mt-2 text-sm leading-7 text-ink-500">{selectedNode.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="rounded-xl border border-ink-200 p-2 text-ink-500 transition hover:bg-ink-50"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-2xl bg-ink-50 p-4">
                    <p className="mb-2 text-sm font-medium text-ink-700">属性</p>
                    <div className="space-y-2 text-sm text-ink-600">
                      {Object.entries(selectedNode.properties).map(([key, value]) => (
                        <div key={key} className="flex justify-between gap-4">
                          <span className="text-ink-400">{key}</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-ink-50 p-4">
                    <p className="mb-2 text-sm font-medium text-ink-700">关联关系</p>
                    <div className="space-y-2">
                      {visibleEdges
                        .filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id)
                        .map((edge) => {
                          const otherId = edge.source === selectedNode.id ? edge.target : edge.source;
                          const otherNode = knowledgeGraph.nodes.find((node) => node.id === otherId);
                          return (
                            <div key={edge.id} className="rounded-xl bg-white p-3 text-sm text-ink-600">
                              <span className="font-medium text-ink-900">{otherNode?.label || otherId}</span>
                              <span className="mx-2 text-lingnan-700">{edge.label}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <Network size={42} className="mx-auto mb-4 text-ink-300" />
                  <p className="text-lg font-medium text-ink-700">选择一个图谱节点</p>
                  <p className="mt-2 text-sm text-ink-400">右侧会显示属性和关联关系。</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
