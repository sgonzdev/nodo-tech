import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_COOKIE } from '../auth.constants';
import { AuthUser, JwtPayload } from '../auth.types';

function fromCookie(req: Request): string | null {
  return req?.cookies?.[AUTH_COOKIE] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([fromCookie]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): AuthUser {
    return {
      userId: payload.sub,
      email: payload.email,
      businessId: payload.businessId,
    };
  }
}
