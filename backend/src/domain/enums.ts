export enum Channel {
  META = 'meta',
  GOOGLE = 'google',
  TIKTOK = 'tiktok',
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  ORGANIC = 'organic',
}

export enum AudienceOrigin {
  FRIA = 'fria',
  WARM = 'warm',
  BASE_PROPIA = 'base_propia',
}

export enum AttributionModel {
  LINEAR = 'linear',
  TIME_DECAY = 'time_decay',
  POSITION_BASED = 'position_based',
}

export enum TaskStatus {
  ACCEPTED = 'accepted',
  DONE = 'done',
  DISMISSED = 'dismissed',
}

export const CHANNELS = Object.values(Channel);
export const AUDIENCE_ORIGINS = Object.values(AudienceOrigin);
export const ATTRIBUTION_MODELS = Object.values(AttributionModel);
