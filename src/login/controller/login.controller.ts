import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { LoginService } from '../service/login.service';

@Controller('login')
export class LoginController {
  constructor(private loginService: LoginService) {}

  @Post()
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.loginService.validateUser(body.username, body.password);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return this.loginService.login(user);
  }

  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    try {
      return await this.loginService.refreshToken(body.refresh_token);
    } catch (e) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }
  }
}