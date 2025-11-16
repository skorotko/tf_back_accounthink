import { Body, Controller, Delete, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreateAllDto } from "./dto/create-all.dto";
import { RegistrationService } from "./registration.service";

@Controller('registration')
export class RegistrationController {

  constructor(private registrationService: RegistrationService) {}

  @ApiOperation({summary: 'Create all for company'})
  @ApiResponse({status: 200})
  @Post()
  create(@Body() dto: CreateAllDto) {
    return this.registrationService.registerCompany(dto);
  }

  @ApiOperation({summary: 'reset to default account tree in company'})
  @ApiResponse({status: 200})
  @Post('toDefault')
  resetToDefaultAccountTree(
    @Body() data: CreateAllDto
  ) {
    return this.registrationService.resetToDefaultAccountTree(data);
  }

  @ApiOperation({summary: 'Destroy Company COA'})
  @ApiResponse({status: 200})
  @Delete('clearCompanyCOA/:companyId')
  clearCompanyCOA(@Param('companyId') companyId: number) {
    return this.registrationService.clearAccountTree(companyId)
  }

  @ApiOperation({summary: 'deleted all transaction entry and transactions in company'})
  @ApiResponse({status: 200})
  @Delete('deleteTransactionTree/:companyId')
  clearTransactionByCompanyId (@Param('companyId') companyId: number) {
    return this.registrationService.clearTransactionByCompanyId(companyId)
  }

  @ApiOperation({summary: 'add group and account to company COA'})
  @ApiResponse({status: 200})
  @Post('addToCompanyCOA')
  addToCompanyCOA(
    @Body() data: {
      companyId: number,
      currencyId: number,
      dbCodeArr: Array<string>,
      notLikeArr: Array<string>
    }
  ) {
    return this.registrationService.addToCompanyCOA(data)
  }
}
