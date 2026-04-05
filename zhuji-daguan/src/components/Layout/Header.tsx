import { Bell, LogOut, Search } from 'lucide-react';
import { useStore } from '@/store';

const roleMap = {
  scholar: '研究者',
  student: '学生',
  conservator: '文保工作者',
  admin: '管理员',
};

export function Header() {
  const { performSearch, searchQuery, setSearchQuery, user, logout } = useStore();

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    await performSearch({ keyword: searchQuery });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-ink-200 bg-white px-6">
      <form className="w-full max-w-2xl" onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索文献、建筑、构件或人物..."
            className="w-full rounded-2xl border border-ink-200 bg-ink-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-lingnan-300 focus:ring-2 focus:ring-lingnan-200"
          />
        </div>
      </form>

      <div className="ml-6 flex items-center gap-3">
        <button className="rounded-xl p-2 text-ink-500 transition hover:bg-ink-50">
          <Bell size={18} />
        </button>
        <div className="text-right">
          <p className="text-sm font-medium text-ink-900">{user?.name}</p>
          <p className="text-xs text-ink-500">{user ? roleMap[user.role] : ''}</p>
        </div>
        <button
          onClick={logout}
          className="rounded-xl border border-ink-200 p-2 text-ink-600 transition hover:bg-ink-50"
          title="退出登录"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
