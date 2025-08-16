import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LoginController } from './controller/login.controller';
import { LoginService } from './service/login.service';
import { UserEntity } from 'src/typeorm/entities/user.entity';
import { AdminEntity } from 'src/typeorm/entities/admin.entity';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserEntity, AdminEntity]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [LoginController],
  providers: [LoginService, JwtStrategy],
})
export class LoginModule {}