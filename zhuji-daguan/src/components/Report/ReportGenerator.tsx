import { FileText, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/store';

export function ReportGenerator() {
  const { currentReport, generateReport, reports } = useStore();
  const [topic, setTopic] = useState('');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    await generateReport({
      topic,
      length,
      includeGraph: true,
      includeCitations: true,
    });
    setLoading(false);
  };

  return (
    <div className="flex h-full flex-col bg-ink-50">
      <div className="border-b border-ink-200 bg-white px-6 py-6">
        <h1 className="font-serif text-3xl font-bold text-ink-900">报告生成</h1>
        <p className="mt-2 text-sm text-ink-500">输入研究主题，生成一份带图谱线索的综述草稿。</p>
      </div>

      <div className="grid flex-1 gap-6 overflow-hidden p-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-ink-200 bg-white p-6">
          <h2 className="mb-4 font-medium text-ink-900">生成设置</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink-700">研究主题</span>
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="例如：清代岭南镬耳屋的防风结构演变"
                className="w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 outline-none transition focus:border-lingnan-300 focus:ring-2 focus:ring-lingnan-200"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink-700">篇幅</span>
              <select
                value={length}
                onChange={(event) => setLength(event.target.value as typeof length)}
                className="w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 outline-none transition focus:border-lingnan-300 focus:ring-2 focus:ring-lingnan-200"
              >
                <option value="short">简短</option>
                <option value="medium">中等</option>
                <option value="long">详细</option>
              </select>
            </label>
            <button
              onClick={() => void handleGenerate()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-lingnan-600 py-3 text-sm font-medium text-white transition hover:bg-lingnan-700"
            >
              <Sparkles size={16} />
              {loading ? '生成中...' : '生成报告'}
            </button>
          </div>
        </section>

        <section className="min-h-0 rounded-3xl border border-ink-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileText size={18} className="text-lingnan-600" />
            <h2 className="font-medium text-ink-900">报告内容</h2>
          </div>

          <div className="h-[calc(100%-2rem)] overflow-y-auto">
            {currentReport ? (
              <div className="space-y-5">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-ink-900">{currentReport.title}</h3>
                  <p className="mt-2 text-xs text-ink-400">
                    生成时间：{new Date(currentReport.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                <div className="rounded-2xl bg-ink-50 p-5">
                  <p className="whitespace-pre-wrap leading-8 text-ink-700">{currentReport.content}</p>
                </div>
                {currentReport.citations.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-ink-700">引用线索</p>
                    <div className="space-y-2">
                      {currentReport.citations.map((citation, index) => (
                        <div key={`${citation.documentId}-${index}`} className="rounded-2xl border border-ink-200 p-4">
                          <p className="text-sm font-medium text-ink-900">{citation.documentId}</p>
                          <p className="mt-1 text-sm text-ink-500">{citation.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <FileText size={42} className="mx-auto mb-4 text-ink-300" />
                  <p className="text-lg font-medium text-ink-700">还没有生成报告</p>
                  <p className="mt-2 text-sm text-ink-400">当前已保存 {reports.length} 份报告记录。</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
