import { Icons } from '@/components/atoms/Icons';

export interface ToastItem {
  id: string;
  msg: string;
  sub: string | null;
  kind: string;
}

export function Toasts({ items }: { items: ToastItem[] }) {
  return (
    <div className="toasts">
      {items.map((t) => (
        <div key={t.id} className={'toast ' + t.kind}>
          <span className="ti">
            <Icons.check style={{ width: 15, height: 15 }} />
          </span>
          <div>
            <div className="tmsg">{t.msg}</div>
            {t.sub && <div className="tsub">{t.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
