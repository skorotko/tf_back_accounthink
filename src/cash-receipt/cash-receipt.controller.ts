import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CashReceiptDetailsService } from 'src/cash-receipt/cash-receipt-details/cash-receipt-details.service';
import { CreateCashReceiptDetailsDto } from 'src/cash-receipt/cash-receipt-details/dto/create-cash-receipt-details.dto';
import { CashReceiptHeaderService } from 'src/cash-receipt/cash-receipt-header/cash-receipt-header.service';
import { CreateCashReceiptHeaderDto } from 'src/cash-receipt/cash-receipt-header/dto/create-cash-receipt-header.dto';
import { RecordCashReceiptHeaderDto } from 'src/cash-receipt/cash-receipt-header/dto/record-cash-receipt-header.dto';
import { CashReceiptPaymentsService } from 'src/cash-receipt/cash-receipt-payments/cash-receipt-payments.service';
import { CreateCashReceiptPaymentsDto } from 'src/cash-receipt/cash-receipt-payments/dto/create-cash-receipt-payments.dto';
import { UpdateCashReceiptHeaderDto } from './cash-receipt-header/dto/update-cash-receipt-header.dto';
import { CashReceiptOverPaymentsService } from './cash-receipt-overPayments/cash-receipt-overPayments.service';
import { CreateCashReceiptOverPaymentsDto } from './cash-receipt-overPayments/dto/create-cash-receipt-overPayments.dto';
import { CashReceiptService } from './cash-receipt.service';

@Controller('cash-receipt')
export class CashReceiptController {
  constructor(
    private readonly cashReceiptHeaderService: CashReceiptHeaderService,
    private readonly cashReceiptPaymentsService: CashReceiptPaymentsService,
    private readonly cashReceiptDetailsService: CashReceiptDetailsService,
    private readonly cashReceiptOverPaymentsService: CashReceiptOverPaymentsService,
    private readonly cashReceiptService: CashReceiptService,
  ) {}

  @Post('header/create')
  async createHeader(@Body() dto: CreateCashReceiptHeaderDto) {
    return this.cashReceiptHeaderService.create(dto);
  }

  @Post('payment/create')
  async createPayment(@Body() dto: CreateCashReceiptPaymentsDto) {
    return this.cashReceiptPaymentsService.bulkCreate(dto);
  }

  @Post('detail/create')
  async createDetail(@Body() dto: CreateCashReceiptDetailsDto) {
    return this.cashReceiptDetailsService.bulkCreate(dto);
  }

  @Post('overPayment/create')
  async createOverPayment(@Body() dto: CreateCashReceiptOverPaymentsDto) {
    return this.cashReceiptOverPaymentsService.bulkCreate(dto);
  }

  @Put('update/:cashReceiptHeaderId')
  async updateHeader(
    @Param('cashReceiptHeaderId') cashReceiptHeaderId: number,
    @Body() dto: UpdateCashReceiptHeaderDto,
  ) {
    const cashReceiptPaymentsDestroy =
      this.cashReceiptPaymentsService.destroyCashReceiptPayments(
        cashReceiptHeaderId,
      );
    const cashReceiptDetailsDestroy =
      this.cashReceiptDetailsService.destroyCashReceiptDetails(
        cashReceiptHeaderId,
      );
    const cashReceiptOverPaymentsDestroy =
      this.cashReceiptOverPaymentsService.destroyCashReceiptOverPayments(
        cashReceiptHeaderId,
      );
    if (
      cashReceiptDetailsDestroy &&
      cashReceiptPaymentsDestroy &&
      cashReceiptOverPaymentsDestroy
    ) {
      let successUpdate = await this.cashReceiptHeaderService.update(
        cashReceiptHeaderId,
        dto,
      );
      if (successUpdate) {
        let deleteTr = await this.cashReceiptService.deleteTransaction(
          cashReceiptHeaderId,
        );
        if (deleteTr) return true;
        else return false;
      } else return false;
    }
    return false;
  }

  @Get('record/:cashReceiptHeaderId/:transactionId/:userId')
  async record(
    @Param('cashReceiptHeaderId') cashReceiptHeaderId: number,
    @Param('transactionId') transactionId: number,
    @Param('userId') userId: number,
    @Body() dto: RecordCashReceiptHeaderDto,
  ) {
    const cashReceiptHeaderUpdate =
      await this.cashReceiptHeaderService.updateRecord(
        cashReceiptHeaderId,
        dto,
      );
    if (cashReceiptHeaderUpdate)
      return this.cashReceiptService.record(
        transactionId,
        cashReceiptHeaderId,
        userId,
      );
    return false;
  }

  @Get('transaction/create/:cashReceiptHeaderId/:countryId')
  async createTransaction(
    @Param('cashReceiptHeaderId') cashReceiptHeaderId: number,
    @Param('countryId') countryId: number,
  ) {
    return this.cashReceiptService.createTransaction(
      cashReceiptHeaderId,
      countryId,
    );
  }

