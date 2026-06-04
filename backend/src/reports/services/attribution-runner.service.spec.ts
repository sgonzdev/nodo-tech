import { AttributionRunnerService } from './attribution-runner.service';
import { AttributionModel, AudienceOrigin, Channel } from '../../domain/enums';
import { ReportQueryDto } from '../dto/report-query.dto';

function repoReturning<T>(rows: T[]) {
  const qb: any = {
    where: () => qb,
    andWhere: () => qb,
    getMany: async () => rows,
  };
  return { createQueryBuilder: () => qb } as any;
}

function query(model: AttributionModel): ReportQueryDto {
  return Object.assign(new ReportQueryDto(), { model, windowDays: 30 });
}

describe('AttributionRunnerService', () => {
  const sale = {
    id: 's1',
    contactId: 'c1',
    amount: '1000',
    occurredAt: new Date('2026-01-31T00:00:00Z'),
  };
  const touch = (daysBefore: number, campaignId: string) => ({
    id: `t-${campaignId}-${daysBefore}`,
    contactId: 'c1',
    campaignId,
    channel: Channel.META,
    audienceOrigin: AudienceOrigin.FRIA,
    occurredAt: new Date(sale.occurredAt.getTime() - daysBefore * 86_400_000),
  });

  it('splits a sale across its touchpoints (linear) summing the amount', async () => {
    const service = new AttributionRunnerService(
      repoReturning([sale]),
      repoReturning([touch(10, 'A'), touch(5, 'B')]),
    );
    const credits = await service.run('biz', query(AttributionModel.LINEAR));
    const total = credits.reduce((s, c) => s + c.amount, 0);
    expect(Math.round(total)).toBe(1000);
    expect(credits.map((c) => c.campaignId).sort()).toEqual(['A', 'B']);
  });

  it('ignores touchpoints outside the attribution window', async () => {
    const service = new AttributionRunnerService(
      repoReturning([sale]),
      repoReturning([touch(40, 'OLD'), touch(3, 'NEW')]),
    );
    const credits = await service.run('biz', query(AttributionModel.LINEAR));
    expect(credits).toHaveLength(1);
    expect(credits[0].campaignId).toBe('NEW');
    expect(credits[0].amount).toBe(1000);
  });

  it('returns empty when there are no sales', async () => {
    const service = new AttributionRunnerService(
      repoReturning([]),
      repoReturning([]),
    );
    expect(await service.run('biz', query(AttributionModel.LINEAR))).toEqual(
      [],
    );
  });
});
