import { Controller, Body, HttpCode, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookie(res: Response, accessToken: string) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({passthrough: true}) res: Response,
  ) {
    const { accessToken } = await this.authService.register(email, password);
    this.setAuthCookie(res, accessToken);
    
    return { email };
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body('email') email: string, 
    @Body('password') password: string, 
    @Res({ passthrough: true }) res: Response) {
    const { accessToken } = await this.authService.login(email, password);
    this.setAuthCookie(res, accessToken);
    
    return { email };
  }
}
