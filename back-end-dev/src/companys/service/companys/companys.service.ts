import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyEntity } from 'src/typeorm/entities/company.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CompanysService {
  constructor(
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
  ) {}

  findCompanies(): Promise<CompanyEntity[]> {
    return this.companyRepository.find();
  }

  async findCompanyById(id: number): Promise<CompanyEntity | undefined> {
    return this.companyRepository.findOne({
      where: { id },
    });
  }
}
