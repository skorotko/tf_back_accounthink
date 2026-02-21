import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TaxAccountService } from "./tax-account.service";
import { GetTaxAccountsDto } from "./dto/get-tax-accounts.dto";
import { CreateTaxAccountDto } from "./dto/create-tax-account.dto";

@ApiTags('Tax Account')
@Controller('tax-account')
export class TaxAccountController {
  constructor(private taxAccountService: TaxAccountService) {}

  @ApiOperation({ summary: '' })
  @ApiResponse({})
  @Get('tax-list/:countryId/:companyId/:taxTopType')
  getCompanyTaxWithCreatedAccountMark (@Param() params: GetTaxAccountsDto) {
    return this.taxAccountService.getAllByCountryWithCheckCreatedForCompany(params)
  }

  @ApiOperation({})
  @ApiResponse({})
  @Get('tax-list/selected/:countryId/:companyId/:taxTopType')
  getSelectedInCompanyTax (@Param() params: GetTaxAccountsDto) {
    return this.taxAccountService.getAllSelectedInCompany(params)
  }

  @ApiOperation({ summary: 'Create company tax account' })
  @ApiResponse({ status: 200 })
  @Post('create')
  createCompanyTaxAccounts (@Body() data: CreateTaxAccountDto) {
    // console.log(`\nTHIS tax-account create controller\n`);
    return this.taxAccountService.create(data)
  }

  @ApiOperation({ summary: 'Get tax accounts for client/vendor directories' })
  @ApiResponse({ status: 200 })
  @Get('client-vendor/tax-list/:companyId')
  getTaxAccountsForClientAndVendorDirectories(@Param() params: {
    companyId: number
  }) {
    return this.taxAccountService.getAllTaxAccountsForCompanyVendorClientDirectories(params.companyId)
  }

  @ApiOperation({ summary: 'Get tax-account by id' })
  @ApiResponse({ status: 200 })
  @Get('by-id/:id')
  getAccountById(@Param() param: {
    id: string
  }) {
    return this.taxAccountService.findById(JSON.parse(param.id))
  }

  @ApiOperation({ summary: 'Get tax-account by id and companyId' })
  @ApiResponse({ status: 200 })
  @Get('company/by-id/:id/:companyId')
  getAccountByIdAndCompanyId(@Param() param: {
    companyId: number,
    id: string
  }) {
    return this.taxAccountService.findByIdArrAndCompanyId(JSON.parse(param.id), param.companyId)
  }

  @ApiOperation({ summary: 'Create company all tax accounts' })
  @ApiResponse({ status: 200 })
  @Post('create-all')
  createCompanyAllTaxAccounts (@Body() data: {
    countryId: number,
    companyId: number,
    currencyId: number
  }) {
    console.log(`createCompanyAllTaxAccounts: ${JSON.stringify(data)}`);
    return this.taxAccountService.createAllTaxAccountsForCompany(data)
  }
}
