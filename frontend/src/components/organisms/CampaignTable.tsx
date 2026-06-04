import { CampaignRow } from '@/lib/types';
import { formatCop, formatRoas } from '@/lib/format';
import { campaignColor } from '@/lib/campaign-color';
import { Icons } from '@/components/atoms/Icons';

interface Props {
  rows: CampaignRow[];
  onDrill: (id: string) => void;
}

function statusOf(roasReal: number) {
  if (roasReal >= 1.2) return { k: 'gana', label: 'Gana dinero' };
  if (roasReal >= 0.9) return { k: 'eq', label: 'Apenas equilibra' };
  return { k: 'pierde', label: 'Pierde dinero' };
}

export function CampaignTable({ rows, onDrill }: Props) {
  const tot = rows.reduce(
    (a, r) => ({
      spend: a.spend + r.adSpend,
      attributed: a.attributed + r.attributedRevenue,
    }),
    { spend: 0, attributed: 0 },
  );
  const totReal = tot.spend ? tot.attributed / tot.spend : 0;
  const totStatus = statusOf(totReal);

  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th className="l">Campaña</th>
            <th className="l">¿Cómo va?</th>
            <th>Lo que invertiste</th>
            <th>Lo que vendiste</th>
            <th>Retorno real</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const st = statusOf(r.realRoas);
            const metaNote = r.flagged
              ? r.reconciliationDiffPct > 0
                ? 'Meta lo exagera'
                : 'Meta lo subestima'
              : null;
            return (
              <tr
                key={r.campaignId}
                className={r.flagged ? 'flagged' : ''}
                onClick={() => onDrill(r.campaignId)}
              >
                <td className="l">
                  <div className="c-name">
                    <span className="cc" style={{ background: campaignColor(i) }} />
                    <div>
                      <div className="cn-main">{r.name}</div>
                      <div className="cn-aud">
                        Canal: {r.channel}
                        {metaNote && (
                          <span
                            style={{
                              color:
                                r.reconciliationDiffPct > 0
                                  ? 'var(--amber)'
                                  : 'var(--dim)',
                              marginLeft: 8,
                            }}
                          >
                            · {metaNote}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="l">
                  <span className={'status-pill ' + st.k}>
                    <span className="sd" />
                    {st.label}
                  </span>
                </td>
                <td className="num">{formatCop(r.adSpend)}</td>
                <td className="num">{formatCop(r.attributedRevenue)}</td>
                <td className={'num roas-cell ' + (r.realRoas >= 1 ? 'good' : 'bad')}>
                  {formatRoas(r.realRoas)}
                </td>
                <td style={{ width: 30 }}>
                  <Icons.chevR className="go-drill" />
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td className="tf-label">Total · {rows.length} campañas</td>
            <td className="l">
              <span className={'status-pill ' + totStatus.k}>
                <span className="sd" />
                {totStatus.label}
              </span>
            </td>
            <td className="num">{formatCop(tot.spend)}</td>
            <td className="num">{formatCop(tot.attributed)}</td>
            <td className={'num roas-cell ' + (totReal >= 1 ? 'good' : 'bad')}>
              {formatRoas(totReal)}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
