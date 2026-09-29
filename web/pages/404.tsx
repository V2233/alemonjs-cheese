import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--al-bg)] text-[var(--al-text)]">
      <h1 className="text-4xl font-semibold">404</h1>
      <Link to="/home" className="text-sm text-[var(--al-link)] hover:underline">
        返回首页
      </Link>
    </div>
  );
}