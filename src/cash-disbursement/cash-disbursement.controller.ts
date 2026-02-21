import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CashDisbursementDetailsService } from './cash-disbursement-details/cash-disbursement-details.service';
import { CreateCashDisbursementDetailsDto } from './cash-disbursement-details/dto/create-cash-disbursement-details.dto';
import { CashDisbursementHeaderService } from './cash-disbursement-header/cash-disbursement-header.service';
import { CreateCashDisbursementHeaderDto } from './cash-disbursement-header/dto/create-cash-disbursement-header.dto';
import { RecordCashDisbursementHeaderDto } from './cash-disbursement-header/dto/record-cash-disbursement-header.dto';
import { CashDisbursementOverPaymentsService } from './cash-disbursement-overPayments/cash-disbursement-overPayments.service';
import { CreateCashDisbursementOverPaymentsDto } from './cash-disbursement-overPayments/dto/create-cash-disbursement-overPayments.dto';
import { CashDisbursementPaymentsService } from './cash-disbursement-payments/cash-disbursement-payments.service';
import { CreateCashDisbursementPaymentsDto } from './cash-disbursement-payments/dto/create-cash-disbursement-payments.dto';
import { CashDisbursementService } from './cash-disbursement.service';


@Controller('cash-disbursement')
export class CashDisbursementController {
  constructor(
    private readonly cashDisbursementHeaderService: CashDisbursementHeaderService,
    private readonly cashDisbursementPaymentsService: CashDisbursementPaymentsService,
    private readonly cashDisbursementDetailsService: CashDisbursementDetailsService,
    private readonly cashDisbursementOverPaymentsService: CashDisbursementOverPaymentsService,
    private readonly cashDisbursementService: CashDisbursementService,
  ) {}

  @Post('header/create')
  async createHeader(@Body() dto: CreateCashDisbursementHeaderDto) {
    return this.cashDisbursementHeaderService.create(dto);
  }

  @Post('payment/create')
  async createPayment(@Body() dto: CreateCashDisbursementPaymentsDto) {
    return this.cashDisbursementPaymentsService.bulkCreate(dto);
  }

  @Post('detail/create')
  async createDetail(@Body() dto: CreateCashDisbursementDetailsDto) {
    return this.cashDisbursementDetailsService.bulkCreate(dto);
  }

  @Post('overPayment/create')
  async createOverPayment(@Body() dto: CreateCashDisbursementOverPaymentsDto) {
    return this.cashDisbursementOverPaymentsService.bulkCreate(dto);
  }

  @Put('update/:cashDisbursementHeaderId')
  async updateHeader(
    @Param('cashDisbursementHeaderId') cashDisbursementHeaderId: number,
    @Body() dto: CreateCashDisbursementHeaderDto,
  ) {
    const cashDisbursementPaymentsDestroy =
      this.cashDisbursementPaymentsService.destroyCashDisbursementPayments(
        cashDisbursementHeaderId,
      );
    const cashDisbursementDetailsDestroy =
      this.cashDisbursementDetailsService.destroyCashDisbursementDetails(
        cashDisbursementHeaderId,
      );
    const cashDisbursementOverPaymentsDestroy =
      this.cashDisbursementOverPaymentsService.destroyCashDisbursementOverPayments(
        cashDisbursementHeaderId,
      );
    if (
      cashDisbursementDetailsDestroy &&
      cashDisbursementPaymentsDestroy &&
      cashDisbursementOverPaymentsDestroy
    ) {
      let successUpdate = await this.cashDisbursementHeaderService.update(
        cashDisbursementHeaderId,
        dto,
      );
      if (successUpdate) {
        let updateTr = await this.cashDisbursementService.updateTransaction(
          cashDisbursementHeaderId,
        );
        if (updateTr) return true;
        else return false;
      } else return false;
    }
    return false;
  }

  @Get('record/:cashDisbursementHeaderId/:transactionId/:userId')
  async record(
    @Param('cashDisbursementHeaderId') cashDisbursementHeaderId: number,
    @Param('transactionId') transactionId: number,
    @Param('userId') userId: number,
    @Body() dto: RecordCashDisbursementHeaderDto,
  ) {
    const cashDisbursementHeaderUpdate =
      await this.cashDisbursementHeaderService.updateRecord(
        cashDisbursementHeaderId,
        dto,
      );
    if (cashDisbursementHeaderUpdate)
      return this.cashDisbursementService.record(
        transactionId,
        cashDisbursementHeaderId,
        userId,
      );
    return false;
  }

  @Get('transaction/create/:cashDisbursementHeaderId/:countryId')
  async createTransaction(
    @Param('cashDisbursementHeaderId') cashDisbursementHeaderId: number,
    @Param('countryId') countryId: number,
  ) {
    return this.cashDisbursementService.createTransaction(
      cashDisbursementHeaderId,
      countryId,
    );
  }

  @Get('/:id')
  async findOneById(@Param('id') id: number) {
    return this.cashDisbursementHeaderService.findOneById(id);
  }

