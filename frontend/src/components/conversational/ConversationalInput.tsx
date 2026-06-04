'use client';

import { useState } from 'react';
import { parseConversational } from '@/lib/conversational';
import { DashboardFilters } from '@/lib/types';

interface Props {
  onApply: (patch: Partial<DashboardFilters>) => void;
}

const EXAMPLE = 'Ej: "ROAS de base propia últimos 30 días con time-decay"';

export function ConversationalInput({ onApply }: Props) {
  const [text, setText] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const patch = parseConversational(text);
    if (Object.keys(patch).length > 0) onApply(patch);
  }

  return (
    <form
      onSubmit={submit}
      className="flex gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={EXAMPLE}
        className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
      />
      <button
        type="submit"
        className="rounded-lg bg-slate-700 px-4 text-sm font-medium hover:bg-slate-600"
      >
        Aplicar
      </button>
    </form>
  );
}
