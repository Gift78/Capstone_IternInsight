import { Test, TestingModule } from '@nestjs/testing';
import { LoginController } from './login.controller';
import { LoginService } from '../service/login.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/typeorm/entities/user.entity';
import { Repository } from 'typeorm';

describe('LoginController', () => {
  let controller: LoginController;
  let service: LoginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        LoginService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<LoginController>(LoginController);
    service = module.get<LoginService>(LoginService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Add more tests as needed
});