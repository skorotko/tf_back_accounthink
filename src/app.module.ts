import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { TypesModule } from './types/types.module';
import { Types } from "./types/types.model";
import { ClassesModule } from './classes/classes.module';
import { Classes } from "./classes/classes.model";
import { GroupModule } from './group/group.module';
import { Group } from "./group/group.model";
import { AccountModule } from './account/account.module';
import { Account } from "./account/account.model";
import { ClashflowModule } from './clashflow/clashflow.module';
import { Clashflow } from "./clashflow/clashflow.model";
import { AccountTreeModule } from './accountTree/accountTree.module';
import { RegistrationModule } from './registration/registration.module';
import { TransactionEntryModule } from './transaction-entry/transaction-entry.module';
import { TransactionEntry } from "./transaction-entry/transaction-entry.model";
import { TransactionModule } from './transaction/transaction.module';
import { Transaction } from "./transaction/transaction.model";
import { BankAccountModule } from './bank-account/bank-account.module';
import { BankAccount } from './bank-account/bank-account.model';
import { CreditCardAccountModule } from './credit-card-account/credit-card-account.module';
import { CreditCardAccount } from './credit-card-account/credit-card-account.model';
import { AccountType } from './account/accountType.model';
import { GeneralLedgerModule } from './general-ledger/general-ledger.module';
import { BankAccountType } from './bank-account-type/bank-account-type.model';
import { BankAccountTypeModule } from './bank-account-type/bank-account-type.module';
import { SaleTax } from "./sale-tax/sale-tax.model";
import { TaxRate } from "./tax-rate/tax-rate.model";
import { TaxType } from "./tax-type/tax-type.model";
import { TaxRateModule } from "./tax-rate/tax-rate.module";
import { TaxTypeModule } from "./tax-type/tax-type.module";
import { SaleTaxModule } from "./sale-tax/sale-tax.module";
import { WithHoldingTaxModule } from './with-holding-tax/with-holding-tax.module';
import { WithHoldingTax } from "./with-holding-tax/with-holding-tax.model";
import { WithHoldingTaxRemarkModule } from './with-holding-tax-remark/with-holding-tax-remark.module';
import { WithHoldingTaxRemark } from "./with-holding-tax-remark/with-holding-tax-remark";
import { TaxAccountModule } from './tax-account/tax-account.module';
import { Cron } from './cron/cron.model';
import { CronModule } from './cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CashReceiptHeaderModule } from './cash-receipt/cash-receipt-header/cash-receipt-header.module';
import { CashReceiptDetailsModule } from './cash-receipt/cash-receipt-details/cash-receipt-details.module';
import { CashReceiptPaymentsModule } from './cash-receipt/cash-receipt-payments/cash-receipt-payments.module';
import { CashReceiptModule } from './cash-receipt/cash-receipt.module';
import { CashReceiptHeaderModel } from './cash-receipt/cash-receipt-header/cash-receipt-header.model';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { PaymentMethod } from "./payment-method/payment-method.model";
import { CashReceiptPaymentsModel } from './cash-receipt/cash-receipt-payments/cash-receipt-payments.model';
import { CashReceiptDetailsModel } from './cash-receipt/cash-receipt-details/cash-receipt-details.model';
import { ZeroTaxTypeModule } from './zero-tax-type/zero-tax-type.module';
import { ZeroTaxType } from "./zero-tax-type/zero-tax-type.model";
import { CashDisbursementHeaderModel } from './cash-disbursement/cash-disbursement-header/cash-disbursement-header.model';
import { CashDisbursementPaymentsModel } from './cash-disbursement/cash-disbursement-payments/cash-disbursement-payments.model';
import { CashDisbursementDetailsModel } from './cash-disbursement/cash-disbursement-details/cash-disbursement-details.model';
import { CashDisbursementHeaderModule } from './cash-disbursement/cash-disbursement-header/cash-disbursement-header.module';
import { CashDisbursementDetailsModule } from './cash-disbursement/cash-disbursement-details/cash-disbursement-details.module';
import { CashDisbursementModule } from './cash-disbursement/cash-disbursement.module';
import { CashDisbursementPaymentsModule } from './cash-disbursement/cash-disbursement-payments/cash-disbursement-payments.module';
import { CheckEntityModule } from './check-entity/check-entity.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { Warehouse } from "./warehouse/warehouse.model";
import { XeroModule } from './xero/xero.module';
import { Xero } from './xero/xero.model';
import { ItemsModule } from './items/items.module';
import { ItemsUnitsModule } from './items-units/items-units.module';
import { ItemsBrandsModule } from './items-brands/items-brands.module';
import { ItemsBarcodeSymbologiesModule } from './items-barcode-symbologies/items-barcode-symbologies.module';
import { ItemsCategoryGroupModule } from './items-category-group/items-category-group.module';
import { ItemsCategoriesModule } from './items-categories/items-categories.module';
import { ItemsBrands } from "./items-brands/items-brands.model";
import { ItemsUnits } from "./items-units/items-units.model";
import { ItemsContactsModule } from './items-contacts/items-contacts.module';
import { ItemsType } from "./items/models/items-type.model";
import { Items } from "./items/models/items.model";
import { ItemsGroup } from "./items/models/items-group.model";
import { ItemsOpenBalancesHeader } from './items-open-balances/models/items-open-balances-header.model';
import { ItemsOpenBalancesDetails } from './items-open-balances/models/items-open-balances-details.model';
import { ItemsOpenBalancesModule } from './items-open-balances/items-open-balances.module';
import { ItemsWarehouse } from './items/models/items-warehouse.model';
import { ItemsTransaction } from './items/models/items-transaction.model';
import { TaxReportModule } from './tax-report/tax-report.module';
import { DatabaseModule } from './database/database.module';
import { CashReceiptOverPaymentsModel } from './cash-receipt/cash-receipt-overPayments/cash-receipt-overPayments.model';
import { CashReceiptOverPaymentsModule } from './cash-receipt/cash-receipt-overPayments/cash-receipt-overPayments.module';
import { CashDisbursementOverPaymentsModule } from './cash-disbursement/cash-disbursement-overPayments/cash-disbursement-overPayments.module';
import { CashDisbursementOverPaymentsModel } from './cash-disbursement/cash-disbursement-overPayments/cash-disbursement-overPayments.model';
import { TransactionEntryDetails } from './transaction-entry/transaction-entry-details.model';
import { CoaModule } from './coa/coa.module';
import { AccountingMethodMapping } from './account/accountingMethodMapping.model';
import { UserAccount } from './account/user-account.model';
import { RequestsQueueModule } from './requests-queue/requests-queue.module';
import { RequestsQueue } from './requests-queue/requests-queue.model';
import { ExpendituresQueueModule } from './expenditures-queue/expenditures-queue.module';
import { ExpendituresQueue } from './expenditures-queue/expenditures-queue.model';
import { ExpenseCategory } from './expense-category/expense-category.model';
import { ExpenseCategoryModule } from './expense-category/expense-category.module';


