'use client';

import { useState } from 'react';
import { AttributionModel, CampaignRow, DashboardFilters } from '@/lib/types';
import { parseConversational } from '@/lib/conversational';
import { Icons } from '@/components/atoms/Icons';

interface Props {
  filters: DashboardFilters;
  campaigns: CampaignRow[];
  onChange: (patch: Partial<DashboardFilters>) => void;
}

const MODELS: { id: AttributionModel; label: string }[] = [
  { id: 'linear', label: 'Lineal' },
  { id: 'time_decay', label: 'Time-decay' },
  { id: 'position_based', label: 'Posición (U)' },
];
const ORIGINS = [
  { id: '', label: 'Todos' },
  { id: 'fria', label: 'fría' },
  { id: 'warm', label: 'warm' },
  { id: 'base_propia', label: 'base_propia' },
];

export function FilterBar({ filters, campaigns, onChange }: Props) {
  return (
    <div className="fbar">
      <div className="fgroup">
        <span className="flabel">Campaña</span>
        <div className="sel-wrap">
          <select
            className="sel"
            value={filters.campaignId ?? ''}
            onChange={(e) => onChange({ campaignId: e.target.value || undefined })}
          >
            <option value="">Todas las campañas</option>
            {campaigns.map((c) => (
              <option key={c.campaignId} value={c.campaignId}>
                {c.name}
              </option>
            ))}
          </select>
          <Icons.chev className="chev" />
        </div>
      </div>

      <div className="fgroup">
        <span className="flabel">Origen</span>
        {ORIGINS.map((o) => (
          <button
            key={o.id}
            className={'chip' + ((filters.audienceOrigin ?? '') === o.id ? ' on' : '')}
            onClick={() =>
              onChange({
                audienceOrigin: (o.id || undefined) as DashboardFilters['audienceOrigin'],
              })
            }
          >
            {o.id && <span className="cdot" />}
            {o.label}
          </button>
        ))}
      </div>

      <div className="fgroup">
        <span className="flabel">Atribución</span>
        <div className="seg accent">
          {MODELS.map((m) => (
            <button
              key={m.id}
              className={filters.model === m.id ? 'on' : ''}
              onClick={() => onChange({ model: m.id })}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="fgroup">
        <span className="flabel">Ventana</span>
        <input
          className="win-input num"
          type="number"
          min={1}
          max={365}
          value={filters.windowDays}
          onChange={(e) => onChange({ windowDays: Number(e.target.value) || 30 })}
        />
        <span className="cmd-hint">días</span>
      </div>

      <div className="fbar-spacer" />

      <CommandBar onApply={onChange} />
    </div>
  );
}

function CommandBar({
  onApply,
}: {
  onApply: (patch: Partial<DashboardFilters>) => void;
}) {
  const [text, setText] = useState('');
  const submit = () => {
    const patch = parseConversational(text);
    if (Object.keys(patch).length > 0) {
      onApply(patch);
      setText('');
    }
  };
  return (
    <div className="cmd">
      <Icons.search />
      <input
        value={text}
        placeholder="Pregúntale al dashboard… ej. “base propia últimos 30 días time-decay”"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <button className="go" onClick={submit}>
        Aplicar
      </button>
    </div>
  );
}
