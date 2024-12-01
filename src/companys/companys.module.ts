import { Module } from '@nestjs/common';
import { CompanysController } from './controller/companys/companys.controller';
import { CompanysService } from './service/companys/companys.service';
import { CompanyEntity } from 'src/typeorm/entities/company.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEntity])],
  controllers: [CompanysController],
  providers: [CompanysService],
})
export class CompanysModule {}
