import { useEffect, useRef, useState } from 'react';

import { api, type IConfig, type Value } from '../api';

export default function Home() {
  const [cfgs, setCfgs] = useState<IConfig[]>([]);
  const [curIndex, setCurIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // 拉配置
  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .config()
      .then(r => {
        setCfgs(r?? []);
        setCurIndex(0);
      })
      .catch(e => setError(String(e).replace(/^Error:\s*/, '')))
      .finally(() => setLoading(false));
  }, []);

  const cur = cfgs[curIndex];

  // 修改字段（不可变更新）
  const patchValue = (prop: string, v: any) => {
    setCfgs(prev =>
      prev.map((cfg, i) =>
        i !== curIndex
          ? cfg
          : {
              ...cfg,
              value: cfg.value.map(f => (f.prop === prop ? { ...f, value: v } : f)),
            }
      )
    );
  };

  const save = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!cur) return;
  setSaving(true);
  setError(null);
  setOkMsg(null);
  try {
    await api.saveConfig(cur); // 只关心成功/失败，不拿返回值覆盖
    setOkMsg('已保存');
    setTimeout(() => setOkMsg(null), 1500);
  } catch (e) {
    setError(String(e).replace(/^Error:\s*/, ''));
  } finally {
    setSaving(false);
  }
};

  // const inputClass =
  //   'block w-full rounded-md bg-[var(--al-input-bg)] border border-[var(--al-input-border)] px-3.5 py-2 text-base text-[var(--al-input-text)] placeholder:text-[var(--al-input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--al-primary-border)]';

  if (loading) {
    return <div className="text-sm text-[var(--al-muted)] py-8 text-center">加载中...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <h3 className="text-4xl font-semibold tracking-tight">Cheese-Setting</h3>
        {cfgs.length > 0 && (
          <div className="flex justify-center items-center mt-4">
            <Dropdown
              list={cfgs.map(c => ({ title: c.title }))}
              placeholder={cur?.title ?? ''}
              onSelect={setCurIndex}
            />
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-[var(--al-danger-border)] bg-[var(--al-danger-bg)] text-[var(--al-danger)] px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {okMsg && (
        <div className="rounded-lg border border-[var(--al-success-border)] bg-[var(--al-success-bg)] text-[var(--al-success)] px-4 py-3 text-sm">
          {okMsg}
        </div>
      )}

      {cur && (
        <form className="space-y-6" onSubmit={save}>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            {cur.value.map(field => (
              <div className="sm:col-span-2" key={field.prop}>
                <label className="block text-sm font-semibold">{field.title}</label>
                <div className="mt-2.5">
                  <FieldInput field={field} onChange={v => patchValue(field.prop, v)} />
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="block w-full rounded-md bg-[var(--al-button-bg)] px-3.5 py-2.5 text-center text-sm font-semibold text-[var(--al-button-text)] hover:bg-[var(--al-button-bg-hover)] disabled:opacity-40"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </form>
      )}
    </div>
  );
}

// ---------------- 字段渲染 ----------------

function FieldInput({ field, onChange }: { field: Value; onChange: (v: any) => void }) {
  const inputClass =
    'block w-full rounded-md bg-[var(--al-input-bg)] border border-[var(--al-input-border)] px-3.5 py-2 text-base text-[var(--al-input-text)] placeholder:text-[var(--al-input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--al-primary-border)]';

  switch (field.component) {
    case 'text':
      return (
        <input
          type="text"
          value={field.value ?? ''}
          placeholder={field.desc}
          onChange={e => onChange(e.target.value)}
          className={inputClass}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          step="0.05"
          value={field.value ?? ''}
          placeholder={field.desc}
          onChange={e => onChange(Number(e.target.value))}
          className={inputClass}
        />
      );

    case 'textarea':
      return (
        <textarea
          rows={4}
          value={field.value ?? ''}
          placeholder={field.desc}
          onChange={e => onChange(e.target.value)}
          className={inputClass}
        />
      );

    case 'select':
      return (
        <select
          value={field.value ?? ''}
          onChange={e => onChange(e.target.value)}
          className={inputClass}
        >
          {(field.children ?? []).map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case 'switch':
      return (
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={!!field.value}
            onClick={() => onChange(!field.value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              field.value ? 'bg-[var(--al-primary)]' : 'bg-[var(--al-card-hover)]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                field.value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm text-[var(--al-muted)]">{field.desc}</span>
        </label>
      );

    default:
      return (
        <input
          type="text"
          value={field.value ?? ''}
          placeholder={field.desc}
          onChange={e => onChange(e.target.value)}
          className={inputClass}
        />
      );
  }
}

// ---------------- 下拉 ----------------

function Dropdown({
  list,
  placeholder,
  onSelect,
}: {
  list: { title: string }[];
  placeholder: string;
  onSelect: (i: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex justify-center gap-x-1.5 rounded-md bg-[var(--al-card)] border border-[var(--al-border)] px-3 py-2 text-sm font-semibold hover:bg-[var(--al-card-hover)]"
      >
        {placeholder}
        <svg
          className="w-5 h-5 text-[var(--al-muted)]"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-[var(--al-card)] border border-[var(--al-border)] shadow-lg">
          <div className="py-1">
            {list.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onSelect(i);
                  setOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--al-card-hover)]"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
