import Link from 'next/link';
import { CampaignRow } from '@/lib/types';
import { formatCop, formatPct, formatRoas } from '@/lib/format';

interface Props {
  rows: CampaignRow[];
}

export function CampaignTable({ rows }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-left text-xs text-slate-400">
            <Th>Campaña</Th>
            <Th right>Inversión</Th>
            <Th right>Ingreso atribuido</Th>
            <Th right>ROAS real</Th>
            <Th right>ROAS plataforma</Th>
            <Th right>Diferencia</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.campaignId}
              className={`border-b border-slate-800/60 ${
                r.flagged ? 'bg-amber-500/5' : ''
              }`}
            >
              <Td>
                <span className="font-medium">{r.name}</span>
                <span className="ml-2 text-xs uppercase text-slate-500">
                  {r.channel}
                </span>
              </Td>
              <Td right>{formatCop(r.adSpend)}</Td>
              <Td right>{formatCop(r.attributedRevenue)}</Td>
              <Td right>
                <span
                  className={
                    r.realRoas < 1 ? 'text-rose-400' : 'text-emerald-400'
                  }
                >
                  {formatRoas(r.realRoas)}
                </span>
              </Td>
              <Td right>
                <span className="text-sky-400">
                  {formatRoas(r.platformRoas)}
                </span>
              </Td>
              <Td right>
                <span
                  className={
                    r.flagged
                      ? 'rounded bg-amber-500/15 px-2 py-0.5 text-amber-300'
                      : 'text-slate-300'
                  }
                >
                  {formatPct(r.reconciliationDiffPct)}
                </span>
              </Td>
              <Td right>
                <Link
                  href={`/campaign/${r.campaignId}`}
                  className="text-emerald-400 hover:underline"
                >
                  Ver detalle
                </Link>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  right,
}: {
  children?: React.ReactNode;
  right?: boolean;
}) {
  return (
    <th className={`px-4 py-3 font-medium ${right ? 'text-right' : ''}`}>
      {children}
    </th>
  );
}

function Td({
  children,
  right,
}: {
  children?: React.ReactNode;
  right?: boolean;
}) {
  return (
    <td className={`px-4 py-3 ${right ? 'text-right' : ''}`}>{children}</td>
  );
}
