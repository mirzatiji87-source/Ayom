import { roleMeta } from '@/lib/ayom-theme';

export default function RolePill({ role, className = '' }) {
  const meta = roleMeta(role);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
      style={{ backgroundColor: meta.bg, color: meta.text }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: meta.dot }}
        aria-hidden="true"
      />
      {meta.label}
    </span>
  );
}
