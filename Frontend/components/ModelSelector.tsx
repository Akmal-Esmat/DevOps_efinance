'use client';

import { ModelOption } from '@/lib/api';

export function ModelSelector({
  models,
  selectedModel,
  onChange,
}: {
  models: ModelOption[];
  selectedModel?: string;
  onChange: (model: string) => void;
}) {
  if (models.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor="model-select" className="text-slate-500 whitespace-nowrap">
        Model:
      </label>
      <select
        id="model-select"
        value={selectedModel}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white/90 px-3 py-1.5 text-slate-700 shadow-sm outline-none transition-all hover:border-slate-300 focus:border-blue-400"
      >
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}