import { Icons } from '@/components/atoms/Icons';

export function LoadingState() {
  return (
    <div style={{ padding: 20 }}>
      <div className="sk" style={{ height: 14, width: '60%', marginBottom: 12 }} />
      <div className="sk" style={{ height: 60, marginBottom: 10 }} />
      <div className="sk" style={{ height: 60, marginBottom: 10 }} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <div className="metrics">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="sk" style={{ height: 110, borderRadius: 'var(--r-lg)' }} />
        ))}
      </div>
      <div className="sk" style={{ height: 150, borderRadius: 'var(--r-xl)', marginBottom: 26 }} />
      <div className="grid-2">
        <div className="sk" style={{ height: 240, borderRadius: 'var(--r-lg)' }} />
        <div className="sk" style={{ height: 240, borderRadius: 'var(--r-lg)' }} />
      </div>
      <div className="sk" style={{ height: 240, borderRadius: 'var(--r-lg)' }} />
    </div>
  );
}

export function EmptyState({ onReset }: { onReset?: () => void }) {
  return (
    <div className="state-box">
      <div className="state-ico">
        <Icons.search />
      </div>
      <div className="state-title">Sin datos en el rango</div>
      <div className="state-text">
        No hay campañas ni ventas para los filtros seleccionados. Ajusta el rango o el origen
        de audiencia.
      </div>
      {onReset && (
        <button className="btn btn-primary" onClick={onReset}>
          Restablecer filtros
        </button>
      )}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="state-box error">
      <div className="state-ico">
        <Icons.bolt />
      </div>
      <div className="state-title">Ocurrió un error</div>
      <div className="state-text">
        No se pudo cargar el reporte. Revisa tu conexión e inténtalo de nuevo.
      </div>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
