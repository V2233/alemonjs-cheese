import { NavLink, Outlet } from 'react-router-dom';

import ThemeToggle from './ThemeToggle';

export default function Layout() {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'text-[var(--al-link)] font-medium'
      : 'text-[var(--al-nav-text)] hover:text-[var(--al-text)]';

  return (
    <div className="min-h-screen bg-[var(--al-bg)] text-[var(--al-text)]">
      <header className="bg-[var(--al-nav-bg)] border-b border-[var(--al-nav-border)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
          <h1 className="text-lg font-semibold">Cheese 设置</h1>
          <nav className="flex gap-4 text-sm">
            <NavLink to="/home" className={navClass}>
              配置
            </NavLink>
          </nav>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}