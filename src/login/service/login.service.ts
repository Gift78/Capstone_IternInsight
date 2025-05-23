import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/typeorm/entities/user.entity';
import { AdminEntity } from 'src/typeorm/entities/admin.entity';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(AdminEntity)
    private adminRepository: Repository<AdminEntity>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return { ...user, role: 'user' };
    }

    const admin = await this.adminRepository.findOne({ where: { username } });
    if (admin && (await bcrypt.compare(password, admin.password))) {
      return { ...admin, role: 'admin' };
    }

    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '1d' });

    return {
      user,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }



  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      let user: UserEntity | AdminEntity | null =
        await this.userRepository.findOne({ where: { id: payload.sub } });
      let role = 'user';
      if (!user) {
        user = await this.adminRepository.findOne({
          where: { id: payload.sub },
        });
        role = 'admin';
      }
      if (!user) {
        throw new Error('User not found');
      }
      const newPayload = { username: user.username, sub: user.id, role: role };
      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: '1h',
      });
      return {
        access_token: newAccessToken,
      };
    } catch (e) {
      throw new Error('Invalid refresh token' + e.message);
    }
  }

  // resetPassword(body.email) to send email to user to reset password
  async sendVerifyEmail(email: string): Promise<string> {
    // find password in database by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    // find password in database by email
    const newPassword = user.password;

    // (1) ส่งอีเมล
    const transporter = nodemailer.createTransport({
      service: 'gmail', // หรือ smtp อื่น ๆ
      auth: {
        user: 'wimonsiri1352@gmail.com',
        pass: 'clfz zamx fxdy fmny',
      },
    });

    const mailOptions = {
      from: 'wimonsiri1352@gmail.com',
      to: email,
      //subject bold and red color
      subject: 'Verify code',
      html: `<h1 style="color: orange;">Your verify code is: ${newPassword}</h1>`,
      text: `Your new verify code is: ${newPassword}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      return 'Password reset email sent.';
    } catch (error) {
      // console.error('Failed to send email:', error);
      throw new BadRequestException('Unable to send reset email.');
    }
  }

  // @Body() body: { email: string; verifyCode: string; newPassword: string }, resetPassword
  async resetPassword(
    email: string,
    verifyCode: string,
    newPassword: string,
  ): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    // console log verifyCode and user.password

    if (user.password !== verifyCode) {
      throw new BadRequestException('Invalid verification code');
    }
    // hash password with bcrypt
    user.password = await bcrypt.hash(newPassword, 10);

    await this.userRepository.save(user);
    return 'Password reset successfully';
  }

  async updateImageUrl(email: string, imageUrl: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.image = imageUrl;
    await this.userRepository.save(user);
    return 'Image updated successfully';
  }
  //send email to user when login
  async sendLoginNotification(username: string): Promise<string> {
    // ค้นหาผู้ใช้ในฐานข้อมูลด้วย username
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // ดึงอีเมลของผู้ใช้จากฐานข้อมูล
    const userEmail = user.email;

    // ดึงวันที่และเวลาปัจจุบัน
    const loginDate = new Date();
    const formattedDate = loginDate.toLocaleString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });

    // สร้าง email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // หรือ smtp อื่น ๆ
      auth: {
        user: 'wimonsiri1352@gmail.com',
        pass: 'clfz zamx fxdy fmny',
      },
    });

    // สร้างเนื้อหาอีเมล
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: userEmail,
      subject: 'แจ้งเตือนการเข้าสู่ระบบ',
      html: `
        <div style="font-family: 'Prompt', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4285f4; text-align: center;">แจ้งเตือนการเข้าสู่ระบบ</h1>
          <div style="padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <p>Hello ${user.name || user.username},</p>
            <p>มีการเข้าสู่ระบบในบัญชีของคุณ</p>
            <p><strong>เวลา:</strong> ${formattedDate}</p>
            <p>หากเป็นการเข้าสู่ระบบโดยคุณ คุณสามารถละเว้นข้อความนี้ได้ แต่หากไม่ใช่คุณ โปรดเปลี่ยนรหัสผ่านของคุณทันที</p>
            <p>คำแนะนำเพื่อความปลอดภัย:</p>
            <ul>
              <li>ใช้รหัสผ่านที่ซับซ้อนและไม่ซ้ำกับที่อื่น</li>
              <li>อย่าเปิดเผยข้อมูลการเข้าสู่ระบบของคุณกับผู้อื่น</li>
            </ul>
          </div>
          <p style="text-align: center; font-size: 12px; color: #888;">นี่เป็นข้อความอัตโนมัติ โปรดอย่าตอบกลับอีเมลนี้</p>
        </div>
      `,
    };
    try {
      await transporter.sendMail(mailOptions);
      return 'ส่งอีเมลแจ้งเตือนการเข้าสู่ระบบเรียบร้อย';
    } catch (error) {
      console.error('ไม่สามารถส่งอีเมลแจ้งเตือนได้:', error);
      throw new BadRequestException(
        'ไม่สามารถส่งอีเมลแจ้งเตือนการเข้าสู่ระบบได้',
      );
    }
  }
}
