export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-10 text-sm text-slate-400">
      <span className="animate-pulse">{label}</span>
    </div>
  );
}

export function EmptyState({ label = 'Sin datos' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-10 text-sm text-slate-400">
      {label}
    </div>
  );
}

export function ErrorState({
  label = 'Ocurrió un error',
  onRetry,
}: {
  label?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-rose-400">
      <span>{label}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded border border-rose-400/40 px-3 py-1 text-rose-300 hover:bg-rose-400/10"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
