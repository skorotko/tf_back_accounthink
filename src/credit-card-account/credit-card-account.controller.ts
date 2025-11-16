import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { CreditCardAccountService } from "./credit-card-account.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreditCardAccount } from "./credit-card-account.model";
import { UpdateCreditCardAccountDto } from './dto/update-credit-card-account.dto';

@ApiTags('Bank Accounts')
@Controller('accounts-credit-card')
export class CreditCardAccountController {

  constructor(private creditCardAccountService: CreditCardAccountService) {}

  @ApiOperation({ summary: 'Update credit card account method' })
  @ApiResponse({ status: 200, type: CreditCardAccount })
  @Put('/:accountId')
  updateBankAccount(@Param('accountId') accountId: number, @Body() updateCreditCardAccountDto: UpdateCreditCardAccountDto) {
    return this.creditCardAccountService.updateCreditCardAccount(accountId, updateCreditCardAccountDto)
  }

}
