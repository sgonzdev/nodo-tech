import { api, buildQuery } from './api';
import {
  AudienceOriginRow,
  CampaignRow,
  CoreMetrics,
  DashboardFilters,
  Paginated,
  Recommendation,
  Task,
} from './types';

function filterQuery(filters: DashboardFilters): string {
  return buildQuery({ ...filters });
}

export const reportsApi = {
  metrics: (f: DashboardFilters) =>
    api.get<CoreMetrics>(`/reports/metrics${filterQuery(f)}`),
  byCampaign: (f: DashboardFilters) =>
    api.get<CampaignRow[]>(`/reports/by-campaign${filterQuery(f)}`),
  byAudienceOrigin: (f: DashboardFilters) =>
    api.get<AudienceOriginRow[]>(`/reports/by-audience-origin${filterQuery(f)}`),
  drilldown: (id: string, page = 1) =>
    api.get<DrilldownResponse>(
      `/reports/campaign/${id}/drilldown${buildQuery({ page })}`,
    ),
};

function recToTask(rec: Recommendation) {
  return {
    title: rec.title,
    context: rec.context,
    owner: rec.owner,
    cta: rec.cta,
    sourceRule: rec.rule,
  };
}

export const actionCenterApi = {
  recommendations: (f: DashboardFilters) =>
    api.get<Recommendation[]>(`/action-center/recommendations${filterQuery(f)}`),
  tasks: (page = 1) =>
    api.get<Paginated<Task>>(`/action-center/tasks${buildQuery({ page })}`),
  accept: (rec: Recommendation) =>
    api.post<Task>('/action-center/tasks', recToTask(rec)),
  dismiss: (rec: Recommendation) =>
    api.post<Task>('/action-center/recommendations/dismiss', recToTask(rec)),
  complete: (id: string) =>
    api.patch<Task>(`/action-center/tasks/${id}`, { status: 'done' }),
  remove: (id: string) => api.delete<void>(`/action-center/tasks/${id}`),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ email: string }>('/auth/login', { email, password }),
  me: () => api.get<{ email: string; businessId: string }>('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export interface DrilldownTouchpoint {
  id: string;
  channel: string;
  audienceOrigin: string;
  occurredAt: string;
}

export interface DrilldownResponse {
  campaign: { id: string; name: string; channel: string };
  touchpoints: Paginated<DrilldownTouchpoint>;
  sales: { id: string; amount: string; occurredAt: string }[];
}
