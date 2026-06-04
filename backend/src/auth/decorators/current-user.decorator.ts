import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../utils/auth.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    return ctx.switchToHttp().getRequest().user;
  },
);

export const CurrentBusiness = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    return ctx.switchToHttp().getRequest().user.businessId;
  },
);
