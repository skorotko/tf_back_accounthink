import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { CreateAccountDto } from "./dto/create-account.dto";
import { AccountService } from "./account.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Account } from "./account.model";
import { UpdateAccountDto } from "./dto/update-account.dto";
import { CreateTaxAccountDto } from './dto/create-tax-account.dto';
import { UpdateNameAccountDto } from './dto/update-name-account.dto';
import { GetCompanyLedgerDto } from "./dto/get-company-ledger.dto";
import { UpdateActiveAccountDto } from './dto/update-active-account.dto';
import { GetTaxAccountsWithEndDateDto } from '../tax-account/dto/get-tax-account-with-date.dto';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @ApiOperation({ summary: 'Create account method' })
  @ApiResponse({ status: 200, type: Account })
  @Post()
  create(@Body() accountDto: CreateAccountDto) {
    return this.accountService.createAccount(accountDto);
  }

  @ApiOperation({ summary: 'Get all accounts method' })
  @ApiResponse({ status: 200, type: [Account] })
  @Get()
  getAll() {
    return this.accountService.getAllAccounts();
  }

  @ApiOperation({ summary: 'Get all company accounts' })
  @ApiResponse({ status: 200, type: [Account] })
  @Get('company-account/list/:companyId')
  getCompanyAccounts(@Param('companyId') companyId: number) {
    return this.accountService.getAllAccountsByCompanyId(companyId);
  }

  @ApiOperation({ summary: 'Get all company accounts' })
  @ApiResponse({ status: 200, type: [Account] })
  @Get('company-account/cash-and-cash-equivalents/:companyId')
  getCompanyCashAndCashEquivalentsAccounts(
    @Param('companyId') companyId: number,
  ) {
    return this.accountService.getCompanyCashAndCashEquivalentsAccounts(
      companyId,
    );
  }

  @ApiOperation({ summary: 'Get revenue company accounts' })
  @ApiResponse({ status: 200, type: [Account] })
  @Get('revenue-account/list/:companyId')
  getAccountsRevenueByCopmanyId(@Param('companyId') companyId: number) {
    return this.accountService.getAccountsRevenueByCopmanyId(companyId);
  }

  @ApiOperation({ summary: 'Get non revenue company accounts' })
  @ApiResponse({ status: 200, type: [Account] })
  @Get('non-revenue-account/list/:companyId')
  getAccountsNonRevenueByCopmanyId(@Param('companyId') companyId: number) {
    return this.accountService.getAccountsNonRevenueByCopmanyId(companyId);
  }

  @ApiOperation({ summary: 'Get revenue company accounts' })
  @ApiResponse({ status: 200, type: [Account] })
  @Get('number-account/list/:companyId/:data')
  getAccountsNumberByCopmanyId(
    @Param('companyId') companyId: number,
    @Param('data') data: number,
  ) {
    return this.accountService.getAccountsNumberByCopmanyId(companyId, data);
  }

  @ApiOperation({ summary: 'Get revenue company accounts' })
  @ApiResponse({ status: 200, type: [Account] })
  @Get('miscellaneous-income-account/list/:companyId')
  getAccountsMiscellaneousIncomeByCopmanyId(
    @Param('companyId') companyId: number,
  ) {
    return this.accountService.getAccountsMiscellaneousIncomeByCopmanyId(
      companyId,
    );
  }

  @ApiOperation({ summary: 'Get one account by id' })
  @ApiResponse({ status: 200, type: Account })
  @Get('/:id')
  getById(@Param('id') id: number) {
    return this.accountService.getById(id);
  }

  @ApiOperation({ summary: 'Get list account by group id' })
  @ApiResponse({ status: 200, type: Account })
  @Get('getByGroupId/:groupId')
  getByGroupId(@Param('groupId') groupId: number) {
    return this.accountService.getByGroupId(groupId);
  }

  @ApiOperation({ summary: 'Update account method' })
  @ApiResponse({ status: 200, type: Account })
  @Put('/:id')
  updateAccount(
    @Param('id') id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountService.updateAccount(id, updateAccountDto);
  }

  @ApiOperation({ summary: 'Delete account' })
  @ApiResponse({ status: 200 })
  @Delete('/:id')
  delete(@Param('id') id: number) {
    return this.accountService.deleteAccount(id);
  }

  @ApiOperation({ summary: 'Change account status' })
  @ApiResponse({ status: 200 })
  @Put('active/:id')
  changeAccountStatus(
    @Param('id') id: number,
    @Body('status') status: boolean,
  ) {
    return this.accountService.changeAccountStatus(id, status);
  }

  @ApiOperation({ summary: 'Get general ledger for account' })
  @ApiResponse({ status: 200 })
  @Get(
    'company-ledger/list/:companyId/:transactionCode/:filter/:orderBy/:order/:page/:count/:transactionType',
  )
  async getCompanyLedgerListWithPagination(
    @Param() params: GetCompanyLedgerDto,
  ) {
    return await this.accountService.getCompanyLedgerListWithPagination(
      params.companyId,
      params.transactionCode,
      params.filter !== 'null' ? JSON.parse(params.filter) : null,
      params.orderBy !== null
        ? { orderBy: params.orderBy, order: params.order }
        : null,
      { page: params.page, count: params.count },
      params.transactionType,
    );
  }

  @ApiOperation({ summary: 'Get general ledger for account' })
  @ApiResponse({ status: 200 })
  @Get(
    'company-ledger/list/:companyId/:transactionCode/:filter/:orderBy/:order',
  )
  async getCompanyLedgerList(
    @Param()
    params: {
      companyId: number;
      transactionCode: string;
      filter?: string;
      orderBy?: string;
      order?: string;
    },
  ) {
    return await this.accountService.getCompanyLedgerList(
      params.companyId,
      params.transactionCode,
      params.filter !== 'null' ? JSON.parse(params.filter) : null,
      params.orderBy !== null
        ? { orderBy: params.orderBy, order: params.order }
        : null,
    );
  }

  @ApiOperation({ summary: 'Get general ledger for account' })
  @ApiResponse({ status: 200 })
  @Get('account-ledger/item/:accountId/:startDate/:endDate')
  async getAccountLedgerItem(
    @Param() params: { accountId: number; startDate: string; endDate: string },
  ) {
    return await this.accountService.getAccountLedgerItem(params);
  }

  @ApiOperation({ summary: 'Get subsidiary ledger for account' })
  @ApiResponse({ status: 200 })
  @Get('subsidiary-ledger/:companyId/:accountId/:startDate/:endDate')
  async getSubsidiaryLedger(
    @Param()
    params: {
      companyId: number;
      accountId: number;
      startDate: string;
      endDate: string;
    },
  ) {
    return await this.accountService.getSubsidiaryLedger(
      params.companyId,
      params.accountId,
      params.startDate,
      params.endDate,
    );
  }

  @ApiOperation({ summary: 'Add tax account method' })
  @ApiResponse({ status: 200, type: Account })
  @Post('add-tax-account/:accountId')
  addTaxForAccount(
    @Param('accountId') accountId: number,
    @Body() accountTaxDto: CreateTaxAccountDto,
  ) {
    return this.accountService.addTaxForAccount(accountId, accountTaxDto);
  }

  @ApiOperation({ summary: 'Add tax account method' })
  @ApiResponse({ status: 200, type: Account })
  @Post('update-name-account/:accountId')
  updateNameAccount(
    @Param('accountId') accountId: number,
    @Body() accountDto: UpdateNameAccountDto,
  ) {
    return this.accountService.updateNameAccount(accountId, accountDto);
  }

  @ApiOperation({ summary: 'Update tax zero account' })
  @ApiResponse({ status: 200, type: Account })
  @Get('update-zero-tax-account/:accountId')
  updateZeroTaxAccount(@Param('accountId') accountId: number) {
    return this.accountService.updateZeroTaxAccount(accountId);
  }

  @ApiOperation({ summary: 'Update no tax account' })
  @ApiResponse({ status: 200, type: Account })
  @Get('update-no-tax-account/:accountId')
  updateNoTaxAccount(@Param('accountId') accountId: number) {
    return this.accountService.updateNoTaxAccount(accountId);
  }

  @ApiOperation({ summary: 'Update tax exempt account' })
  @ApiResponse({ status: 200, type: Account })
  @Get('update-exempt-tax-account/:accountId')
  updateExemptTaxAccount(@Param('accountId') accountId: number) {
    return this.accountService.updateExemptTaxAccount(accountId);
  }

  @ApiOperation({ summary: 'Add tax account method' })
  @ApiResponse({ status: 200, type: Account })
  @Post('update-active-account/:accountId')
  updateActiveAccount(
    @Param('accountId') accountId: number,
    @Body() accountDto: UpdateActiveAccountDto,
  ) {
    return this.accountService.updateActiveAccount(accountId, accountDto);
  }

  @ApiOperation({ summary: '' })
  @ApiResponse({ status: 200 })
  @Put('change-status-by-code/:companyId')
  changeAccountStatusByCode(
    @Param('companyId') companyId: number,
    @Body()
    data: {
      activateList: Array<string>;
      deactivateList: Array<string>;
    },
  ) {
    return this.accountService.changeAccountStatusByCode({
      companyId,
      ...data,
    });
  }

  @ApiOperation({ summary: 'Get account only tax by companyId' })
  @ApiResponse({ status: 200, type: Account })
  @Get('getAccountOnlyTax/:companyId')
  getAccountOnlyTax(@Param('companyId') companyId: number) {
    return this.accountService.getAccountOnlyTax(companyId);
  }

  @ApiOperation({ summary: 'Get data for create account' })
  @ApiResponse({ status: 200 })
  @Get('getCompanyGroupsAndAccounts/:companyId')
  getAccountWithTaxDirectories(@Param('companyId') companyId: number) {
    return this.accountService.accountWithTaxDirectories(companyId);
  }

  @ApiOperation({ summary: 'Create account with tax' })
  @ApiResponse({ status: 200 })
  @Post('createWithTax')
  async createAccountWithTax(@Body() accountDto: CreateAccountDto) {
    return await this.accountService.createAccountWithTax(accountDto);
  }

  @ApiOperation({ summary: 'Assign account to tax account method' })
  @ApiResponse({ status: 200, type: Account })
  @Post('assignAccountToTaxAccount/:accountId/:assignToTaxAccountId')
  assignAccountToTaxAccount(
    @Param('accountId') accountId: number,
    @Param('assignToTaxAccountId') assignToTaxAccountId: number,
  ) {
    return this.accountService.assignAccountToTaxAccount(
      accountId,
      assignToTaxAccountId,
    );
  }

  @ApiOperation({ summary: 'Get account only bank by companyId' })
  @ApiResponse({ status: 200, type: Account })
  @Get('getAccountOnlyBank/:companyId')
  getAccountOnlyBank(@Param('companyId') companyId: number) {
    return this.accountService.getAccountOnlyBank(companyId);
  }

  @ApiOperation({ summary: 'Get account only bank not related to users (company level) by companyId' })
  @ApiResponse({ status: 200, type: Account })
  @Get('getAccountOnlyBank2/:companyId')
  getAccountOnlyBank2(@Param('companyId') companyId: number) {
    return this.accountService.getAccountOnlyBank2(companyId);
  }

  @ApiOperation({ summary: 'Get account only credit card by companyId' })
  @ApiResponse({ status: 200, type: Account })
  @Get('getAccountOnlyCreditCard/:companyId')
  getAccountOnlyCreditCard(@Param('companyId') companyId: number) {
    return this.accountService.getAccountOnlyCreditCard(companyId);
  }

  @ApiOperation({ summary: 'Get company income statement list' })
  @ApiResponse({ status: 200, type: 'list' })
  @Get('income-statement/list/:companyId/:startDate/:endDate/:typeReport')
  getCompanyIncomeStatementList(
    @Param()
    params: {
      companyId: number;
      startDate: string;
      endDate: string;
      typeReport: string;
    },
  ) {
    return this.accountService.getCompanyIncomeStatement(params);
  }
  @ApiOperation({ summary: 'Get company balance sheet list' })
  @ApiResponse({ status: 200, type: 'list' })
  @Get('balance-sheet/list/:companyId/:startDate/:endDate')
  getCompanyBalanceSheetList(
    @Param() params: { companyId: number; startDate: string; endDate: string },
  ) {
    return this.accountService.getCompanyBalanceSheet(params);
  }

  @ApiOperation({ summary: 'Get company statement cashflows list' })
  @ApiResponse({ status: 200, type: 'list' })
  @Get('statement-cashflows/list/:companyId/:startDate/:endDate')
  getCompanyStatementOfCashflowsList(
    @Param() params: { companyId: number; startDate: string; endDate: string },
  ) {
    return this.accountService.getCompanyStatementOfCashflows(params);
  }

  @ApiOperation({ summary: 'Get company trial balance list' })
  @ApiResponse({ status: 200, type: 'list' })
  @Get('trial-balance/list/:companyId/:startDate/:endDate')
  getCompanyTrialBalanceList(
    @Param() params: { companyId: number; startDate: string; endDate: string },
  ) {
    return this.accountService.getCompanyTrialBalance(params);
  }

  @ApiOperation({ summary: 'Get company trial balance list' })
  @ApiResponse({ status: 200, type: 'list' })
  @Get('company-ledger/report/:companyId/:filter')
  getCompanyLedgerReport(@Param() params: GetCompanyLedgerDto) {
    return this.accountService.getCompanyLedgerReport(
      params.companyId,
      params.filter !== 'null' ? JSON.parse(params.filter) : null,
    );
  }

  @ApiOperation({ summary: 'Get company worksheet' })
  @ApiResponse({ status: 200, type: 'list' })
  @Get('company-worksheet/:companyId/:startDate/:endDate/:lastDate')
  async getCompanyWorkSheet(
    @Param()
    params: {
      companyId: number;
      startDate: string;
      endDate: string;
      lastDate: string;
    },
  ) {
    return await this.accountService.getCompanyWorksheet(
      params.companyId,
      params.startDate,
      params.endDate,
      params.lastDate,
    );
  }

  @ApiOperation({ summary: 'Get company trial balance list' })
  @ApiResponse({ status: 200, type: 'list' })
  @Get('tax-accounts-result/:companyId/:endDate')
  getTaxAccountResult(@Param() params: { companyId: number; endDate: string }) {
    return this.accountService.getTaxAccountResult(params);
  }

  @ApiOperation({ summary: 'Get company trial balance list' })
  @ApiResponse({ status: 200, type: 'list' })
  @Get('tax-accounts-result-wh/:companyId/:endDate')
  getTaxAccountResultWh(
    @Param() params: { companyId: number; endDate: string },
  ) {
    return this.accountService.getTaxAccountResultWh(params);
  }

  @ApiOperation({ summary: 'Get company trial balance list' })
  @ApiResponse({ status: 200, type: 'list' })
  @Get('tax-accounts-result-clients/:companyId/:endDate')
  getTaxAccountResultClients(
    @Param() params: { companyId: number; endDate: string },
  ) {
    return this.accountService.getTaxAccountResultClients(params);
  }

  @ApiOperation({ summary: 'Get company trial balance list' })
  @ApiResponse({ status: 200, type: 'list' })
  @Get('tax-accounts-result-vendors/:companyId/:endDate')
  getTaxAccountResultVendors(
    @Param() params: { companyId: number; endDate: string },
  ) {
    return this.accountService.getTaxAccountResultVendors(params);
  }

  @ApiOperation({ summary: 'Get company trial balance list' })
  @ApiResponse({ status: 200, type: 'list' })
  @Get('tax-accounts-result-vendors-wh/:companyId/:endDate')
  getWtaxExpandedAccountsResultVendors(
    @Param() params: { companyId: number; endDate: string },
  ) {
    return this.accountService.getWtaxExpandedAccountsResultVendors(params);
  }

  @ApiOperation({ summary: 'Get company trial balance list' })
  @ApiResponse({ status: 200, type: 'list' })
  @Get('tax-accounts-result-clients-summary/:companyId/:endDate')
  getCreditableVATSummary(
    @Param() params: { companyId: number; endDate: string },
  ) {
    return this.accountService.getCreditableVATSummary(params);
  }

  @ApiOperation({ summary: 'Get company trial balance list' })
  @ApiResponse({ status: 200, type: 'list' })
  @Get('withHolding-tax-accounts-result/:companyId/:endDate')
  getWithHoldingTaxAccountResult(
    @Param() params: { companyId: number; endDate: string },
  ) {
    return this.accountService.getWithHoldingTaxAccountResult(params);
  }

  @ApiOperation({ summary: 'Get company trial balance list' })
  @ApiResponse({ status: 200, type: 'list' })
  @Get('summary-list-of-sales/:companyId/:startDate/:endDate')
  getSummaryListOfSales(
    @Param() params: { companyId: number; startDate: string; endDate: string },
  ) {
    return this.accountService.getSummaryListOfSales(params);
  }

  @ApiOperation({ summary: 'Get accounts by code' })
  //@ApiResponse({ status: 200, type: Array<Account> })
  @Get('by-code/:code')
  getAccountsListByIdList(@Param('code') code: string | Array<string>) {
    return this.accountService.getAccountByCode(code);
  }

  @ApiOperation({ summary: 'Get accounts by parentId' })
  //@ApiResponse({ status: 200, type: Array<Account> })
  @Get('by-parent-id/:parentAccountId')
  getAccountsByParentId(
    @Param('parentAccountId') parentAccountId: number | Array<number>,
  ) {
    return this.accountService.getAccountByParentId(parentAccountId);
  }

  @ApiOperation({ summary: 'Get child accounts by parent account code' })
  @ApiResponse({ status: 200, type: 'list' })
  @Get('by-parent-code/:companyId/:code')
  getChildAccountByParentCode(
    @Param() params: { companyId: number; code: string },
  ) {
    return this.accountService.getChildAccountByParentAccountCode(
      params.companyId,
      JSON.parse(params.code),
    );
  }

  @ApiOperation({ summary: 'Get account by id' })
  @ApiResponse({ status: 200 })
  @Get('by-id/:id')
  getAccountById(@Param() param: { id: string }) {
    return this.accountService.findById(JSON.parse(param.id));
  }

  @ApiOperation({ summary: 'Get account by code like' })
  @ApiResponse({ status: 200 })
  @Get('byCodeLike/:companyId/:code')
  getAccountsCodeLike(@Param() params: { companyId: number; code: string }) {
    return this.accountService.getAccountsCodeLike(params.companyId, JSON.parse(params.code));
  }

  @ApiOperation({ summary: 'Create account' })
  @ApiResponse({ status: 200 })
  @Post('createForCash')
  createForCash(@Body() accountDto: CreateAccountDto) {
    return this.accountService.createForCash(accountDto);
  }

  @ApiOperation({ summary: 'Create account' })
  @ApiResponse({ status: 200 })
  @Post('createForCashMain')
  createForCashMain(@Body() accountDto: CreateAccountDto) {
    return this.accountService.createForCashMain(accountDto);
  }

  @ApiOperation({ summary: 'Get account by code like' })
  @ApiResponse({ status: 200 })
  @Get('cash/listByUser/:userId/:companyId/:typeId')
  listCashAccountByUserId(@Param() params: { userId: number, companyId: number, typeId: number }) {
    return this.accountService.listCashAccountByUserId(params.userId, params.companyId, params.typeId);
  }

  @ApiOperation({ summary: 'Get account by code like' })
  @ApiResponse({ status: 200 })
  @Get('cash/listTotal/:userId/:companyId/:typeId')
  listCashAccountTotal(@Param() params: { userId: number, companyId: number, typeId: number }) {
    return this.accountService.listCashAccountTotal(params.userId, params.companyId, params.typeId);
  }

  @ApiOperation({ summary: 'Get account by code like' })
  @ApiResponse({ status: 200 })
  @Get('cash/listTotal/userAccount/:id/:startDate/:endDate')
  listTotalbyUserAccountId(@Param() params: { id: number, startDate: string; endDate: string; }) {
    return this.accountService.listTotalbyUserAccountId(params.id,  params.startDate, params.endDate);
  }

  @ApiOperation({ summary: 'Get account by code like' })
  @ApiResponse({ status: 200 })
  @Get('cash/listTotalAll/:companyId/:startDate/:endDate')
  listCashAccountTotalAllByDate(@Param() params: { companyId: number, startDate: string; endDate: string;  }) {
    return this.accountService.listCashAccountTotalAllByDate(params.companyId, params.startDate, params.endDate);
  }
}
