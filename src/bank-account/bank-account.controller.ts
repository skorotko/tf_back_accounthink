import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { BankAccountService } from "./bank-account.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { BankAccount } from "./bank-account.model";
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@ApiTags('Bank Accounts')
@Controller('accounts-bank')
export class BankAccountController {

  constructor(private bankAccountService: BankAccountService) {}

  @ApiOperation({ summary: 'Update bank account method' })
  @ApiResponse({ status: 200, type: BankAccount })
  @Put('/:accountId')
  updateBankAccount(@Param('accountId') accountId: number, @Body() updateBankAccountDto: UpdateBankAccountDto) {
    return this.bankAccountService.updateBankAccount(accountId, updateBankAccountDto)
  }

  @ApiOperation({ summary: 'Get account only bank by companyId' })
  @ApiResponse({ status: 200, type: BankAccount })
  @Get('/:accountId')
  getAccountOnlyBankItem(@Param('accountId') accountId: number) {
    return this.bankAccountService.itemBankAccount(accountId)
  }

  @ApiOperation({ summary: 'Get transaction for bank account by accountId' })
  @ApiResponse({ status: 200, type: BankAccount })
  @Get('transaction/:companyId/:accountId/:startDate/:endDate')
  getTransactionBankAccount(@Param() params: {
      companyId: number,
      accountId: number,
      startDate: string,
      endDate: string
    }) {
    return this.bankAccountService.getTransactionBankAccount(params)
  }

  @ApiOperation({ summary: 'Get transaction for bank account by accountId' })
  @ApiResponse({ status: 200, type: BankAccount })
  @Get('allTransaction/:companyId/:startDate/:endDate')
  getAllTransactionBankAccount(@Param() params: {
    companyId: number,
    startDate: string,
    endDate: string
  }) {
    // console.log('this?');
    return this.bankAccountService.getAllTransactionBankAccount(params)
  }

}
