import { CampaignRow } from '@/lib/types';
import { formatCop, formatRoas, formatPct } from '@/lib/format';
import { campaignColor } from '@/lib/campaign-color';
import { Icons } from '@/components/atoms/Icons';

interface Props {
  rows: CampaignRow[];
  onDrill: (id: string) => void;
}

export function CampaignTable({ rows, onDrill }: Props) {
  const tot = rows.reduce(
    (a, r) => ({
      spend: a.spend + r.adSpend,
      attributed: a.attributed + r.attributedRevenue,
      platform: a.platform + r.platformRevenue,
    }),
    { spend: 0, attributed: 0, platform: 0 },
  );
  const totReal = tot.spend ? tot.attributed / tot.spend : 0;
  const totPlat = tot.spend ? tot.platform / tot.spend : 0;
  const totDiff = totReal ? ((totPlat - totReal) / totReal) * 100 : 0;

  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th className="l">Campaña</th>
            <th>Inversión</th>
            <th>Ingreso atribuido</th>
            <th>ROAS real</th>
            <th>ROAS plataforma</th>
            <th>Diferencia %</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.campaignId}
              className={r.flagged ? 'flagged' : ''}
              onClick={() => onDrill(r.campaignId)}
            >
              <td className="l">
                <div className="c-name">
                  <span className="cc" style={{ background: campaignColor(i) }} />
                  <div>
                    <div className="cn-main">
                      {r.name}
                      {r.realRoas < 1 && <span className="alert-tag">ROAS&lt;1</span>}
                    </div>
                    <div className="cn-aud">{r.channel}</div>
                  </div>
                </div>
              </td>
              <td className="num">{formatCop(r.adSpend)}</td>
              <td className="num">{formatCop(r.attributedRevenue)}</td>
              <td className={'num roas-cell ' + (r.realRoas >= 1 ? 'good' : 'bad')}>
                {formatRoas(r.realRoas)}
              </td>
              <td className="num roas-cell plat">{formatRoas(r.platformRoas)}</td>
              <td>
                <span className={'diff-badge ' + (r.flagged ? 'amber' : 'calm')}>
                  {r.flagged && '⚠'} {formatPct(r.reconciliationDiffPct)}
                </span>
              </td>
              <td style={{ width: 30 }}>
                <Icons.chevR className="go-drill" />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="tf-label">Blended · {rows.length} campañas</td>
            <td className="num">{formatCop(tot.spend)}</td>
            <td className="num">{formatCop(tot.attributed)}</td>
            <td className={'num roas-cell ' + (totReal >= 1 ? 'good' : 'bad')}>
              {formatRoas(totReal)}
            </td>
            <td className="num roas-cell plat">{formatRoas(totPlat)}</td>
            <td>
              <span className={'diff-badge ' + (Math.abs(totDiff) > 5 ? 'amber' : 'calm')}>
                {formatPct(totDiff)}
              </span>
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
