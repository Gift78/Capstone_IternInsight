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
  constructor(
    private loginService: LoginService,
    private UsersService: LoginService,
  ) {}

  @Post()
  async login(
    @Body() body: { username: string; password: string },
    @Res() res: Response,
  ) {
    // เช็คว่ามี username และ password ส่งมาครบหรือไม่
    if (!body.username || !body.password) {
      // ถ้าไม่มี ให้ throw error กลับเป็น 400 Bad Request
      throw new HttpException(
        'Username and password are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userValid = await this.loginService.validateUser(
      body.username,
      body.password,
    );
    if (!userValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    } else {
      const { user, access_token, refresh_token } =
        await this.loginService.login(userValid);

      // ส่งอีเมลแจ้งเตือนการเข้าสู่ระบบ
      try {
        await this.loginService.sendLoginNotification(body.username);
      } catch (error) {
        console.error('Error sending login notification email:', error);
        // ไม่ throw exception เพื่อให้ login สำเร็จแม้การส่งอีเมลจะล้มเหลว
      }
      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      return res.status(200).json({
        // <-- กำหนด status 200 OK
        message: 'Login successful',
        user,
        access_token,
      });
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

  // use get to send email to user to reset password
  @Post('send-verify-email')
  async sendVerifyEmail(@Body() body: { email: string }) {
    const user = await this.loginService.sendVerifyEmail(body.email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'send-verify-email' };
  }
  // use post to reset password by get verify code from email and new password
  @Post('reset-password')
  async resetPassword(
    @Body() body: { email: string; verifyCode: string; newPassword: string },
  ) {
    const user = await this.loginService.resetPassword(
      body.email,
      body.verifyCode,
      body.newPassword,
    );
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return { message: '🔐 Password updated!' };
  }
  @Post('update_image')
  async updateImageUrl(@Body() body: { email: string; imageUrl: string }) {
    const user = await this.loginService.updateImageUrl(
      body.email,
      body.imageUrl,
    );
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Profile picture updated successfully' };
  }
}
