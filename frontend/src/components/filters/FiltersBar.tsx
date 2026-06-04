import { AttributionModel, CampaignRow, DashboardFilters } from '@/lib/types';

interface Props {
  filters: DashboardFilters;
  campaigns: CampaignRow[];
  onChange: (patch: Partial<DashboardFilters>) => void;
}

const MODELS: { value: AttributionModel; label: string }[] = [
  { value: 'linear', label: 'Lineal' },
  { value: 'time_decay', label: 'Time-decay' },
  { value: 'position_based', label: 'Position-based' },
];

const ORIGINS = [
  { value: '', label: 'Todos los orígenes' },
  { value: 'fria', label: 'Fría' },
  { value: 'warm', label: 'Warm' },
  { value: 'base_propia', label: 'Base propia' },
];

const inputClass =
  'rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500';

export function FiltersBar({ filters, campaigns, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <Field label="Desde">
        <input
          type="date"
          value={filters.from ?? ''}
          onChange={(e) => onChange({ from: e.target.value || undefined })}
          className={inputClass}
        />
      </Field>
      <Field label="Hasta">
        <input
          type="date"
          value={filters.to ?? ''}
          onChange={(e) => onChange({ to: e.target.value || undefined })}
          className={inputClass}
        />
      </Field>
      <Field label="Campaña">
        <select
          value={filters.campaignId ?? ''}
          onChange={(e) => onChange({ campaignId: e.target.value || undefined })}
          className={inputClass}
        >
          <option value="">Todas</option>
          {campaigns.map((c) => (
            <option key={c.campaignId} value={c.campaignId}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Origen audiencia">
        <select
          value={filters.audienceOrigin ?? ''}
          onChange={(e) =>
            onChange({
              audienceOrigin: (e.target.value || undefined) as
                | DashboardFilters['audienceOrigin'],
            })
          }
          className={inputClass}
        >
          {ORIGINS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Modelo de atribución">
        <select
          value={filters.model}
          onChange={(e) =>
            onChange({ model: e.target.value as AttributionModel })
          }
          className={inputClass}
        >
          {MODELS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Ventana (días)">
        <input
          type="number"
          min={1}
          max={365}
          value={filters.windowDays}
          onChange={(e) => onChange({ windowDays: Number(e.target.value) })}
          className={`${inputClass} w-24`}
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-400">
      {label}
      {children}
    </label>
  );
}
