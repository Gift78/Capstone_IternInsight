import { Controller, Get, HttpException, Param } from '@nestjs/common';
import { CompanysService } from 'src/companys/service/companys/companys.service';

@Controller('companies')
export class CompanysController {
  constructor(private companyService: CompanysService) {}

  @Get()
  getCompanies() {
    return this.companyService.findCompanies();
  }

  @Get(':id')
  async getCompanyById(@Param('id') id: number) {
    if (isNaN(id)) {
      throw new HttpException('Post not found', 404);
    }

    const post = await this.companyService.findCompanyById(id);
    if (!post) {
      throw new HttpException('Post not found', 404);
    }
    return post;
  }
}
