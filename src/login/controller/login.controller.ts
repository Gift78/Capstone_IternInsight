import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { LoginService } from '../service/login.service';

@Controller('login')
export class LoginController {
  constructor(private loginService: LoginService) {}

  @Post()
  async login(
    @Body() body: { username: string; password: string },
    @Res() res: Response,
  ) {
    const uservalid = await this.loginService.validateUser(
      body.username,
      body.password,
    );
    if (!uservalid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    } else {
      const { user, access_token, refresh_token } =
        await this.loginService.login(uservalid);

      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return res.json({ user, access_token });
    }
  }

  @Post('refresh')
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new HttpException(
        'Refresh token not found',
        HttpStatus.UNAUTHORIZED,
      );
    }
    try {
      return await this.loginService.refreshToken(refreshToken);
    } catch (err) {
      throw new HttpException(
        'Invalid refresh token ' + err.message,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
