import { useState } from 'react';
import { BookOpenText, Lock, Mail, UserRound } from 'lucide-react';
import { useStore } from '@/store';

export function Login() {
  const { authError, loadingUser, login, register } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === 'login') {
      await login({ email, password });
      return;
    }
    await register({ name, email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#f9efe4,transparent_40%),linear-gradient(180deg,#faf8f5,#f4efe8)] px-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-lingnan-100 bg-white shadow-2xl lg:grid-cols-[1.15fr_0.85fr]">
        <div className="hidden bg-lingnan-900 px-10 py-12 text-white lg:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <BookOpenText size={24} />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold">筑迹大观</h1>
              <p className="text-sm text-white/70">古建筑文献智能研究平台</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-white/50">Platform</p>
              <h2 className="mt-3 font-serif text-4xl leading-tight">
                登录后即可使用
                <br />
                文献阅读、书签和历史追踪
              </h2>
            </div>
            <div className="space-y-3 text-sm text-white/75">
              <p>支持注册独立账户，用户数据由后端接口持久化保存。</p>
              <p>浏览历史自动记录阅读、检索与报告生成行为。</p>
              <p>书签可保存重点文献与知识图谱节点，方便快速回看。</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-12">
          <div className="mb-8 flex rounded-2xl bg-ink-50 p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                mode === 'login' ? 'bg-white text-lingnan-700 shadow-sm' : 'text-ink-500'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                mode === 'register' ? 'bg-white text-lingnan-700 shadow-sm' : 'text-ink-500'
              }`}
            >
              注册
            </button>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-ink-900">
              {mode === 'login' ? '欢迎回来' : '创建账号'}
            </h2>
            <p className="mt-2 text-sm text-ink-500">
              {mode === 'login'
                ? '输入邮箱和密码，进入平台。'
                : '注册后即可使用浏览历史、书签与个性化设置。'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink-700">姓名</span>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
                  <input
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-2xl border border-ink-200 bg-ink-50 py-3 pl-10 pr-4 outline-none transition focus:border-lingnan-300 focus:ring-2 focus:ring-lingnan-200"
                    placeholder="请输入姓名"
                  />
                </div>
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink-700">邮箱</span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-ink-200 bg-ink-50 py-3 pl-10 pr-4 outline-none transition focus:border-lingnan-300 focus:ring-2 focus:ring-lingnan-200"
                  placeholder="name@example.com"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink-700">密码</span>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
                <input
                  required
                  minLength={6}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-ink-200 bg-ink-50 py-3 pl-10 pr-4 outline-none transition focus:border-lingnan-300 focus:ring-2 focus:ring-lingnan-200"
                  placeholder="至少 6 位密码"
                />
              </div>
            </label>

            {authError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={loadingUser}
              className="w-full rounded-2xl bg-lingnan-600 py-3 text-sm font-medium text-white transition hover:bg-lingnan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingUser ? '提交中...' : mode === 'login' ? '登录平台' : '完成注册'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
