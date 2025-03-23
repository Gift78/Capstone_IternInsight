import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/typeorm/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { log } from 'console';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({ where: { username } });
    log(user);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  async login(user: UserEntity) {
    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
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
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new Error('User not found');
      }
      const newPayload = { username: user.username, sub: user.id };
      const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
      return {
        access_token: newAccessToken,
      };
    } catch (e) {
      throw new Error('Invalid refresh token');
    }
  }
}