  @Get('/:id')
  async findOneById(@Param('id') id: number) {
    return this.cashReceiptHeaderService.findOneById(id);
  }

  @Get('listByCompanyId/:companyId')
  async findAllByCompanyId(@Param('companyId') companyId: number) {
    return this.cashReceiptHeaderService.findAllByCompanyId(companyId);
  }

  @Get('acccountBalanceByClientId/:clientId')
  async getAccountBalanceByClientId(@Param('clientId') clientId: number) {
    return this.cashReceiptHeaderService.accountBalanceByClientId(clientId);
  }

  @Get('checkCashReceipt/:clientId')
  async checkCeshReceiptForClient(@Param('clientId') clientId: number) {
    return this.cashReceiptHeaderService.checkCashReceiptForClient(clientId);
  }

  @Get('byClientOverPayment/:clientId/:startDate/:endDate')
  async byClientOverPayment(
    @Param()
    params: {
      clientId: number;
      startDate: Date | null;
      endDate: Date | null;
    },
  ) {
    return this.cashReceiptHeaderService.byClientOverPayment(
      params.clientId,
      params.startDate,
      params.endDate,
    );
  }

  @Get('byClientOverPaymentTable/:id/:startDate/:endDate')
  async byClientOverPaymentTable(
    @Param()
    params: {
      id: number;
      startDate: Date | null;
      endDate: Date | null;
    },
  ) {
    return this.cashReceiptHeaderService.byClientOverPaymentTable(
      params.id,
      params.startDate,
      params.endDate,
    );
  }

  @Get('byClientTables/:clientId/:typeId/:startDate/:endDate/:page')
  async byClientTables(
    @Param()
    params: {
      clientId: number;
      page: number;
      startDate: Date | null;
      endDate: Date | null;
      typeId: number;
    },
  ) {
    return this.cashReceiptHeaderService.byClientTables(
      params.clientId,
      Number(params.typeId),
      params.startDate,
      params.endDate,
      params.page,
    );
  }

  @Get('listByClientId/:clientId/:page/:startDate/:endDate/:typeName')
  async findAllByClientId(
    @Param()
    params: {
      clientId: number;
      page: number;
      startDate: Date | null;
      endDate: Date | null;
      typeName: string;
    },
  ) {
    return this.cashReceiptHeaderService.findAllByClientId(
      params.clientId,
      params.page,
      params.startDate,
      params.endDate,
      params.typeName,
    );
  }

  @Get('check/:transactionId/:cashReceiptHeaderId/:userId')
  async check(
    @Param('transactionId') transactionId: number,
    @Param('cashReceiptHeaderId') cashReceiptHeaderId: number,
    @Param('userId') userId: number,
  ) {
    return this.cashReceiptService.check(
      transactionId,
      cashReceiptHeaderId,
      userId,
    );
  }

  @Delete('/:cashReceiptHeaderId')
  async delete(@Param('cashReceiptHeaderId') cashReceiptHeaderId: number) {
    return this.cashReceiptService.delete(cashReceiptHeaderId);
  }

  @Delete('byCompanyId/:companyId')
  async deleteByCompanyId(@Param('companyId') companyId: number) {
    return this.cashReceiptService.deleteByCompanyId(companyId);
  }

  @Get('void/:cashReceiptHeaderId/:userId')
  async void(
    @Param('cashReceiptHeaderId') cashReceiptHeaderId: number,
    @Param('userId') userId: number,
  ) {
    return this.cashReceiptService.void(cashReceiptHeaderId, userId);
  }

  @Get('reverse/:cashReceiptHeaderId')
  async reverse(@Param('cashReceiptHeaderId') cashReceiptHeaderId: number) {
    return this.cashReceiptService.reverse(cashReceiptHeaderId);
  }

  @Get('post/:cashReceiptHeaderId')
  async post(@Param('cashReceiptHeaderId') cashReceiptHeaderId: number) {
    return this.cashReceiptService.post(cashReceiptHeaderId);
  }

  @Post('blocked')
  blocked(
    @Body()
    blockedParams: {
      companyId: number;
      lockAccountingPeriodTo: string;
    },
  ) {
    this.cashReceiptHeaderService.blocked(blockedParams);
    this.cashReceiptPaymentsService.blocked(blockedParams);
    this.cashReceiptDetailsService.blocked(blockedParams);
    this.cashReceiptOverPaymentsService.blocked(blockedParams);
    return true;
  }

  @Post('blocked/TranIdArr')
  async blockedTranIdArr(
    @Body()
    blockedParams: {
      tranIdArr: [];
    },
  ) {
    let crhIdArr = await this.cashReceiptHeaderService.blockedTranIdArr(
      blockedParams.tranIdArr,
    );
    this.cashReceiptPaymentsService.blockedCRHIdArr(crhIdArr);
    this.cashReceiptDetailsService.blockedCRHIdArr(crhIdArr);
    this.cashReceiptOverPaymentsService.blockedCRHIdArr(crhIdArr);
    return true;
  }
}