// console.log(process.env);
// console.log(process.env.POSTGRES_PASSWORD);
// console.log(process.env.NODE_ENV);
// console.log(process.env.POSTGRES_USER);
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: `.env`,
    }),

    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres12',
      password: process.env.DB_PASS || '1111',
      database: process.env.DB_NAME || 'account-think',
      logging: false,
      models: [
        Types,
        Classes,
        Group,
        Account,
        TransactionEntry,
        Clashflow,
        Transaction,
        BankAccount,
        CreditCardAccount,
        AccountType,
        BankAccountType,
        SaleTax,
        TaxRate,
        TaxType,
        WithHoldingTax,
        WithHoldingTaxRemark,
        Cron,
        CashReceiptHeaderModel,
        PaymentMethod,
        CashReceiptPaymentsModel,
        CashReceiptDetailsModel,
        ZeroTaxType,
        CashDisbursementHeaderModel,
        CashDisbursementPaymentsModel,
        CashDisbursementDetailsModel,
        Warehouse,
        Xero,
        ItemsBrands,
        ItemsUnits,
        Items,
        ItemsType,
        ItemsGroup,
        ItemsOpenBalancesHeader,
        ItemsOpenBalancesDetails,
        ItemsWarehouse,
        ItemsTransaction,
        CashReceiptOverPaymentsModel,
        CashDisbursementOverPaymentsModel,
        TransactionEntryDetails,
        AccountingMethodMapping,
        UserAccount,
        RequestsQueue,
        ExpendituresQueue,
        ExpenseCategory,
      ],
      autoLoadModels: true,
    }),
    TypesModule,
    ClassesModule,
    GroupModule,
    AccountModule,
    ClashflowModule,
    AccountTreeModule,
    RegistrationModule,
    TransactionModule,
    TransactionEntryModule,
    BankAccountModule,
    CreditCardAccountModule,
    GeneralLedgerModule,
    BankAccountTypeModule,
    SaleTaxModule,
    TaxRateModule,
    TaxTypeModule,
    WithHoldingTaxModule,
    WithHoldingTaxRemarkModule,
    TaxAccountModule,
    CronModule,
    CashReceiptHeaderModule,
    CashReceiptDetailsModule,
    CashReceiptPaymentsModule,
    CashReceiptModule,
    CashDisbursementHeaderModule,
    CashDisbursementDetailsModule,
    CashDisbursementPaymentsModule,
    CashDisbursementModule,
    PaymentMethodModule,
    ZeroTaxTypeModule,
    CheckEntityModule,
    WarehouseModule,
    XeroModule,
    ItemsModule,
    ItemsUnitsModule,
    ItemsOpenBalancesModule,
    ItemsBrandsModule,
    ItemsBarcodeSymbologiesModule,
    ItemsCategoryGroupModule,
    ItemsCategoriesModule,
    ItemsContactsModule,
    ItemsOpenBalancesModule,
    TaxReportModule,
    DatabaseModule,
    CashReceiptOverPaymentsModule,
    CashDisbursementOverPaymentsModule,
    CoaModule,
    RequestsQueueModule,
    ExpendituresQueueModule,
    ExpenseCategoryModule
  ],
})
export class AppModule {}
