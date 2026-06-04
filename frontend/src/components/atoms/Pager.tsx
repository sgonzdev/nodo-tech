interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pager({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        fontSize: 12,
        color: 'var(--faint)',
      }}
    >
      <button className="btn btn-icon" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ‹
      </button>
      <span className="num">
        {page} / {totalPages}
      </span>
      <button
        className="btn btn-icon"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
    </div>
  );
}
