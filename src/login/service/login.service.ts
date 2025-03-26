import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/typeorm/entities/user.entity';
import { AdminEntity } from 'src/typeorm/entities/admin.entity';
import { JwtService } from '@nestjs/jwt';


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
    if (user && user.password === password) {
      return { ...user, role: 'user' };
    }

    const admin = await this.adminRepository.findOne({ where: { username } });
    if (admin && admin.password === password) {
      return { ...admin, role: 'admin' };
    }

    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7h' });

    return {
      user,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      let user: UserEntity | AdminEntity | null = await this.userRepository.findOne({ where: { id: payload.sub } });
      let role = 'user';
      if (!user) {
        user = await this.adminRepository.findOne({ where: { id: payload.sub } });
        role = 'admin';
      }
      if (!user) {
        throw new Error('User not found');
      }
      const newPayload = { username: user.username, sub: user.id, role: role };
      const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
      return {
        access_token: newAccessToken,
      };
    } catch (e) {
      throw new Error('Invalid refresh token');
    }
  }
}