  @Get('listByCompanyId/:companyId')
  async findAllByCompanyId(@Param('companyId') companyId: number) {
    return this.cashDisbursementHeaderService.findAllByCompanyId(companyId);
  }

  @Get('acccountBalanceByVendorId/:vendorId')
  async getAccountBalanceByVendorId(@Param('vendorId') vendorId: number) {
    return this.cashDisbursementHeaderService.accountBalanceByVendorId(
      vendorId,
    );
  }

  @Get('listByVendorId/:vendorId/:page/:startDate/:endDate/:typeName')
  async findAllByVendorId(
    @Param()
    params: {
      vendorId: number;
      page: number;
      startDate: Date | null;
      endDate: Date | null;
      typeName: string;
    },
  ) {
    return this.cashDisbursementHeaderService.findAllByVendorId(
      params.vendorId,
      params.page,
      params.startDate,
      params.endDate,
      params.typeName,
    );
  }

  @Get('check/:transactionId/:cashDisbursementHeaderId/:userId')
  async check(
    @Param('transactionId') transactionId: number,
    @Param('cashDisbursementHeaderId') cashDisbursementHeaderId: number,
    @Param('userId') userId: number,
  ) {
    return this.cashDisbursementService.check(
      transactionId,
      cashDisbursementHeaderId,
      userId,
    );
  }

  @Delete('/:cashDisbursementHeaderId')
  async delete(
    @Param('cashDisbursementHeaderId') cashDisbursementHeaderId: number,
  ) {
    return this.cashDisbursementService.delete(cashDisbursementHeaderId);
  }

  @Delete('byCompanyId/:companyId')
  async deleteByCompanyId(@Param('companyId') companyId: number) {
    return this.cashDisbursementService.deleteByCompanyId(companyId);
  }

  @Get('void/:cashDisbursementHeaderId/:userId')
  async void(
    @Param('cashDisbursementHeaderId') cashDisbursementHeaderId: number,
    @Param('userId') userId: number,
  ) {
    return this.cashDisbursementService.void(cashDisbursementHeaderId, userId);
  }

  @Get('reverse/:cashDisbursementHeaderId')
  async reverse(
    @Param('cashDisbursementHeaderId') cashDisbursementHeaderId: number,
  ) {
    return this.cashDisbursementService.reverse(cashDisbursementHeaderId);
  }

  @Get('post/:cashDisbursementHeaderId')
  async post(
    @Param('cashDisbursementHeaderId') cashDisbursementHeaderId: number,
  ) {
    return this.cashDisbursementService.post(cashDisbursementHeaderId);
  }

  @Get('byVendorOverPaymentTable/:id/:startDate/:endDate')
  async byVendorOverPaymentTable(
    @Param()
    params: {
      id: number;
      startDate: Date | null;
      endDate: Date | null;
    },
  ) {
    return this.cashDisbursementHeaderService.byVendorOverPaymentTable(
      params.id,
      params.startDate,
      params.endDate,
    );
  }

  @Get('byVendorOverPayment/:vendorId/:startDate/:endDate')
  async byVendorOverPayment(
    @Param()
    params: {
      vendorId: number;
      startDate: Date | null;
      endDate: Date | null;
    },
  ) {
    return this.cashDisbursementHeaderService.byVendorOverPayment(
      params.vendorId,
      params.startDate,
      params.endDate,
    );
  }

  @Get('byVendorTables/:vendorId/:typeId/:startDate/:endDate/:page')
  async byVendorTables(
    @Param()
    params: {
      vendorId: number;
      page: number;
      startDate: Date | null;
      endDate: Date | null;
      typeId: number;
    },
  ) {
    return this.cashDisbursementHeaderService.byVendorTables(
      params.vendorId,
      Number(params.typeId),
      params.startDate,
      params.endDate,
      params.page,
    );
  }

  @Post('blocked')
  blocked(
    @Body()
    blockedParams: {
      companyId: number;
      lockAccountingPeriodTo: string;
    },
  ) {
    this.cashDisbursementHeaderService.blocked(blockedParams);
    this.cashDisbursementPaymentsService.blocked(blockedParams);
    this.cashDisbursementDetailsService.blocked(blockedParams);
    this.cashDisbursementOverPaymentsService.blocked(blockedParams);
    return true;
  }

  @Post('blocked/TranIdArr')
  async blockedTranIdArr(
    @Body()
    blockedParams: {
      tranIdArr: []
    },
  ) {
    let cdhIdArr = await this.cashDisbursementHeaderService.blockedTranIdArr(
      blockedParams.tranIdArr,
    );
    this.cashDisbursementPaymentsService.blockedCDHIdArr(cdhIdArr);
    this.cashDisbursementDetailsService.blockedCDHIdArr(cdhIdArr);
    this.cashDisbursementOverPaymentsService.blockedCDHIdArr(cdhIdArr);
    return true;
  }
}
