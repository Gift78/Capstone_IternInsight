import { Test, TestingModule } from '@nestjs/testing';
import { LoginService } from './login.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/typeorm/entities/user.entity';
import { Repository } from 'typeorm';

describe('LoginService', () => {
  let service: LoginService;
  let repository: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<LoginService>(LoginService);
    repository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests as needed
});