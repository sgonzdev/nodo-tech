import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AUTH_COOKIE } from '../utils/auth.constants';
import { authCookieOptions } from '../utils/cookie.options';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { AuthUser } from '../utils/auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.register(dto);
    this.setCookie(res, user);
    return { email: user.email, businessId: user.businessId };
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.validate(dto);
    this.setCookie(res, user);
    return { email: user.email, businessId: user.businessId };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE, { path: '/' });
    return { ok: true };
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.auth.profile(user);
  }

  private setCookie(res: Response, user: AuthUser) {
    res.cookie(AUTH_COOKIE, this.auth.signToken(user), authCookieOptions());
  }
}
