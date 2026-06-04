'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/queries';
import { CampaignRow } from '@/lib/types';
import { formatCop, formatCopShort, formatRoas, formatDate } from '@/lib/format';
import { campaignColor } from '@/lib/campaign-color';
import { Icons } from '@/components/atoms/Icons';
import { Pager } from '@/components/atoms/Pager';
import { LoadingState } from '@/components/molecules/States';

interface Props {
  campaign: CampaignRow;
  index: number;
  onClose: () => void;
}

export function DrillDrawer({ campaign, index, onClose }: Props) {
  const [tab, setTab] = useState<'touch' | 'sales'>('touch');
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['drilldown', campaign.campaignId, page],
    queryFn: () => reportsApi.drilldown(campaign.campaignId, page),
  });

  const touch = query.data?.touchpoints;
  const sales = query.data?.sales ?? [];

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer">
        <div className="drawer-head">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="eyebrow">Drill-down · camino de conversión</div>
            <button className="btn btn-icon" onClick={onClose} style={{ padding: 7 }}>
              <Icons.close />
            </button>
          </div>
          <div className="drawer-title">
            <span className="cc" style={{ background: campaignColor(index) }} />
            <div>
              <div className="dt-name">{campaign.name}</div>
              <div className="dt-meta">
                {campaign.channel} · ROAS real {formatRoas(campaign.realRoas)}
              </div>
            </div>
          </div>
          <div className="dk-stat">
            <div className="dks">
              <div className="l">Inversión</div>
              <div className="v num">{formatCopShort(campaign.adSpend)}</div>
            </div>
            <div className="dks">
              <div className="l">Atribuido</div>
              <div className="v num" style={{ color: 'var(--good)' }}>
                {formatCopShort(campaign.attributedRevenue)}
              </div>
            </div>
            <div className="dks">
              <div className="l">ROAS real</div>
              <div
                className="v num"
                style={{ color: campaign.realRoas >= 1 ? 'var(--good)' : 'var(--alert)' }}
              >
                {formatRoas(campaign.realRoas)}
              </div>
            </div>
          </div>
          <div className="drawer-tabs">
            <button className={tab === 'touch' ? 'on' : ''} onClick={() => setTab('touch')}>
              Touchpoints <span className="dt-n">{touch?.total ?? 0}</span>
            </button>
            <button className={tab === 'sales' ? 'on' : ''} onClick={() => setTab('sales')}>
              Ventas <span className="dt-n">{sales.length}</span>
            </button>
          </div>
        </div>

        <div className="drawer-body">
          {query.isLoading && <LoadingState />}

          {tab === 'touch' && touch && (
            <>
              <div className="subh">
                <span>Touchpoints de la campaña</span>
                <span className="num">{touch.total}</span>
              </div>
              {touch.items.length === 0 && <div className="empty-mini">Sin touchpoints</div>}
              {touch.items.map((t) => (
                <div className="row-item" key={t.id}>
                  <span className="ch-tag">{t.channel}</span>
                  <div className="ri-main">
                    <div className="ri-name">{t.audienceOrigin}</div>
                    <div className="ri-meta">{formatDate(t.occurredAt)}</div>
                  </div>
                </div>
              ))}
              <Pager page={touch.page} totalPages={touch.totalPages} onChange={setPage} />
            </>
          )}

          {tab === 'sales' && (
            <>
              <div className="subh">
                <span>Ventas POS de los contactos</span>
                <span className="num">{sales.length}</span>
              </div>
              {sales.length === 0 && <div className="empty-mini">Sin ventas</div>}
              {sales.map((s) => (
                <div className="row-item" key={s.id}>
                  <span className="ch-tag" style={{ minWidth: 60 }}>
                    <Icons.cart style={{ width: 13, height: 13 }} />
                  </span>
                  <div className="ri-main">
                    <div className="ri-name">{formatCop(Number(s.amount))}</div>
                    <div className="ri-meta">{formatDate(s.occurredAt)}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
