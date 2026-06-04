'use client';

import { Icons } from '@/components/atoms/Icons';

export type MobileView = 'dashboard' | 'actions';

interface Props {
  view: MobileView;
  onView: (v: MobileView) => void;
  onOpenFilters: () => void;
  actionsBadge?: number;
}

export function MobileNav({ view, onView, onOpenFilters, actionsBadge }: Props) {
  return (
    <div className="mobile-nav">
      <div className="mobile-tabs">
        <button
          className={view === 'dashboard' ? 'on' : ''}
          onClick={() => onView('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={view === 'actions' ? 'on' : ''}
          onClick={() => onView('actions')}
        >
          Action Center
          {actionsBadge ? <span className="badge-n">{actionsBadge}</span> : null}
        </button>
      </div>
      <button className="btn btn-icon mobile-filter-btn" onClick={onOpenFilters}>
        <Icons.search />
      </button>
    </div>
  );
}
