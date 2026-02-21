import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TransactionEntry } from './transaction-entry.model';
import { TransactionEntryService } from "./transaction-entry.service";

@ApiTags('Transaction entry')
@Controller('transaction-entry')
export class TransactionEntryController {
  constructor(private transactionEntryService: TransactionEntryService) {}

  @ApiOperation({ summary: 'Get transaction by accountId' })
  @ApiResponse({ status: 200, type: TransactionEntry })
  @Get('/:transactionId')
  getClassById(@Param('transactionId') transactionId: number) {
    return this.transactionEntryService.getTransactionEntryItemByTransactionId(transactionId)
  }

  @ApiOperation({ summary: 'Change report status' })
  @ApiResponse({ status: 200, type: 'list' })
  @Post('change/status')
  changeStatus(@Body() data: {
    transactionIdArr: Array<number>
  }) {
    return this.transactionEntryService.changeStatus(data.transactionIdArr)
  }

  @ApiOperation({ summary: 'Change reported status' })
  @ApiResponse({ status: 200 })
  @Post('change/status/reported')
  changeReportedStatusByTransactionId(@Body() data: {
    transactionIdArr: Array<number>,
    status: boolean
  }) {
    return this.transactionEntryService.changeReportedStatus(data.transactionIdArr, data.status)
  }
}