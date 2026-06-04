import { randomUUID } from 'crypto';
import { Channel } from '../domain/enums';
import { Rng } from './rng';
import {
  CAMPAIGN_SPECS,
  CampaignSpec,
  CONTACT_COUNT,
  TARGET_SALES,
} from './seed.config';

const DAY = 86_400_000;
const ORGANIC_TOUCH_RATE = 0.25;

export interface GeneratedData {
  contacts: { id: string; externalId: string; name: string; email: string }[];
  campaigns: {
    id: string;
    name: string;
    channel: Channel;
    adSpend: string;
    platformReportedRevenue: string;
    startDate: string;
    endDate: string;
  }[];
  touchpoints: {
    contactId: string;
    campaignId: string;
    channel: Channel;
    audienceOrigin: string;
    occurredAt: Date;
  }[];
  sales: { contactId: string; amount: string; occurredAt: Date }[];
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function generateData(now: Date, seed: number): GeneratedData {
  const rng = new Rng(seed);

  const contacts = Array.from({ length: CONTACT_COUNT }, (_, i) => ({
    id: randomUUID(),
    externalId: `startuptech-${1000 + i}`,
    name: `Cliente ${i + 1}`,
    email: `cliente${i + 1}@correo.co`,
  }));

  const campaigns = CAMPAIGN_SPECS.map((spec) => {
    const start = new Date(now.getTime() - spec.startOffsetDays * DAY);
    const end = new Date(start.getTime() + spec.durationDays * DAY);
    return {
      id: randomUUID(),
      name: spec.name,
      channel: spec.channel,
      adSpend: spec.adSpend.toFixed(2),
      platformReportedRevenue: spec.platformReportedRevenue.toFixed(2),
      startDate: isoDate(start),
      endDate: isoDate(end),
    };
  });

  const touchpoints = buildTouchpoints(rng, now, contacts, campaigns);
  const sales = buildSales(rng, now, contacts, campaigns, touchpoints);

  return { contacts, campaigns, touchpoints, sales };
}

function buildTouchpoints(
  rng: Rng,
  now: Date,
  contacts: GeneratedData['contacts'],
  campaigns: GeneratedData['campaigns'],
): GeneratedData['touchpoints'] {
  const result: GeneratedData['touchpoints'] = [];

  for (const contact of contacts) {
    const touchCount = rng.int(2, 7);
    for (let t = 0; t < touchCount; t++) {
      const idx = rng.int(0, campaigns.length - 1);
      const campaign = campaigns[idx];
      const spec = CAMPAIGN_SPECS[idx];
      const daysAgo = rng.int(1, spec.startOffsetDays);
      const isOrganic = rng.next() < ORGANIC_TOUCH_RATE;
      result.push({
        contactId: contact.id,
        campaignId: campaign.id,
        channel: isOrganic ? Channel.ORGANIC : campaign.channel,
        audienceOrigin: rng.weighted(spec.originMix),
        occurredAt: new Date(now.getTime() - daysAgo * DAY),
      });
    }
  }

  return result;
}

function buildSales(
  rng: Rng,
  now: Date,
  contacts: GeneratedData['contacts'],
  campaigns: GeneratedData['campaigns'],
  touchpoints: GeneratedData['touchpoints'],
): GeneratedData['sales'] {
  const sales: GeneratedData['sales'] = [];
  const byContact = new Map<string, GeneratedData['touchpoints']>();
  for (const tp of touchpoints) {
    const list = byContact.get(tp.contactId) ?? [];
    list.push(tp);
    byContact.set(tp.contactId, list);
  }

  const buyers = contacts.filter(() => true);
  while (sales.length < TARGET_SALES) {
    const contact = rng.pick(buyers);
    const path = byContact.get(contact.id);
    if (!path || path.length === 0) continue;

    const last = path.reduce((a, b) => (a.occurredAt > b.occurredAt ? a : b));
    const campaignIdx = campaigns.findIndex((c) => c.id === last.campaignId);
    const spec = CAMPAIGN_SPECS[campaignIdx] ?? CAMPAIGN_SPECS[0];
    const ticket = spec.avgTicket * (0.6 + rng.next() * 0.9);
    const saleTime = last.occurredAt.getTime() + rng.int(1, 7) * DAY;
    if (saleTime > now.getTime()) continue;

    sales.push({
      contactId: contact.id,
      amount: ticket.toFixed(2),
      occurredAt: new Date(saleTime),
    });
  }

  return sales;
}
