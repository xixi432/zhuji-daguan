import { Save, Settings } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/store';

export function SettingsPanel() {
  const { llmConfig, updateLLMConfig, user } = useStore();
  const [provider, setProvider] = useState(llmConfig.provider);
  const [model, setModel] = useState(llmConfig.model);
  const [apiKey, setApiKey] = useState(llmConfig.apiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await updateLLMConfig({ provider, model, apiKey });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex h-full flex-col bg-ink-50">
      <div className="flex h-16 items-center justify-between border-b border-ink-200 bg-white px-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-ink-900">设置</h2>
          <p className="text-sm text-ink-500">配置个人资料与大模型连接信息。</p>
        </div>
        <button
          onClick={() => void handleSave()}
          className="flex items-center gap-2 rounded-xl bg-lingnan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-lingnan-700"
        >
          <Save size={16} />
          {saved ? '已保存' : '保存设置'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="rounded-3xl border border-ink-200 bg-white p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lingnan-50 text-lingnan-700">
                <Settings size={18} />
              </div>
              <div>
                <h3 className="font-medium text-ink-900">个人信息</h3>
                <p className="text-sm text-ink-500">当前登录用户的基础信息。</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-ink-50 p-4">
                <p className="text-xs text-ink-400">姓名</p>
                <p className="mt-1 text-sm font-medium text-ink-900">{user?.name}</p>
              </div>
              <div className="rounded-2xl bg-ink-50 p-4">
                <p className="text-xs text-ink-400">邮箱</p>
                <p className="mt-1 text-sm font-medium text-ink-900">{user?.email}</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-ink-200 bg-white p-6">
            <h3 className="mb-5 font-medium text-ink-900">大模型设置</h3>
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink-700">服务商</span>
                <select
                  value={provider}
                  onChange={(event) => setProvider(event.target.value as typeof provider)}
                  className="w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 outline-none transition focus:border-lingnan-300 focus:ring-2 focus:ring-lingnan-200"
                >
                  <option value="zhipu">智谱 AI</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="aliyun">阿里通义</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink-700">模型名称</span>
                <input
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  className="w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 outline-none transition focus:border-lingnan-300 focus:ring-2 focus:ring-lingnan-200"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink-700">API Key</span>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  className="w-full rounded-2xl border border-ink-200 bg-ink-50 px-4 py-3 outline-none transition focus:border-lingnan-300 focus:ring-2 focus:ring-lingnan-200"
                  placeholder="请输入 API Key"
                />
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
