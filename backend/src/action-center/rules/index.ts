import { Rule, RuleInput } from '../recommendation.types';

const cop = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);

const roasBelowOne: Rule = ({ campaigns }) =>
  campaigns
    .filter((c) => c.adSpend > 0 && c.realRoas < 1)
    .map((c) => ({
      rule: 'roas_below_one',
      title: `Pausar o redistribuir presupuesto de ${c.name}`,
      context: `ROAS real ${c.realRoas} (ingreso atribuido ${cop(
        c.attributedRevenue,
      )} sobre inversión ${cop(c.adSpend)}). La campaña no recupera su gasto.`,
      owner: 'Performance',
      cta: 'Revisar y reasignar presupuesto',
    }));

const bestAudienceOrigin: Rule = ({ audienceOrigins }) => {
  const best = audienceOrigins[0];
  if (!best || best.realRoas < 1) return [];
  return [
    {
      rule: 'best_audience_origin',
      title: `Subir presupuesto a reactivación de ${best.audienceOrigin}`,
      context: `El origen ${best.audienceOrigin} tiene el mejor ROAS real (${best.realRoas}) con ingreso atribuido ${cop(best.attributedRevenue)}.`,
      owner: 'Growth',
      cta: 'Escalar inversión en este origen',
    },
  ];
};

const reconciliationGap: Rule = ({ campaigns }) =>
  campaigns
    .filter((c) => c.flagged && c.platformRevenue > c.attributedRevenue)
    .map((c) => ({
      rule: 'reconciliation_gap',
      title: `Revisar atribución del píxel en ${c.name}`,
      context: `La plataforma reporta ${cop(c.platformRevenue)} pero el POS solo confirma ${cop(c.attributedRevenue)} (diferencia ${c.reconciliationDiffPct}%).`,
      owner: 'Analítica',
      cta: 'Auditar conversiones del píxel',
    }));

export const RULES: Rule[] = [
  roasBelowOne,
  bestAudienceOrigin,
  reconciliationGap,
];

export function runRules(input: RuleInput) {
  return RULES.flatMap((rule) => rule(input));
}
