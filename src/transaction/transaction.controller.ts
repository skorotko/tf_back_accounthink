import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { TransactionService } from "./transaction.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Transaction } from "./transaction.model";
import { CreateOpenBalanceTransactionDto } from './dto/create-open-balance-transaction.dto';
import { CreateOpenBalanceAllocationTransactionDto } from './dto/create-open-balance-allocation-transaction.dto';
import { CreateJournalEntriesTransactionDto } from './dto/create-journal-entries-transaction.dto';
import { UpdateOpenBalanceTransactionDto } from './dto/update-open-balance-transaction.dto';
import { InlineChangeNameTemplateTransactionDto } from './dto/inline-change-name-template-transaction.dto'
@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  // @ApiOperation({summary: 'Create transaction method'})
  // @ApiResponse({status: 200, type: Transaction})
  // @Post()
  // create(@Body() transactionDto: CreateTransactionDto) {
  //   return this.transactionService.createTransaction(transactionDto)
  // }

  @ApiOperation({ summary: 'Create transaction open balance method' })
  @ApiResponse({ status: 200, type: Transaction })
  @Post('/openBalance')
  createOpenBalance(
    @Body() transactionOpenBalanceDto: CreateOpenBalanceTransactionDto,
  ) {
    return this.transactionService.createOpenBalanceTransaction(
      transactionOpenBalanceDto,
    );
  }

  @ApiOperation({ summary: 'Update transaction open balance method' })
  @ApiResponse({ status: 200, type: Transaction })
  @Put('/openBalance/:id')
  updateOpenBalance(
    @Param('id') id: number,
    @Body() transactionOpenBalanceDto: UpdateOpenBalanceTransactionDto,
  ) {
    return this.transactionService.updateOpenBalanceTransaction(
      id,
      transactionOpenBalanceDto,
    );
  }

  @ApiOperation({ summary: 'Post transaction open balance method' })
  @ApiResponse({ status: 200, type: Transaction })
  @Get('/openBalancePost/:id')
  postOpenBalance(@Param('id') id: number) {
    return this.transactionService.postOpenBalanceTransaction(id);
  }

  @ApiOperation({
    summary: 'Create transaction open balance allocation method',
  })
  @ApiResponse({ status: 200, type: Transaction })
  @Post('/openBalanceAllocation')
  createOpenBalanceAllocation(
    @Body()
    transactionOpenBalanceAllocationDto: CreateOpenBalanceAllocationTransactionDto,
  ) {
    return this.transactionService.createOpenBalanceAllocationTransaction(
      transactionOpenBalanceAllocationDto,
    );
  }

  @ApiOperation({ summary: 'Get transaction by id' })
  @ApiResponse({ status: 200, type: Transaction })
  @Get('/transactionById/:transactionId')
  getTransactionById(@Param('transactionId') transactionId: number) {
    return this.transactionService.getTransactionItemById(transactionId);
  }

  @ApiOperation({ summary: 'Get transaction list by id list' })
  @ApiResponse({ status: 200, type: Transaction })
  @Get('transactionList/:companyId/:transactionId')
  getTransactionByIdList(
    @Param('companyId') companyId: number,
    @Param('transactionId') transactionId: number,
  ) {
    return this.transactionService.getTransactionListByIdList(
      companyId,
      transactionId,
    );
  }

  @ApiOperation({ summary: 'Get transaction by id' })
  @ApiResponse({ status: 200, type: Transaction })
  @Get('/:accountId')
  getTransactionByAccountId(@Param('accountId') accountId: number) {
    return this.transactionService.getTransactionItemByAccountId(accountId);
  }

  @ApiOperation({ summary: 'Delete transaction method' })
  @ApiResponse({ status: 200, type: Transaction })
  @Delete('/:transactionId')
  deleteTransaction(@Param('transactionId') transactionId: number) {
    return this.transactionService.deleteTransaction(transactionId);
  }

  @ApiOperation({ summary: 'Delete transaction method' })
  @ApiResponse({ status: 200, type: Transaction })
  @Get('/isDelete/:transactionId')
  isDeleteTransaction(@Param('transactionId') transactionId: number) {
    return this.transactionService.isDeleteTransaction(transactionId);
  }

  @ApiOperation({ summary: 'set sent-to-accountant' })
  @ApiResponse({ status: 200, type: Transaction })
  @Get('send-to-accountant/:transactionId')
  setSendToAccountant(@Param('transactionId') transactionId: number) {
    return this.transactionService.setSendToAccountant(transactionId);
  }

  @ApiOperation({ summary: 'Delete transaction method' })
  @ApiResponse({ status: 200, type: Transaction })
  @Delete('/record/:transactionId')
  deleteTransactionRecord(@Param('transactionId') transactionId: number) {
    return this.transactionService.deleteTransactionRecord(transactionId);
  }

  @ApiOperation({ summary: 'Delete transaction method' })
  @ApiResponse({ status: 200, type: Transaction })
  @Get('/reverse/:transactionId')
  reverseTransaction(@Param('transactionId') transactionId: number) {
    return this.transactionService.reverseTransaction(transactionId);
  }

  @ApiOperation({ summary: 'Delete transaction method' })
  @ApiResponse({ status: 200, type: Transaction })
  @Get('/reverseCron/:transactionId/:cronDate')
  reverseTransactionCron(
    @Param('transactionId') transactionId: number,
    @Param('cronDate') cronDate: number,
  ) {
    return this.transactionService.reverseTransactionCron(
      transactionId,
      cronDate,
    );
  }

  @ApiOperation({ summary: 'Delete transaction method' })
  @ApiResponse({ status: 200, type: Transaction })
  @Delete('/openBalance/:accountId')
  deleteTransactionOpenBalance(@Param('accountId') accountId: number) {
    return this.transactionService.deleteTransactionOpenBalance(accountId);
  }

  @ApiOperation({ summary: 'Create transaction journal method' })
  @ApiResponse({ status: 200, type: Transaction })
  @Post('/createJournalEntriesTransaction')
  createJournalEntriesTransaction(
    @Body() transactionJournalEntriesDto: CreateJournalEntriesTransactionDto,
  ) {
    return this.transactionService.createJournalEntriesTransaction(
      transactionJournalEntriesDto,
    );
  }

  @ApiOperation({ summary: 'Create transaction journal method' })
  @ApiResponse({ status: 200, type: Transaction })
  @Post('/createMultipleJournalEntries')
  createMultipleJournalEntries(
    @Body() data: CreateJournalEntriesTransactionDto[],
  ) {
    return this.transactionService.createMultipleJournalEntries(data);
  }

  @ApiOperation({ summary: 'transaction journal directories' })
  @ApiResponse({ status: 200 })
  @Get('journal/directories/:companyId')
  getTransactionJournalDirectories(@Param('companyId') companyId: number) {
    return this.transactionService.getTransactionJournalDirectories(companyId);
  }

  @ApiOperation({ summary: 'Update transaction journal method' })
  @ApiResponse({ status: 200, type: Transaction })
  @Post('/updateJournalEntriesTransaction/:transactionId')
  updateJournalEntriesTransaction(
    @Param('transactionId') transactionId: number,
    @Body() transactionJournalEntriesDto: CreateJournalEntriesTransactionDto,
  ) {
    return this.transactionService.updateJournalEntriesTransaction(
      transactionJournalEntriesDto,
      transactionId,
    );
  }

  @ApiOperation({ summary: 'Update transaction journal method' })
  @ApiResponse({ status: 200, type: Transaction })
  @Post('/inlineChangeNameTemplateTransaction/:transactionId')
  inlineChangeNameTemplateTransaction(
    @Param('transactionId') transactionId: number,
    @Body()
    InlineChangeNameTemplateTransactionDto: InlineChangeNameTemplateTransactionDto,
  ) {
    return this.transactionService.inlineChangeNameTemplateTransaction(
      InlineChangeNameTemplateTransactionDto,
      transactionId,
    );
  }

  @ApiOperation({ summary: 'Install check transaction journal method' })
  @ApiResponse({ status: 200, type: Transaction })
  @Get('/checkJournalEntriesTransaction/:transactionId/:userId')
  checkJournalEntriesTransaction(
    @Param('transactionId') transactionId: number,
    @Param('userId') userId: number,
  ) {
    return this.transactionService.checkTransaction(transactionId, userId);
  }

  @ApiOperation({ summary: 'Install check transaction journal method' })
  @ApiResponse({ status: 200, type: Transaction })
  @Get('/getJournalEntriesTransactionRefTag/:companyId')
  getJournalEntriesTransactionRefTag(@Param('companyId') companyId: number) {
    return this.transactionService.getJournalEntriesTransactionRefTag(
      companyId,
    );
  }

  @ApiOperation({ summary: 'Install record transaction journal method' })
  @ApiResponse({ status: 200, type: Transaction })
  @Get('/recorderJournalEntriesTransaction/:transactionId/:userId')
  recorderJournalEntriesTransaction(
    @Param('transactionId') transactionId: number,
    @Param('userId') userId: number,
  ) {
    return this.transactionService.recorderJournalEntriesTransaction(
      transactionId,
      userId,
    );
  }

  @ApiOperation({ summary: '' })
  @ApiResponse({ status: 200, type: 'boolean' })
  @Get('check-account/:companyId/:accountId')
  checkAccountTransaction(params: { companyId: number; accountId: number }) {
    return this.transactionService.checkAccount(
      params.companyId,
      params.accountId,
    );
  }

  @ApiOperation({ summary: '' })
  @ApiResponse({ status: 200, type: 'boolean' })
  @Post('blocked')
  blocked(
    @Body()
    blockedParams: {
      companyId: number;
      lockAccountingPeriodTo: string;
    },
  ) {
    return this.transactionService.blocked(blockedParams);
  }

  @Post('blocked/TranIdArr')
  blockedTranIdArr(
    @Body()
    blockedParams: {
      tranIdArr: [];
    },
  ) {
    return this.transactionService.blockedTranIdArr(blockedParams.tranIdArr);
  }
}
