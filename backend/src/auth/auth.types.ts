export interface JwtPayload {
  sub: string;
  email: string;
  businessId: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  businessId: string;
}
