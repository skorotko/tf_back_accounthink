import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Account } from './account.model';
import { CreateAccountDto } from './dto/create-account.dto';
import { GroupService } from '../group/group.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import { CreateTaxAccountDto } from './dto/create-tax-account.dto';
import { UpdateNameAccountDto } from './dto/update-name-account.dto';
import { Op } from 'sequelize';
import { Group } from 'src/group/group.model';
import { Transaction } from 'src/transaction/transaction.model';
import { UpdateActiveAccountDto } from './dto/update-active-account.dto';
import { TransactionEntryService } from 'src/transaction-entry/transaction-entry.service';
import { BankAccountService } from '../bank-account/bank-account.service';
import { BankAccount } from 'src/bank-account/bank-account.model';
import { CreditCardAccountService } from 'src/credit-card-account/credit-card-account.service';
import { CreditCardAccount } from 'src/credit-card-account/credit-card-account.model';
import { BankAccountType } from 'src/bank-account-type/bank-account-type.model';
import { TransactionService } from '../transaction/transaction.service';
import { SaleTaxService } from '../sale-tax/sale-tax.service';
import { WithHoldingTaxService } from '../with-holding-tax/with-holding-tax.service';
import { GetTaxAccountsWithEndDateDto } from '../tax-account/dto/get-tax-account-with-date.dto';
import { CashReceiptHeaderModel } from 'src/cash-receipt/cash-receipt-header/cash-receipt-header.model';
import { CashDisbursementHeaderModel } from 'src/cash-disbursement/cash-disbursement-header/cash-disbursement-header.model';
import { SaleTax } from 'src/sale-tax/sale-tax.model';
import e from 'express';
import { UserAccount } from './user-account.model';
import { ExpendituresQueue } from 'src/expenditures-queue/expenditures-queue.model';
import { RequestsQueue } from 'src/requests-queue/requests-queue.model';
import { Sequelize } from 'sequelize'; 

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account) private accountRepository: typeof Account,
    @InjectModel(UserAccount) private userAccountRepository: typeof UserAccount,
    private readonly transactionService: TransactionService,
    private readonly saleTaxService: SaleTaxService,
    private readonly withHoldingTaxService: WithHoldingTaxService,
    private readonly transactionEntryService: TransactionEntryService,
  ) {}

  async getParentAccountCodes(parentId) {
    let parentAccount = await this.accountRepository.findByPk(parentId);
    if (parentAccount === null)
      throw new HttpException('Parent account not found', 404);
    return {
      code: parentAccount.code,
      DRCRCode: parentAccount.DRCRCode,
    };
  }

  async getParentAccountType(parentId) {
    let parentAccount = await this.accountRepository.findByPk(parentId);
    if (parentAccount === null)
      throw new HttpException('Parent account not found', 404);
    return parentAccount.accountTypeId;
  }

  async createAccount(dto: CreateAccountDto): Promise<Account> {
    try {
      let parentCodes;
      let parentTypeId;
      let maxAccountNumber;
      let filePath = dto.filePath;
      let parentId = dto.parentId;
      let show = true;
      if (dto.hasOwnProperty('show')) show = dto.show;
      if (parentId === null || parentId === 'null') {
        parentCodes = await GroupService.getGroupCodesById(dto.groupId);
        parentTypeId = 0;
        maxAccountNumber = await this.accountRepository.count({
          where: { groupId: dto.groupId, companyId: dto.companyId },
        });
        maxAccountNumber = await this.accountRepository.count({
          where: {
            groupId: dto.groupId,
            companyId: dto.companyId,
            parentId: null,
          },
        });
      } else {
        let transaction = await this.transactionEntryService.findOneWhere({
          where: { accountId: parentId },
        });
        let parentAccount = await this.getById(dto.parentId);
        if (transaction) return parentAccount;
        parentCodes = {
          code: parentAccount.code,
          DRCRCode: parentAccount.DRCRCode,
        };
        parentTypeId = parentAccount.accountTypeId;
        maxAccountNumber = await this.accountRepository.count({
          where: { parentId },
        });
      }

      let data = {
        code: `${parentCodes.code}.${maxAccountNumber + 1}`,
        DRCRCode: parentCodes.DRCRCode,
        name: dto.name,
        number: dto.number,
        groupId: dto.groupId,
        parentId: parentId === 'null' ? null : parentId,
        entityType: 'account',
        active: true,
        companyId: dto.companyId,
        createdDate: Date.now(),
        clashflowId: dto.clashflowId,
        createdBy: dto.userId,
        filePath: '',
        currencyId: dto.currencyId,
        accountCurrencyId: dto.accountCurrencyId,
        taxId: dto.taxId,
        bankId: dto.bankId === 'null' ? null : dto.bankId,
        CCId: dto.CCId === 'null' ? null : dto.CCId,
        isBankAccount: dto.isBankAccount,
        isCreditCardAccount: dto.isCreditCardAccount,
        accountTypeId: parentTypeId,
        defaultId: maxAccountNumber + 1,
        show,
      };

      let newAccount = await this.accountRepository.create(data);

      console.log(newAccount);

      await newAccount.update({ filePath: `[${filePath},${newAccount.id}]` });

      if (parentTypeId === 1) {
        await BankAccountService.createBankAccount(newAccount.id, dto.userId);
      }
      if (parentTypeId === 7) {
        await CreditCardAccountService.createCreditCardAccount(
          newAccount.id,
          dto.userId,
        );
      }
      return newAccount;
    } catch (e) {
      console.error(e);
      throw new HttpException(e.message, 500);
    }
  }

  async getAccountsTreeByCompanyId(companyId) {
    try {
      return await this.accountRepository.sequelize
        .query(`select cte_2.id, cte_2."DRCRCode", cte_2."companyId", cte_2.amount,
        sum((case when cte_2."DRCRCode"='DR' then (cte_2.debit-cte_2.credit) else 0 end)) as debit,
        sum((case when cte_2."DRCRCode"='CR' then (cte_2.credit-cte_2.debit) else 0 end)) as credit,
        cte_2.code, cte_2.name, cte_2."groupId",
        cte_2.description, cte_2.remarks, cte_2."parentId", cte_2."currencyId", cte_2."accountCurrencyId",
        cte_2."taxId", cte_2.indelible, cte_2.active, cte_2."createdBy", cte_2."updatedBy",
        cte_2."createdDate", cte_2."updatedDate", cte_2.number, cte_2."filePath", cte_2."entityType", cte_2."taxTypeId",
        cte_2."assignToTaxAccountId", cte_2."clashflowId", cte_2."isBankAccount", cte_2."isCreditCardAccount", cte_2."accountTypeId", at."accountTypeName"
        from(
          WITH RECURSIVE cte_1 AS (
                  SELECT * FROM public.accounts
                  WHERE "companyId"=${companyId}
                  UNION ALL
                  SELECT e.* FROM cte_1 AS c
                  JOIN public.accounts e ON e."parentId" = c.id
                )
                SELECT cte_1.id, cte_1."companyId", cte_1."DRCRCode", cte_1.code, cte_1.name, cte_1."groupId",
                  cte_1.description, cte_1.remarks, cte_1."parentId", cte_1."currencyId", cte_1."accountCurrencyId",
                  cte_1."taxId", cte_1.indelible, cte_1.active, cte_1."createdBy", cte_1."updatedBy",
                      cte_1."createdDate", cte_1."updatedDate", cte_1.number, cte_1."filePath", cte_1."entityType",
                  tre.debit, tre.credit, tr.amount, cte_1."taxTypeId", cte_1."assignToTaxAccountId",  cte_1."clashflowId",
                  cte_1."isBankAccount", cte_1."isCreditCardAccount", cte_1."accountTypeId"
                FROM cte_1
                LEFT JOIN (
                  SELECT "accountId",
                  case when "DRCRCode" = 'DR' then sum(amount) else 0 end as debit,
                  case when "DRCRCode" = 'CR' then sum(amount) else 0 end as credit
                  FROM "transactionEntry"
                  group by "accountId", "DRCRCode"
                ) tre ON cte_1.id = tre."accountId"
              LEFT JOIN (
                  SELECT amount, "accountId"
                  FROM transaction
                  WHERE "transactionId" = 1
                ) tr ON cte_1.id = tr."accountId"
                group by cte_1.id, cte_1."DRCRCode",cte_1."companyId", cte_1.code, cte_1.name, cte_1."groupId",
                  cte_1.description, cte_1.remarks, cte_1."parentId", cte_1."currencyId", cte_1."accountCurrencyId",
                  cte_1."taxId", cte_1.indelible, cte_1.active, cte_1."createdBy", cte_1."updatedBy",
                  cte_1."createdDate", cte_1."updatedDate", cte_1.number, cte_1."filePath", cte_1."entityType",
                  tre.debit, tre.credit, tr.amount, cte_1."taxTypeId", cte_1."assignToTaxAccountId",  cte_1."clashflowId",
                  cte_1."isBankAccount", cte_1."isCreditCardAccount", cte_1."accountTypeId"
                order by cte_1.id) as cte_2
        LEFT JOIN "accountTypes" AS at ON at."accountTypeID" = cte_2."accountTypeId"
        group by cte_2.id, cte_2."DRCRCode", cte_2."companyId", cte_2.amount, cte_2.code, cte_2.name, cte_2."groupId",
        cte_2.description, cte_2.remarks, cte_2."parentId", cte_2."currencyId", cte_2."accountCurrencyId",
        cte_2."taxId", cte_2.indelible, cte_2.active, cte_2."createdBy", cte_2."updatedBy",
        cte_2."createdDate", cte_2."updatedDate", cte_2.number, cte_2."filePath", cte_2."entityType", cte_2."taxTypeId",
        cte_2."assignToTaxAccountId", cte_2."clashflowId", cte_2."isBankAccount", cte_2."isCreditCardAccount", cte_2."accountTypeId", at."accountTypeName"
        order by code`);
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async getAccountsTreeBalanceSheetByCompanyId(companyId, startDate, endDate) {
    try {
      return await this.accountRepository.sequelize
        .query(`select cte_2.id, cte_2."DRCRCode", cte_2."companyId", CAST(ROUND(CAST(cte_2.amount AS NUMERIC),3) AS DOUBLE PRECISION) AS amount,
        --sum((case when cte_2."DRCRCode"='DR' then (cte_2.debit-cte_2.credit) else 0 end)) as debit,
        --sum((case when cte_2."DRCRCode"='CR' then (cte_2.credit-cte_2.debit) else 0 end)) as credit,
        CAST(ROUND(CAST((case when
        sum((case when cte_2."DRCRCode"='CR' then cte_2.credit-cte_2.debit else 0 end))<0
        then abs(sum((case when cte_2."DRCRCode"='CR' then cte_2.credit-cte_2.debit else 0 end)))
        else
        (
        case when sum((case when cte_2."DRCRCode"='DR' then cte_2.debit-cte_2.credit else 0 end))<0
        then 0 else sum((case when cte_2."DRCRCode"='DR' then cte_2.debit-cte_2.credit else 0 end)) end
        )
        end) AS NUMERIC),3) AS DOUBLE PRECISION) as debit,
        CAST(ROUND(CAST((case when
        sum((case when cte_2."DRCRCode"='DR' then cte_2.debit-cte_2.credit else 0 end))<0
        then abs(sum((case when cte_2."DRCRCode"='DR' then cte_2.debit-cte_2.credit else 0 end)))
        else
        (
        case when sum((case when cte_2."DRCRCode"='CR' then cte_2.credit-cte_2.debit else 0 end))<0
        then 0 else sum((case when cte_2."DRCRCode"='CR' then cte_2.credit-cte_2.debit else 0 end)) end
        )
        end) AS NUMERIC),3) AS DOUBLE PRECISION) as credit,
        cte_2.code, cte_2.name, cte_2."groupId",
        cte_2.description, cte_2.remarks, cte_2."parentId", cte_2."currencyId", cte_2."accountCurrencyId",
        cte_2."taxId", cte_2.indelible, cte_2.active, cte_2."createdBy", cte_2."updatedBy",
        cte_2."createdDate", cte_2."updatedDate", cte_2.number, cte_2."filePath", cte_2."entityType", cte_2."taxTypeId",
        cte_2."assignToTaxAccountId", cte_2."clashflowId", cte_2."isBankAccount", cte_2."isCreditCardAccount",cte_2."finDocName", cte_2."accountTypeId",
        CAST(ROUND(CAST(ob.openingamount AS NUMERIC),3) AS DOUBLE PRECISION) as openingamount,
        (case when cte_2."DRCRCode" = 'DR' then CAST(ROUND(CAST(sum(cte_2.debit-cte_2.credit) AS NUMERIC),3) AS DOUBLE PRECISION) else CAST(ROUND(CAST(sum(cte_2.credit-cte_2.debit) AS NUMERIC),3) AS DOUBLE PRECISION) end) as endingbalance
        from(
          WITH RECURSIVE cte_1 AS (
                  SELECT * FROM public.accounts

                  WHERE "companyId"=${companyId}
                  UNION ALL
                  SELECT e.* FROM cte_1 AS c
                  JOIN public.accounts e ON e."parentId" = c.id
                )
                SELECT cte_1.id, cte_1."companyId", cte_1."DRCRCode", cte_1.code, cte_1.name, cte_1."groupId",
                  cte_1.description, cte_1.remarks, cte_1."parentId", cte_1."currencyId", cte_1."accountCurrencyId",
                  cte_1."taxId", cte_1.indelible, cte_1.active, cte_1."createdBy", cte_1."updatedBy",
                      cte_1."createdDate", cte_1."updatedDate", cte_1.number, cte_1."filePath", cte_1."entityType",
                  tre.debit, tre.credit, tr.amount, cte_1."taxTypeId", cte_1."assignToTaxAccountId",  cte_1."clashflowId",
                  cte_1."isBankAccount", cte_1."isCreditCardAccount",coa."finDocName", cte_1."accountTypeId"
                FROM cte_1
                LEFT JOIN (
                  SELECT te."accountId",
                  case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end as debit,
                  case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end as credit
                  FROM "transactionEntry" te
					inner join transaction t on t.id=te."transactionId"
					and
					t."transactionDate" <= '${endDate}'
                  group by te."accountId", te."DRCRCode"

				  UNION ALL
				  SELECT
				  id,
				  (case when public.get_currentearnings(${companyId},'${startDate}','${endDate}')<0 then public.get_currentearnings(${companyId},'${startDate}','${endDate}')*-1 else 0 end),
				  (case when public.get_currentearnings(${companyId},'${startDate}','${endDate}')>0 then public.get_currentearnings(${companyId},'${startDate}','${endDate}') else 0 end)
				  from accounts where "companyId"=${companyId} and name='Net Current Earnings'
				  UNION ALL
				  SELECT
				 id,
				 (case when public.get_retainedearnings(${companyId},'${startDate}')<0 then public.get_retainedearnings(${companyId},'${startDate}')*-1 else 0 end),
				 (case when public.get_retainedearnings(${companyId},'${startDate}')>0 then public.get_retainedearnings(${companyId},'${startDate}') else 0 end)
				 from accounts where "companyId"=${companyId} and name='Retained Earnings'

                ) tre ON cte_1.id = tre."accountId"
              LEFT JOIN (
                  SELECT amount, "accountId"
                  FROM transaction
                  WHERE "transactionId" = 1
				  and "transactionDate" <= '${endDate}'

				  UNION ALL
				  SELECT
				  public.get_currentearnings(${companyId},'${startDate}','${endDate}'),id from accounts where "companyId"=${companyId} and name='Net Current Earnings'
				  UNION ALL
				  SELECT public.get_retainedearnings(${companyId},'${startDate}'),id from accounts where "companyId"=${companyId} and name='Retained Earnings'

                ) tr ON cte_1.id = tr."accountId"
			  LEFT JOIN (
				select ac.id, ty."finDocName" from types ty
				inner join classes cl on cl."typeId"=ty.id
				inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
				inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
				where ac."companyId"=${companyId}
                ) coa ON cte_1.id = coa.id

                group by cte_1.id, cte_1."DRCRCode",cte_1."companyId", cte_1.code, cte_1.name, cte_1."groupId",
                  cte_1.description, cte_1.remarks, cte_1."parentId", cte_1."currencyId", cte_1."accountCurrencyId",
                  cte_1."taxId", cte_1.indelible, cte_1.active, cte_1."createdBy", cte_1."updatedBy",
                  cte_1."createdDate", cte_1."updatedDate", cte_1.number, cte_1."filePath", cte_1."entityType",
                  tre.debit, tre.credit, tr.amount, cte_1."taxTypeId", cte_1."assignToTaxAccountId",  cte_1."clashflowId",
                  cte_1."isBankAccount", cte_1."isCreditCardAccount",coa."finDocName", cte_1."accountTypeId"
                order by cte_1.id) as cte_2
        LEFT JOIN (
          select
          o."accountId",
          (case when o.ADRCRCode='DR' then sum(o.debit-o.credit) else sum(o.credit-o.debit) end) openingamount
          from (
            SELECT te."accountId",
            (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
            (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit,
            a."DRCRCode" as ADRCRCode
            from transaction t
            inner join "transactionEntry" te on te."transactionId"=t.id and t."companyId"=te."companyId"
            inner join accounts a on a.id=te."accountId"
            inner join groups g on g.id=a."groupId" and g."companyId"=a."companyId"
            inner join classes c on c.id=g."classId" and c."companyId"=g."companyId"
            inner join types ty on ty.id=c."typeId"
            where t."companyId"=${companyId} and t."transactionType"='OPENING' and ty."finDocName"='BALANCE SHEET'
              group by te."accountId", te."DRCRCode", a."DRCRCode"
          ) as o
            group by o."accountId", o.ADRCRCode
        ) ob on ob."accountId"=cte_2.id
        
				where cte_2."finDocName"='BALANCE SHEET'
        group by cte_2.id, cte_2."DRCRCode", cte_2."companyId", cte_2.amount, cte_2.code, cte_2.name, cte_2."groupId",
        cte_2.description, cte_2.remarks, cte_2."parentId", cte_2."currencyId", cte_2."accountCurrencyId",
        cte_2."taxId", cte_2.indelible, cte_2.active, cte_2."createdBy", cte_2."updatedBy",
        cte_2."createdDate", cte_2."updatedDate", cte_2.number, cte_2."filePath", cte_2."entityType", cte_2."taxTypeId",
        cte_2."assignToTaxAccountId", cte_2."clashflowId", cte_2."isBankAccount", cte_2."isCreditCardAccount",cte_2."finDocName", cte_2."accountTypeId",ob.openingamount
        order by id`);
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async getAccountsTreeIncomeStatementByCompanyId(
    companyId,
    startDate,
    endDate,
  ) {
    try {
      return await this.accountRepository.sequelize
        .query(`select cte_2.id, cte_2."DRCRCode", cte_2."companyId", CAST(ROUND(CAST(cte_2.amount AS NUMERIC),3) AS DOUBLE PRECISION) AS amount,
        --sum((case when cte_2."DRCRCode"='DR' then (cte_2.debit-cte_2.credit) else 0 end)) as debit,
        --sum((case when cte_2."DRCRCode"='CR' then (cte_2.credit-cte_2.debit) else 0 end)) as credit,
        CAST(ROUND(CAST((case when
        sum((case when cte_2."DRCRCode"='CR' then cte_2.credit-cte_2.debit else 0 end))<0
        then abs(sum((case when cte_2."DRCRCode"='CR' then cte_2.credit-cte_2.debit else 0 end)))
        else
        (
        case when sum((case when cte_2."DRCRCode"='DR' then cte_2.debit-cte_2.credit else 0 end))<0
        then 0 else sum((case when cte_2."DRCRCode"='DR' then cte_2.debit-cte_2.credit else 0 end)) end
        )
        end) AS NUMERIC),3) AS DOUBLE PRECISION) as debit,
        CAST(ROUND(CAST((case when
        sum((case when cte_2."DRCRCode"='DR' then cte_2.debit-cte_2.credit else 0 end))<0
        then abs(sum((case when cte_2."DRCRCode"='DR' then cte_2.debit-cte_2.credit else 0 end)))
        else
        (
        case when sum((case when cte_2."DRCRCode"='CR' then cte_2.credit-cte_2.debit else 0 end))<0
        then 0 else sum((case when cte_2."DRCRCode"='CR' then cte_2.credit-cte_2.debit else 0 end)) end
        )
        end) AS NUMERIC),3) AS DOUBLE PRECISION) as credit,
        cte_2.code, cte_2.name, cte_2."groupId",
        cte_2.description, cte_2.remarks, cte_2."parentId", cte_2."currencyId", cte_2."accountCurrencyId",
        cte_2."taxId", cte_2.indelible, cte_2.active, cte_2."createdBy", cte_2."updatedBy",
        cte_2."createdDate", cte_2."updatedDate", cte_2.number, cte_2."filePath", cte_2."entityType", cte_2."taxTypeId",
        cte_2."assignToTaxAccountId", cte_2."clashflowId", cte_2."isBankAccount", cte_2."isCreditCardAccount",cte_2."finDocName", cte_2."accountTypeId",
        CAST(ROUND(CAST(ob.openingamount AS NUMERIC),3) AS DOUBLE PRECISION) as openingamount,
        (case when cte_2."DRCRCode" = 'DR' then CAST(ROUND(CAST(sum(cte_2.debit-cte_2.credit) AS NUMERIC),3) AS DOUBLE PRECISION) else CAST(ROUND(CAST(sum(cte_2.credit-cte_2.debit) AS NUMERIC),3) AS DOUBLE PRECISION) end) as endingbalance
        from(
          WITH RECURSIVE cte_1 AS (
                  SELECT * FROM public.accounts

                  WHERE "companyId"=${companyId}
                  UNION ALL
                  SELECT e.* FROM cte_1 AS c
                  JOIN public.accounts e ON e."parentId" = c.id
                )
                SELECT cte_1.id, cte_1."companyId", cte_1."DRCRCode", cte_1.code, cte_1.name, cte_1."groupId",
                  cte_1.description, cte_1.remarks, cte_1."parentId", cte_1."currencyId", cte_1."accountCurrencyId",
                  cte_1."taxId", cte_1.indelible, cte_1.active, cte_1."createdBy", cte_1."updatedBy",
                      cte_1."createdDate", cte_1."updatedDate", cte_1.number, cte_1."filePath", cte_1."entityType",
                  tre.debit, tre.credit, tr.amount, cte_1."taxTypeId", cte_1."assignToTaxAccountId",  cte_1."clashflowId",
                  cte_1."isBankAccount", cte_1."isCreditCardAccount",coa."finDocName", cte_1."accountTypeId"
                FROM cte_1
                LEFT JOIN (
                  SELECT te."accountId",
                  case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end as debit,
                  case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end as credit
                  FROM "transactionEntry" te
          inner join transaction t on t.id=te."transactionId"
          and
          t."transactionDate" between '${startDate}' and '${endDate}'
                  group by te."accountId", te."DRCRCode"
                ) tre ON cte_1.id = tre."accountId"
              LEFT JOIN (
                  SELECT amount, "accountId"
                  FROM transaction
                  WHERE "transactionId" = 1
           and
          "transactionDate" between '${startDate}' and '${endDate}'
                ) tr ON cte_1.id = tr."accountId"
        LEFT JOIN (
        select ac.id, ty."finDocName" from types ty
        inner join classes cl on cl."typeId"=ty.id
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
        where ac."companyId"=${companyId}
                ) coa ON cte_1.id = coa.id

                group by cte_1.id, cte_1."DRCRCode",cte_1."companyId", cte_1.code, cte_1.name, cte_1."groupId",
                  cte_1.description, cte_1.remarks, cte_1."parentId", cte_1."currencyId", cte_1."accountCurrencyId",
                  cte_1."taxId", cte_1.indelible, cte_1.active, cte_1."createdBy", cte_1."updatedBy",
                  cte_1."createdDate", cte_1."updatedDate", cte_1.number, cte_1."filePath", cte_1."entityType",
                  tre.debit, tre.credit, tr.amount, cte_1."taxTypeId", cte_1."assignToTaxAccountId",  cte_1."clashflowId",
                  cte_1."isBankAccount", cte_1."isCreditCardAccount",coa."finDocName", cte_1."accountTypeId"
                order by cte_1.id) as cte_2
        LEFT JOIN (
          select
          o."accountId",
          (case when o.ADRCRCode='DR' then sum(o.debit-o.credit) else sum(o.credit-o.debit) end) openingamount
          from (
            SELECT te."accountId",
            (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
            (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit,
            a."DRCRCode" as ADRCRCode
            from transaction t
            inner join "transactionEntry" te on te."transactionId"=t.id and t."companyId"=te."companyId"
            inner join accounts a on a.id=te."accountId"
            inner join groups g on g.id=a."groupId" and g."companyId"=a."companyId"
            inner join classes c on c.id=g."classId" and c."companyId"=g."companyId"
            inner join types ty on ty.id=c."typeId"
            where t."companyId"=${companyId} and t."transactionType"='OPENING' and ty."finDocName"='INCOME STATEMENT'
              group by te."accountId", te."DRCRCode", a."DRCRCode"
          ) as o
            group by o."accountId", o.ADRCRCode
        ) ob on ob."accountId"=cte_2.id

        where cte_2."finDocName"='INCOME STATEMENT'
        group by cte_2.id, cte_2."DRCRCode", cte_2."companyId", cte_2.amount, cte_2.code, cte_2.name, cte_2."groupId",
        cte_2.description, cte_2.remarks, cte_2."parentId", cte_2."currencyId", cte_2."accountCurrencyId",
        cte_2."taxId", cte_2.indelible, cte_2.active, cte_2."createdBy", cte_2."updatedBy",
        cte_2."createdDate", cte_2."updatedDate", cte_2.number, cte_2."filePath", cte_2."entityType", cte_2."taxTypeId",
        cte_2."assignToTaxAccountId", cte_2."clashflowId", cte_2."isBankAccount", cte_2."isCreditCardAccount",cte_2."finDocName", cte_2."accountTypeId",ob.openingamount
        order by id`);
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async getDefaultAccountsTreeForRegistration() {
    try {
      return await this.accountRepository.sequelize
        .query(`WITH RECURSIVE cte_1 AS (
       SELECT * FROM public.accounts
       WHERE "companyId"=0
       UNION ALL
       SELECT e.* FROM cte_1 AS c
       JOIN public.accounts e ON e."parentId" = c.id
      )
      SELECT id, code, name, "DRCRCode", "groupId", "parentId", "defaultId", "defaultGroupId", "clashflowId", "accountTypeId" FROM cte_1
      group by id, code, name, "DRCRCode", "groupId", "parentId", "defaultId", "defaultGroupId", "clashflowId", "accountTypeId"
      order by id`);
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async getList(objWhere = {}, include = [], order = [['id', 'ASC']]) {
    return await this.accountRepository.findAll({
      where: objWhere,
      include: include,
      // order
    });
  }

  async getAllAccounts() {
    try {
      return await this.accountRepository.findAll();
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async getAllAccountsByCompanyId(companyId) {
    try {
      let accountArr: any = await this.accountRepository.findAll({
        where: {
          companyId,
          close: false,
          // entityType: {
          //   [Op.ne]: 'folder'
          // }
        },
        // include: [
        //   Account
        // ],
        order: [['code', 'ASC']],
      });
      accountArr.forEach((el) => {
        el.dataValues.isParent = false;
        if (accountArr.find((fd) => el.dataValues.id === fd.parentId))
          el.dataValues.isParent = true;
      });
      return accountArr;
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async getCompanyCashAndCashEquivalentsAccounts(companyId: number) {
    try {
      const group = await GroupService.getCompanyGroupByDefaultId(companyId, 1);
      return await this.accountRepository.findAll({
        where: {
          companyId,
          close: false,
          groupId: group.id,
        },
        order: [['code', 'ASC']],
      });
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async getAccountsByIdAndCompanyId(idArr, companyId) {
    try {
      return await this.accountRepository.findAll({
        where: {
          id: idArr,
          companyId,
          close: false,
        },
        order: [['code', 'ASC']],
      });
    } catch (e) {
      console.error(e);
      return e;
    }
  }

  async getAccountsRevenueByCopmanyId(companyId) {
    try {
      return await this.getAccountsLeafNodesByCondition(
        `"companyId" = ${companyId} AND code LIKE '4%' AND active = 'true'`,
      );
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async getAccountsNumberByCopmanyId(companyId, data) {
    try {
      return await this.getAccountsLeafNodesByCondition(
        `"companyId" = ${companyId} AND code LIKE '${data}%' AND active = 'true'`,
      );
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async getAccountsNonRevenueByCopmanyId(companyId) {
    try {
      return await this.getAccountsLeafNodesByCondition(
        `"companyId" = ${companyId} AND code LIKE '6%' AND active = 'true'`,
      );
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async getAccountsMiscellaneousIncomeByCopmanyId(companyId) {
    try {
      return await this.getAccountsLeafNodesByCondition(
        `"companyId" = ${companyId} AND (code LIKE '1%' OR code LIKE '2%') AND active = 'true'`,
      );
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async getAccountsLeafNodesByCondition(condition) {
    // console.log(condition);
    try {
      const accountsLeafNodes = await this.accountRepository.sequelize.query(`
        WITH RECURSIVE tree_path AS (
          SELECT id, "parentId", name, code, "DRCRCode", "accountTypeId", ARRAY[id] AS path
          FROM accounts
          WHERE NOT EXISTS (
            SELECT 1 FROM accounts AS a2
            WHERE a2."parentId" = accounts.id
          ) AND ${condition}
          UNION ALL
          SELECT a.id, a."parentId", a.name, a.code, a."DRCRCode", a."accountTypeId", tree_path.path || a.id
          FROM accounts AS a
          JOIN tree_path ON a.id = tree_path."parentId"
        )
        SELECT id, name, code, "DRCRCode", "accountTypeId"
        FROM tree_path
        WHERE NOT EXISTS (
          SELECT 1 FROM accounts AS a
          WHERE a."parentId" = tree_path.id
        )
        ORDER BY code ASC;
      `);
      return accountsLeafNodes[0];
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async getById(id) {
    return this.accountRepository.findByPk(id);
  }

  async getOneWithTransactions(id) {
    return await this.accountRepository.findOne({
      where: {
        id,
      },
      include: [Transaction],
    });
  }

  async getByGroupId(groupId) {
    try {
      return await Account.findAll({
        where: { groupId, entityType: 'account' },
      });
    } catch (e) {
      console.log(e);
      throw new HttpException(e.response, e.status);
    }
  }

  async updateAccount(id, dto: UpdateAccountDto) {
    try {
      return await this.accountRepository.update(
        {
          name: dto.name,
          number: dto.number,
          accountCurrencyId: dto.accountCurrencyId,
          // description: dto.description,
          // remarks: dto.remarks,
          clashflowId: dto.clashflowId,
          updatedBy: dto.userId,
          //active: dto.active,
          updatedDate: Date.now(),
        },
        {
          where: { id },
        },
      );
    } catch (e) {
      console.log(e);
      throw new HttpException(e, 500);
    }
  }

  async deleteAccount(id) {
    try {
      let account = await this.getOneWithTransactions(id);
      let childAccountCount = await this.getChildAccountsCount(id);
      let transactionCount = await this.transactionService.getCountByAccountId(
        id,
      );
      if (account.indelible)
        throw new HttpException('Account indelible status true', 400);
      if (childAccountCount > 0)
        throw new HttpException('Account have child accounts', 400);
      if (transactionCount > 0)
        throw new HttpException('Account have transactions', 400);
      return await account.destroy();
    } catch (e) {
      console.log(e);
      throw new HttpException(e.response, e.status);
    }
  }

  async changeAccountStatus(id, active) {
    return await this.accountRepository.update(
      {
        active,
      },
      {
        where: { id },
      },
    );
  }

  static async updateAccountDRCRCodeByGroup(groupId, companyId, DRCRCode) {
    await Account.update(
      {
        DRCRCode,
      },
      {
        where: {
          groupId,
          companyId,
        },
      },
    );
  }

  static async getAccountsCountByGroup(groupId, companyId) {
    return await Account.count({
      where: {
        groupId,
        companyId,
      },
    });
  }

  async createDefaultAccountsForCompany(data) {
    // console.log(`create newAccounts default tree: ${data}`);
    return await this.accountRepository.bulkCreate(data);
  }

  async updateNewCompanyAccounts(companyId) {
    return await this.accountRepository.sequelize.query(`
      UPDATE accounts
        SET "groupId"=groups.id
        FROM groups
        WHERE accounts."defaultGroupId" = groups."defaultId" AND groups."companyId"=${companyId} AND accounts."companyId"=${companyId};
        
      UPDATE accounts
        SET "filePath"=replace(groups."filePath", ']', CONCAT(',',accounts.id,']'))
        FROM groups
        WHERE groups.id = accounts."groupId" AND accounts."companyId"=${companyId} AND accounts."parentId" IS NULL;
        
      UPDATE accounts
        SET "parentId"=parent.id
        FROM accounts as parent
        WHERE accounts."companyId"=${companyId}
		     AND parent."companyId"=${companyId}	
         AND accounts."parentId" IS NOT NULL
         AND accounts."parentId"=parent."defaultId";

      UPDATE accounts
        SET "filePath"=replace(parent."filePath", ']', CONCAT(',',accounts.id,']'))
        FROM accounts as parent
        WHERE parent.id = accounts."parentId"
			    AND accounts."companyId"=${companyId}
			    AND accounts."parentId" IS NOT NULL
			    AND accounts."defaultId" IS NOT NULL;
  `);
  }

  static async getCompanyOpeningBalanceAccountId(companyId) {
    let account = await Account.findOne({
      where: {
        code: '3.1.1.1',
        companyId,
      },
    });
    return account.id;
  }

  static async getById(id) {
    return await Account.findByPk(id);
  }

  static async getAccountDRCRCodeById(id) {
    let account = await Account.findByPk(id);
    return account.DRCRCode;
  }

  static async getByNameAndCompanyId(name, companyId) {
    return await Account.findOne({ where: { name, companyId } });
  }

  static async getByCompanyId(companyId) {
    return await Account.findOne({ where: { companyId } });
  }

  static async getByAccountIdArr(arr): Promise<any[]> {
    return await Account.findAll({ where: { id: arr } });
  }

  async getGeneralLedgerWithFilters(conditions, order, pagination = '') {
    return await this.accountRepository.sequelize.query(`
      select
      t.id,t."transactionDate",t."transactionNo",t."transactionCode",t."transactionType",t."transactionDescription",
		  t.amount,sum(cte_1.debit) as debit,
		  sum(cte_1.credit) as credit,
		  sum(cte_1.taxamount) as taxamount,
		  t."isPosted", t."isVoid", t."isReverseCronDate", t."isReverse", t."checkedBy", t."isSendToAcc", t."postedDate", t."checkedDate", t."recorderDate"
      from transaction t
      inner join
      (
      	select
      	tr.id,
      	(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
      	(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit,
      	(case when te."isTax"='true' then sum(te.amount) else 0 end) as taxamount
      	from transaction as tr
      	inner join "transactionEntry" as te on te."transactionId"=tr.id and te."companyId"=tr."companyId"
      	inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
      	where ${conditions}
      	group by tr.id,te."DRCRCode",te."isTax"
      ) as cte_1 on cte_1.id=t.id
      group by t.id,t."transactionDate",t."transactionNo",t."transactionType"
      order by ${order.orderBy} ${order.order}
      ${pagination}
      `);
  }

  async getGeneralLedgerTransactionWithFilters(
    conditions,
    order,
    pagination,
    include = [],
    raw = true,
  ) {
    if (pagination) {
      return Transaction.findAll({
        where: conditions,
        include,
        raw,
        limit: pagination.count,
        offset: pagination.page,
        order: [[`transactionNo`, `DESC`]],
      });
    }

    return Transaction.findAll({
      where: conditions,
      include,
      raw,
      order: [[`transactionDate`, `DESC`]],
    });
  }

  async getAccountLedger(params) {
    return await this.accountRepository.sequelize.query(`
        select
        cte_1.id,cte_1."transactionDate",cte_1."transactionCode",cte_1."transactionNo",cte_1."transactionType",
        --cte_1."transactionDescription",
        (case when cte_1."transactionDescription" is null then '' else cte_1."transactionDescription" end) as "transactionDescription",
        cte_1."ADRCRCode",
        cte_1.code,
        cte_1.name,
        sum(cte_1.debit) as debit,
        sum(cte_1.credit) as credit,
        (case when cte_1."ADRCRCode"='DR' then (sum((0+sum(cte_1.debit)-sum(cte_1.credit))) over (order by cte_1."transactionDate",cte_1."transactionNo" )) else (sum((0-sum(cte_1.debit)+sum(cte_1.credit))) over (order by cte_1."transactionDate",cte_1."transactionNo"))  end) as balance,
        cte_1."finDocName"
        from
        (

        select
        0 as id,cast('${params.startDate}' as date)-1 as "transactionDate",'' as "transactionCode",'' as "transactionNo",'' as "transactionType",'Beginning Balance' as "transactionDescription",
        a."DRCRCode" as "ADRCRCode",
        a.code,
        a.name,
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit,
        t."finDocName"
        from transaction tr
        inner join "transactionEntry" te on te."transactionId"=tr.id and te."companyId"=tr."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        inner join groups g on g.id=a."groupId" and g."companyId"=a."companyId"
        inner join classes c on c.id=g."classId" and c."companyId"=g."companyId"
        inner join types t on t.id=c."typeId" 
        where te."accountId"=${params.accountId} and t."finDocName"='BALANCE SHEET'
        --and cast(to_char(tr."transactionDate", 'mm/dd/yyyy') as date) < cast('01/01/2023' as date)
        and cast(to_char(tr."transactionDate", 'mm/dd/yyyy') as date) < cast('${params.startDate}' as date)
        group by tr.id,tr."transactionDate",tr."transactionCode",tr."transactionNo",tr."transactionType",tr."transactionDescription",te."DRCRCode",a."DRCRCode", a.code, a.name, t."finDocName"
    
        union all

        select
        beg.id, beg."transactionDate",beg."transactionCode",beg."transactionNo",beg."transactionType",beg."transactionDescription",
        a."DRCRCode" as "ADRCRCode",
        a.code,
        a.name,
        beg.debit,
        beg.credit,
        t."finDocName"
        from (
        select
        0 as id,cast('${params.startDate}' as date)-1 as "transactionDate",'' as "transactionCode",'' as "transactionNo",'' as "transactionType",'Beginning Balance' as "transactionDescription",
        0 debit, 0 credit, ${params.accountId} as "accountId"
        where not exists (
        select
        0 as id,cast('${params.startDate}' as date)-1 as "transactionDate",'' as "transactionCode",'' as "transactionNo",'' as "transactionType",'Beginning Balance' as "transactionDescription",
        a."DRCRCode" as "ADRCRCode",
        a.code,
        a.name,
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit,
        t."finDocName"
        from transaction tr
        inner join "transactionEntry" te on te."transactionId"=tr.id and te."companyId"=tr."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        inner join groups g on g.id=a."groupId" and g."companyId"=a."companyId"
        inner join classes c on c.id=g."classId" and c."companyId"=g."companyId"
        inner join types t on t.id=c."typeId" 
        where te."accountId"=${params.accountId} and t."finDocName"='BALANCE SHEET'
        --and cast(to_char(tr."transactionDate", 'mm/dd/yyyy') as date) < cast('01/01/2023' as date)
        and cast(to_char(tr."transactionDate", 'mm/dd/yyyy') as date) < cast('${params.startDate}' as date)
        group by tr.id,tr."transactionDate",tr."transactionCode",tr."transactionNo",tr."transactionType",tr."transactionDescription",te."DRCRCode",a."DRCRCode", a.code, a.name, t."finDocName"
        )
        ) as beg
        inner join accounts a on a.id=beg."accountId"
        inner join groups g on g.id=a."groupId" and g."companyId"=a."companyId"
        inner join classes c on c.id=g."classId" and c."companyId"=g."companyId"
        inner join types t on t.id=c."typeId" and t."finDocName"='BALANCE SHEET'

        union all
        
        select
        tr.id,tr."transactionDate",tr."transactionCode",tr."transactionNo",tr."transactionType",
        --tr."transactionDescription"
        (case when tr."transactionDescription" is null then '' else tr."transactionDescription" end) as "transactionDescription",
        a."DRCRCode" as "ADRCRCode",
        a.code,
        a.name,
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit,
        t."finDocName"
        from transaction tr
        inner join "transactionEntry" te on te."transactionId"=tr.id and te."companyId"=tr."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        inner join groups g on g.id=a."groupId" and g."companyId"=a."companyId"
        inner join classes c on c.id=g."classId" and c."companyId"=g."companyId"
        inner join types t on t.id=c."typeId"
        where te."accountId"=${params.accountId}
        --and cast(to_char(tr."transactionDate", 'mm/dd/yyyy') as date) >= cast('01/01/2023' as date)
        --and cast(to_char(tr."transactionDate", 'mm/dd/yyyy') as date) <= cast('12/31/2023' as date)
        and cast(to_char(tr."transactionDate", 'mm/dd/yyyy') as date) >= cast('${params.startDate}' as date)
        and cast(to_char(tr."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
        group by tr.id,tr."transactionDate",tr."transactionCode",tr."transactionNo",tr."transactionType",tr."transactionDescription",te."DRCRCode",a."DRCRCode", a.code, a.name,t."finDocName"
        ) as cte_1
        group by cte_1.id,cte_1."transactionDate",cte_1."transactionCode",cte_1."transactionNo",cte_1."transactionType",cte_1."transactionDescription",cte_1."ADRCRCode", cte_1.code, cte_1.name,cte_1."finDocName"
        order by cte_1."transactionDate",cte_1."transactionNo"
        `);
  }

  filterForCompanyLedgerList(conditions, filter) {
    if (filter !== null) {
      switch (filter.filterBy) {
        case 'tax': {
          conditions =
            conditions +
            ` and tr."taxTypeId"=${filter.taxTypeId} and a."assignToTaxAccountId"=${filter.taxId}`;
          return conditions;
        }
        case 'account': {
          conditions = conditions + ` and tr."accountId"=${filter.accountId}`;
          return conditions;
        }
        case 'period': {
          conditions =
            conditions +
            ` and tr."transactionDate" between '${filter.startDate}' and '${filter.endDate}'`;
          return conditions;
        }
        case 'search': {
          switch (filter.searchType) {
            case 'less': {
              conditions = conditions + ` and t.amount<${filter.amount}`;
              return conditions;
            }
            case 'more': {
              conditions = conditions + ` and t.amount>${filter.amount}`;
              return conditions;
            }
            case 'equal': {
              conditions = conditions + ` and t.amount=${filter.amount}`;
              return conditions;
            }
            case 'between': {
              conditions =
                conditions +
                ` and t.amount between ${filter.fromAmount} and ${filter.beforeAmount}`;
              return conditions;
            }
          }
          return conditions;
        }
      }
    }
    return conditions;
  }

  orderForCompanyLedgerList(order) {
    if (order !== null) {
      switch (order.orderBy) {
        case 'id': {
          order.orderBy = `NULLIF(regexp_replace(t."transactionNo", '\\D', '', 'g'), '')::int`;
          return order;
        }
        case 'date': {
          order.orderBy = 't."transactionDate"';
          return order;
        }
        case 'amount': {
          order.orderBy = 't.amount';
          return order;
        }
        default: {
          //order.orderBy = 't."id"';
          order.orderBy = 't."transactionDate"';
          order.order = 'DESC';
          return order;
        }
      }
    }
  }

  transformCompanyLedgerList(list, transformBalance = true) {
    if (list.length > 0) {
      return list.map((x) => {
        if (x.isDeleted == true) {
          x.status = 'Deleted';
        } else if (x.isVoid == true) {
          x.status = 'Voided';
        } else if (x.isReverse == true) {
          x.status = 'Reversed';
        } else if (x.postedDate && !x.checkedDate && !x.recorderDate) {
          x.status = 'Added';
        } else if (x.postedDate && x.checkedDate && !x.recorderDate) {
          x.status = 'Checked';
        } else {
          x.status = 'Recorded';
        }
        // if (transformBalance) {
        //   x.debit = x.debit ? x.debit / 100 : 0;
        //   x.credit = x.credit ? x.credit / 100 : 0;
        //   x.taxamount = x.taxamount ? x.taxamount / 100 : 0;
        // }
        return x;
      });
    } else {
      return list;
    }
  }

  async getCompanyLedgerListWithPagination(
    companyId,
    transactionCode,
    filter,
    order,
    pagination,
    transactionType,
  ) {
    let conditions: any = `tr."companyId"=${companyId} and tr."transactionCode"='${transactionCode}'`;
    // console.log('transactionType');
    // console.log(transactionType);
    if (transactionType === 'INVENTORY')
      conditions = conditions + ` and tr."transactionType"='OPENING INVENTORY'`;
    conditions = this.filterForCompanyLedgerList(conditions, filter);
    pagination.page = pagination.page * pagination.count - pagination.count;
    let fieldCount;
    try {
      let result: any;
      if (transactionCode == 'DELETED') {
        conditions = {
          companyId,
          isDeleted: true,
        };
        if (filter) {
          if (filter.filterBy == 'period')
            conditions.transactionDate = {
              [Op.between]: [filter.startDate, filter.endDate],
            };
        }
        result = await this.getGeneralLedgerTransactionWithFilters(
          conditions,
          order,
          pagination,
          [{ model: CashReceiptHeaderModel }],
          false,
        );
        result = this.transformCompanyLedgerList(result);
        fieldCount = await this.transactionService.getTransactionCount(
          conditions,
        );
      } else if (transactionCode == 'VOID') {
        conditions = {
          companyId,
          isVoid: true,
        };
        if (filter) {
          if (filter.filterBy == 'period')
            conditions.transactionDate = {
              [Op.between]: [filter.startDate, filter.endDate],
            };
        }
        result = await this.getGeneralLedgerTransactionWithFilters(
          conditions,
          order,
          pagination,
        );
        result = this.transformCompanyLedgerList(result);
        fieldCount = await this.transactionService.getTransactionCount(
          conditions,
        );
      } else if (transactionCode == 'TEMPLATE') {
        conditions = {
          companyId,
          reference: {
            [Op.not]: null,
          },
        };
        if (filter) {
          if (filter.filterBy == 'period')
            conditions.transactionDate = {
              [Op.between]: [filter.startDate, filter.endDate],
            };
        }
        result = await this.getGeneralLedgerTransactionWithFilters(
          conditions,
          order,
          pagination,
        );
        result = this.transformCompanyLedgerList(result);
        fieldCount = await this.transactionService.getTransactionCount(
          conditions,
        );
      } else if (transactionCode == 'CASHRECEIPT') {
        conditions = {
          companyId,
          transactionCode: 'CASHRECEIPT',
          isVoid: false,
          isDeleted: false,
        };
        if (filter) {
          if (filter.filterBy == 'period')
            conditions.transactionDate = {
              [Op.between]: [filter.startDate, filter.endDate],
            };
        }
        result = await this.getGeneralLedgerTransactionWithFilters(
          conditions,
          order,
          pagination,
          [{ model: CashReceiptHeaderModel }],
          false,
        );
        result = this.transformCompanyLedgerList(result, false);
        fieldCount = await this.transactionService.getTransactionCount(
          conditions,
        );
      } else if (transactionCode == 'CASHDISBURSEMENT') {
        conditions = {
          companyId,
          transactionCode: 'CASHDISBURSEMENT',
          isVoid: false,
          isDeleted: false,
        };
        if (filter) {
          if (filter.filterBy == 'period')
            conditions.transactionDate = {
              [Op.between]: [filter.startDate, filter.endDate],
            };
        }
        result = await this.getGeneralLedgerTransactionWithFilters(
          conditions,
          order,
          pagination,
          [{ model: CashDisbursementHeaderModel }],
          false,
        );
        result = this.transformCompanyLedgerList(result, false);
        fieldCount = await this.transactionService.getTransactionCount(
          conditions,
        );
      } else {
        order = this.orderForCompanyLedgerList(order);
        result = await this.getGeneralLedgerWithFilters(
          conditions,
          order,
          `limit ${pagination.count} offset ${pagination.page}`,
        );
        result = this.transformCompanyLedgerList(result[0]);
        let allFields = await this.getGeneralLedgerWithFilters(
          conditions,
          order,
        );
        fieldCount = allFields[0].length;
      }
      const pageCount = Math.ceil(fieldCount / pagination.count);
      return {
        result,
        fieldCount,
        pageCount,
      };
    } catch (e) {
      throw new HttpException(`Error: ${e}`, 500);
    }
  }

  async getCompanyLedgerList(companyId, transactionCode, filter, order) {
    let conditions: any = `tr."companyId"=${companyId} and tr."transactionCode"='${transactionCode}'`;
    conditions = this.filterForCompanyLedgerList(conditions, filter);
    try {
      let result: any;
      if (transactionCode == 'DELETED') {
        conditions = {
          companyId,
          isDeleted: true,
        };
        if (filter) {
          if (filter.filterBy == 'period')
            conditions.transactionDate = {
              [Op.between]: [filter.startDate, filter.endDate],
            };
        }
        result = await this.getGeneralLedgerTransactionWithFilters(
          conditions,
          order,
          false,
        );
        result = this.transformCompanyLedgerList(result);
      } else if (transactionCode == 'VOID') {
        conditions = {
          companyId,
          isVoid: true,
        };
        if (filter) {
          if (filter.filterBy == 'period')
            conditions.transactionDate = {
              [Op.between]: [filter.startDate, filter.endDate],
            };
        }
        result = await this.getGeneralLedgerTransactionWithFilters(
          conditions,
          order,
          false,
        );
        result = this.transformCompanyLedgerList(result);
      } else if (transactionCode == 'TEMPLATE') {
        conditions = {
          companyId,
          reference: {
            [Op.not]: null,
          },
        };
        if (filter) {
          if (filter.filterBy == 'period')
            conditions.transactionDate = {
              [Op.between]: [filter.startDate, filter.endDate],
            };
        }
        result = await this.getGeneralLedgerTransactionWithFilters(
          conditions,
          order,
          false,
        );
        result = this.transformCompanyLedgerList(result);
      } else if (transactionCode == 'CASHRECEIPT') {
        conditions = {
          companyId,
          transactionCode: 'CASHRECEIPT',
          isVoid: false,
          isDeleted: false,
        };
        if (filter) {
          if (filter.filterBy == 'period')
            conditions.transactionDate = {
              [Op.between]: [filter.startDate, filter.endDate],
            };
        }
        result = await this.getGeneralLedgerTransactionWithFilters(
          conditions,
          order,
          false,
          [],
          false,
        );
        result = this.transformCompanyLedgerList(result, false);
      } else if (transactionCode == 'CASHDISBURSEMENT') {
        conditions = {
          companyId,
          transactionCode: 'CASHDISBURSEMENT',
          isVoid: false,
          isDeleted: false,
        };
        if (filter) {
          if (filter.filterBy == 'period')
            conditions.transactionDate = {
              [Op.between]: [filter.startDate, filter.endDate],
            };
        }
        result = await this.getGeneralLedgerTransactionWithFilters(
          conditions,
          order,
          false,
          [],
          false,
        );
        result = this.transformCompanyLedgerList(result, false);
      } else {
        order = this.orderForCompanyLedgerList(order);
        result = await this.getGeneralLedgerWithFilters(conditions, order);
        result = this.transformCompanyLedgerList(result[0]);
      }
      return {
        result,
      };
    } catch (e) {
      throw new HttpException(`Error: ${e}`, 500);
    }
  }

  async getAccountLedgerItem(params) {
    try {
      let result = await this.getAccountLedger(params);
      // let account = await this.getById(params.accountId);
      // let item = result[0].map;
      // item.
      return {
        item: result[0],
      };
    } catch (e) {
      throw new HttpException(`Error: ${e}`, 500);
    }
  }

  // async getSubsidiaryLedger(companyId, accountId, startDate, endDate) {
  //   try {
  //     let result = await this.accountRepository.sequelize.query(`                             --get client transactions--

  //         SELECT
  //         gld.id as clientid,0 as vendorid, 0 as employeeid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",
  //         sum(gld.debit) as debit,
  //         sum(gld.credit) as credit,
  //         (case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (partition by gld.id order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (partition by gld.id  order by gld.tid)) end) as endingbalance
  //         ,gld.tid as transactionid
  //   FROM (
  //         SELECT
  //         beg.id,0 as tid,
  //         NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",
  //         beg."ADRCRCode",
  //         sum(beg.debit) as debit,
  //         sum(beg.credit) as credit
  //         FROM (
  //         SELECT
  //         te."clientId" as ID,
  //         '' AS NAME, 'CLIENT' AS TYPE,te."DRCRCode",a."DRCRCode" as "ADRCRCode",
  //         (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
  //         (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
  //         FROM transaction t
  //         inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
  //         inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
  //         where t."companyId"=${companyId} and te."accountId"=${accountId}
  //         and te."clientId" is not null and te."vendorId" IS NULL --and te."isAllocated"='ALLOCATED'
  //         and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${startDate}' as date)
  //         group by te."clientId",te."DRCRCode",a."DRCRCode"
  //         ) as beg
  //         group by beg.id,beg."ADRCRCode"

  //         UNION ALL

  //         SELECT
  //         te."clientId" as ID,
  //         t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",
  //         a."DRCRCode" as "ADRCRCode",
  //         (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
  //         (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
  //         FROM transaction t
  //         inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
  //         inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
  //         where t."companyId"=${companyId} and te."accountId"=${accountId}
  //         and te."clientId" is not null and te."vendorId" IS NULL --and te."isAllocated"='ALLOCATED'
  //         and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)
  //         and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)
  //         group by te."clientId",t.id,te."DRCRCode",a."DRCRCode"
  //         ) as gld
  //         group by gld.id,gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode"

  //         --get client transactions--

  //         UNION ALL

  //         --get vendor transactions--

  //         SELECT
  //         0 as clientid, gld.id as vendorid, 0 as employeeid,gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",
  //         sum(gld.debit) as debit,
  //         sum(gld.credit) as credit,
  //         (case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (partition by gld.id order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (partition by gld.id  order by gld.tid)) end) as endingbalance
  //         ,gld.tid as transactionid
  //         FROM (
  //         SELECT
  //         beg.id,0 as tid,
  //         NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",
  //         beg."ADRCRCode",
  //         sum(beg.debit) as debit,
  //         sum(beg.credit) as credit
  //         FROM (
  //         SELECT
  //         te."vendorId" as ID,'' AS NAME, 'VENDOR' AS TYPE,te."DRCRCode",a."DRCRCode" as "ADRCRCode",
  //         (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
  //         (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
  //         FROM transaction t
  //         inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
  //   inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
  //         where t."companyId"=${companyId} and te."accountId"=${accountId}
  //         and te."clientId" IS NULL and te."vendorId" is not null
  //         --and te."employeeId" IS NULL
  //         --and te."isAllocated"='ALLOCATED'
  //         and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${startDate}' as date)
  //         group by te."vendorId",te."DRCRCode",a."DRCRCode"
  //         ) as beg
  //         group by beg.id,beg."ADRCRCode"

  //         UNION ALL

  //         SELECT
  //         te."vendorId" as ID,
  //         t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",
  //         a."DRCRCode" as "ADRCRCode",
  //   (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
  //         (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
  //         FROM transaction t
  //         inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
  //   inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
  //         where t."companyId"=${companyId} and te."accountId"=${accountId}
  //         and te."clientId" IS NULL and te."vendorId" is not null
  //         --and te."employeeId" IS NULL
  //         --and te."isAllocated"='ALLOCATED'
  //         and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)
  //         and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)
  //         group by te."vendorId",t.id,te."DRCRCode",a."DRCRCode"
  //         ) as gld
  //         group by gld.id,gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode"

  //         --get vendor transactions--

  //         UNION ALL

  //         --get employee transactions--

  //         SELECT
  //         0 as clientid, 0 as vendorid, gld.id as employeeid,gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",
  //         sum(gld.debit) as debit,
  //         sum(gld.credit) as credit,
  //         (case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (partition by gld.id order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (partition by gld.id  order by gld.tid)) end) as endingbalance
  //         ,gld.tid as transactionid
  //         FROM (
  //         SELECT
  //         beg.id,0 as tid,
  //         NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",
  //   beg."ADRCRCode",
  //         sum(beg.debit) as debit,
  //         sum(beg.credit) as credit
  //         FROM (
  //         SELECT
  //         te."employeeId" as ID,'' AS NAME, 'EMPLOYEE' AS TYPE,te."DRCRCode",a."DRCRCode" as "ADRCRCode",
  //         (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
  //         (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
  //         FROM transaction t
  //         inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
  //   inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
  //         where t."companyId"=${companyId} and te."accountId"=${accountId}
  //         --and te."clientId" IS NULL and te."vendorId" IS NULL
  //         and te."employeeId" is not null --and te."isAllocated"='ALLOCATED'
  //         and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${startDate}' as date)
  //         group by te."employeeId",te."DRCRCode",a."DRCRCode"
  //         ) as beg
  //         group by beg.id,beg."ADRCRCode"

  //         UNION ALL

  //         SELECT
  //         te."employeeId" as ID,
  //         t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",
  //         a."DRCRCode" as "ADRCRCode",
  //   (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
  //         (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
  //         FROM transaction t
  //         inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
  //   inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
  //         where t."companyId"=${companyId} and te."accountId"=${accountId}
  //         --and te."clientId" IS NULL and te."vendorId" IS NULL
  //         and te."employeeId" is not null --and te."isAllocated"='ALLOCATED'
  //         and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)
  //         and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)
  //         group by te."employeeId",t.id,te."DRCRCode",a."DRCRCode"
  //         ) as gld
  //         group by gld.id,gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode"

  //         --get employee transactions--

  // 	  UNION ALL

  // 	  --get unallocated transactions--
  // 	  SELECT
  //         0 as clientid,0 as vendorid, 0 as employeeid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",
  //         --gld."ADRCRCode",
  // 	  sum(gld.debit) as debit,
  //         sum(gld.credit) as credit,
  //         (case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (partition by gld.id order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (partition by gld.id order by gld.tid)) end) as endingbalance
  //         ,gld.tid as transactionid
  // 	  FROM (
  //         SELECT
  //         beg.id,0 as tid,
  //         NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",
  //         beg."ADRCRCode",
  // 	  sum(beg.debit) as debit,
  //         sum(beg.credit) as credit
  //         FROM (
  //         SELECT
  //         te."clientId" as ID,
  //         '' AS NAME, 'CLIENT' AS TYPE,te."DRCRCode",a."DRCRCode" as "ADRCRCode",
  //         (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
  //         (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
  //         FROM transaction t
  //         inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
  //       inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
  //        where t."companyId"=${companyId} and te."accountId"=${accountId}
  //         and te."clientId" is null and te."vendorId" IS NULL and te."employeeId" is null--and te."isAllocated"='ALLOCATED'
  //         and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${startDate}' as date)
  //         group by te."clientId",te."DRCRCode",a."DRCRCode"
  //         ) as beg
  //         group by beg.id,beg."ADRCRCode"

  //         UNION ALL

  //         SELECT
  //         te."clientId" as ID,
  //         t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",
  //         a."DRCRCode" as "ADRCRCode",
  //       (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
  //         (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
  //         FROM transaction t
  //         inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
  //       inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
  //         where t."companyId"=${companyId} and te."accountId"=${accountId}
  //         and te."clientId" is null and te."vendorId" IS NULL and te."employeeId" is null --and te."isAllocated"='ALLOCATED'
  //         and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)
  //         and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)
  //         group by te."clientId",t.id,te."DRCRCode",a."DRCRCode"
  //         ) as gld
  //         group by gld.id,gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode"
  //         --get unalloacted transactions--`);
  //     return result[0]
  //   } catch (e) {
  //     throw new HttpException(`Error: ${e}`, 500)
  //   }
  // }

  async getSubsidiaryLedger(companyId, accountId, startDate, endDate) {
    try {
      let result = await this.accountRepository.sequelize.query(`--CLIENT--
        SELECT * FROM
        (
        --get client subsidiary ledger--
        select
        c.clientid,c.vendorid,c.employeeid,c."transactionDate",c."transactionNo",c."transactionType",c."transactionDescription",c."createdBy",
        c.debit, c.credit,
        c.endingbalance,
        --(CASE WHEN c.endingbalance < 0 THEN '(' || TO_CHAR(ABS(c.endingbalance), '999999999.99') || ')' ELSE TO_CHAR(c.endingbalance, '999999999.99') END) AS endingbalance
        c.transactionid
        from (
        --get client transactions--
        SELECT
        gld.id as clientid,0 as vendorid, 0 as employeeid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",
        sum(gld.debit) as debit,
        sum(gld.credit) as credit,
        (case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (partition by gld.id order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (partition by gld.id  order by gld.tid)) end) as endingbalance
        ,gld.tid as transactionid, 1 key
        FROM (
        SELECT
        beg.id,0 as tid,
        NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",
        beg."ADRCRCode",
        sum(beg.debit) as debit,
        sum(beg.credit) as credit
        FROM (
        SELECT
        te."clientId" as ID,
        '' AS NAME, 'CLIENT' AS TYPE,te."DRCRCode",a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        inner join groups g on g.id=a."groupId" and g."companyId"=a."companyId"
        inner join classes c on c.id=g."classId" and c."companyId"=g."companyId"
        inner join types ty on ty.id=c."typeId"
        where t."companyId"=${companyId} and te."accountId"=${accountId} and ty."finDocName"='BALANCE SHEET'
        and te."clientId" is not null and te."vendorId" IS NULL --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${startDate}' as date)
        group by te."clientId",te."DRCRCode",a."DRCRCode"
        ) as beg
        group by beg.id,beg."ADRCRCode"

        UNION ALL

        SELECT
        te."clientId" as ID,
        t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",
        a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        where t."companyId"=${companyId} and te."accountId"=${accountId}
        and te."clientId" is not null and te."vendorId" IS NULL --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)  
        group by te."clientId",t.id,te."DRCRCode",a."DRCRCode"
        ) as gld
        group by gld.id,gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode"
        --get client transactions--

        UNION ALL

        --get totals client transactions--
        select
        t.clientid,
        0 as vendorid, 0 as employeeid, 'Sub-Total' as "transactionDate", '' as "transactionNo", '' as "transactionType", '' as "transactionDescription",'' as "createdBy",
        sum(t.debit) as debit, sum(t.credit) as credit,
        (case when t."ADRCRCode"='DR' then (sum(t.debit)-sum(t.credit)) else(sum(t.credit)-sum(t.debit)) end) endingbalance,
        0 transactionid, 2 key
        from (
        SELECT
        gld.id as clientid,0 as vendorid, 0 as employeeid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",
        sum(gld.debit) as debit,
        sum(gld.credit) as credit,
        (case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (partition by gld.id order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (partition by gld.id  order by gld.tid)) end) as endingbalance
        ,gld.tid as transactionid
        ,gld."ADRCRCode"
        FROM (
        SELECT
        beg.id,0 as tid,
        NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",
        beg."ADRCRCode",
        sum(beg.debit) as debit,
        sum(beg.credit) as credit
        FROM (
        SELECT
        te."clientId" as ID,
        '' AS NAME, 'CLIENT' AS TYPE,te."DRCRCode",a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        inner join groups g on g.id=a."groupId" and g."companyId"=a."companyId"
        inner join classes c on c.id=g."classId" and c."companyId"=g."companyId"
        inner join types ty on ty.id=c."typeId"
        where t."companyId"=${companyId} and te."accountId"=${accountId} and ty."finDocName"='BALANCE SHEET'
        and te."clientId" is not null and te."vendorId" IS NULL --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${startDate}' as date)
        group by te."clientId",te."DRCRCode",a."DRCRCode"
        ) as beg
        group by beg.id,beg."ADRCRCode"

        UNION ALL

        SELECT
        te."clientId" as ID,
        t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",
        a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        where t."companyId"=${companyId} and te."accountId"=${accountId}
        and te."clientId" is not null and te."vendorId" IS NULL --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)  
        group by te."clientId",t.id,te."DRCRCode",a."DRCRCode"
        ) as gld
        group by gld.id,gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode"
        ) t
        group by t.clientid, t."ADRCRCode"
        --get totals client transactions--

        ) c
        order by c.clientid, c.key, c.transactionid
        --get client subsidiary ledger--
        ) as slc
        --CLIENT--

        UNION ALL

        --VENDOR--
        SELECT * FROM
        (
        --get vendor subsidiary ledger--
        select
        c.clientid,c.vendorid,c.employeeid,c."transactionDate",c."transactionNo",c."transactionType",c."transactionDescription",c."createdBy",
        c.debit, c.credit,
        c.endingbalance,
        --(CASE WHEN c.endingbalance < 0 THEN '(' || TO_CHAR(ABS(c.endingbalance), '999999999.99') || ')' ELSE TO_CHAR(c.endingbalance, '999999999.99') END) AS endingbalance
        c.transactionid
        from (
        --get vendor transactions--
        SELECT
        0 as clientid, gld.id as vendorid, 0 as employeeid,gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",
        sum(gld.debit) as debit,
        sum(gld.credit) as credit,
        (case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (partition by gld.id order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (partition by gld.id  order by gld.tid)) end) as endingbalance
        ,gld.tid as transactionid, 1 key
        FROM (
        SELECT
        beg.id,0 as tid,
        NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",
        beg."ADRCRCode",
        sum(beg.debit) as debit,
        sum(beg.credit) as credit
        FROM (
        SELECT
        te."vendorId" as ID,'' AS NAME, 'VENDOR' AS TYPE,te."DRCRCode",a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        inner join groups g on g.id=a."groupId" and g."companyId"=a."companyId"
        inner join classes c on c.id=g."classId" and c."companyId"=g."companyId"
        inner join types ty on ty.id=c."typeId"
        where t."companyId"=${companyId} and te."accountId"=${accountId} and ty."finDocName"='BALANCE SHEET'
        and te."clientId" IS NULL and te."vendorId" is not null
        --and te."employeeId" IS NULL
        --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${startDate}' as date)
        group by te."vendorId",te."DRCRCode",a."DRCRCode"
        ) as beg
        group by beg.id,beg."ADRCRCode"

        UNION ALL

        SELECT
        te."vendorId" as ID,
        t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",
        a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        where t."companyId"=${companyId} and te."accountId"=${accountId}
        and te."clientId" IS NULL and te."vendorId" is not null
        --and te."employeeId" IS NULL
        --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)  
        group by te."vendorId",t.id,te."DRCRCode",a."DRCRCode"
        ) as gld
        group by gld.id,gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode"
        --get vendor transactions--

        UNION ALL

        --get totals vendor transactions--
        select
        0 as clientid,
        tv.vendorid as vendorid, 0 as employeeid, 'Sub-Total' as "transactionDate", '' as "transactionNo", '' as "transactionType", '' as "transactionDescription",'' as "createdBy",
        sum(tv.debit) as debit, sum(tv.credit) as credit,
        (case when tv."ADRCRCode"='DR' then (sum(tv.debit)-sum(tv.credit)) else(sum(tv.credit)-sum(tv.debit)) end) endingbalance,
        0 transactionid, 2 key
        from (
        SELECT
        0 as clientid, gld.id as vendorid, 0 as employeeid,gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",
        sum(gld.debit) as debit,
        sum(gld.credit) as credit,
        (case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (partition by gld.id order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (partition by gld.id  order by gld.tid)) end) as endingbalance
        ,gld.tid as transactionid
        ,gld."ADRCRCode"
        FROM (
        SELECT
        beg.id,0 as tid,
        NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",
        beg."ADRCRCode",
        sum(beg.debit) as debit,
        sum(beg.credit) as credit
        FROM (
        SELECT
        te."vendorId" as ID,'' AS NAME, 'VENDOR' AS TYPE,te."DRCRCode",a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        inner join groups g on g.id=a."groupId" and g."companyId"=a."companyId"
        inner join classes c on c.id=g."classId" and c."companyId"=g."companyId"
        inner join types ty on ty.id=c."typeId"
        where t."companyId"=${companyId} and te."accountId"=${accountId} and ty."finDocName"='BALANCE SHEET'
        and te."clientId" IS NULL and te."vendorId" is not null
        --and te."employeeId" IS NULL
        --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${startDate}' as date)
        group by te."vendorId",te."DRCRCode",a."DRCRCode"
        ) as beg
        group by beg.id,beg."ADRCRCode"

        UNION ALL

        SELECT
        te."vendorId" as ID,
        t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",
        a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        where t."companyId"=${companyId} and te."accountId"=${accountId}
        and te."clientId" IS NULL and te."vendorId" is not null
        --and te."employeeId" IS NULL
        --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)  
        group by te."vendorId",t.id,te."DRCRCode",a."DRCRCode"
        ) as gld
        group by gld.id,gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode"
        ) tv
        group by tv.vendorid, tv."ADRCRCode"
        --get totals vendor transactions--
        ) c
        order by c.vendorid, c.key, c.transactionid
        --get vendor subsidiary ledger--
        ) as slv
        --VENDOR--

        UNION ALL

        --EMPLOYEE--
        SELECT * FROM
        (
        --get employee subsidiary ledger--
        select
        c.clientid,c.vendorid,c.employeeid,c."transactionDate",c."transactionNo",c."transactionType",c."transactionDescription",c."createdBy",
        c.debit, c.credit,
        c.endingbalance,
        --(CASE WHEN c.endingbalance < 0 THEN '(' || TO_CHAR(ABS(c.endingbalance), '999999999.99') || ')' ELSE TO_CHAR(c.endingbalance, '999999999.99') END) AS endingbalance
        c.transactionid
        from (
        --get employee transactions--
        SELECT
        0 as clientid, 0 as vendorid, gld.id as employeeid,gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",
        sum(gld.debit) as debit,
        sum(gld.credit) as credit,
        (case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (partition by gld.id order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (partition by gld.id  order by gld.tid)) end) as endingbalance
        ,gld.tid as transactionid, 1 as key
        FROM (
        SELECT
        beg.id,0 as tid,
        NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",
        beg."ADRCRCode",
        sum(beg.debit) as debit,
        sum(beg.credit) as credit
        FROM (
        SELECT
        te."employeeId" as ID,'' AS NAME, 'EMPLOYEE' AS TYPE,te."DRCRCode",a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        inner join groups g on g.id=a."groupId" and g."companyId"=a."companyId"
        inner join classes c on c.id=g."classId" and c."companyId"=g."companyId"
        inner join types ty on ty.id=c."typeId"
        where t."companyId"=${companyId} and te."accountId"=${accountId} and ty."finDocName"='BALANCE SHEET'
        and te."clientId" IS NULL and te."vendorId" IS NULL
        and te."employeeId" is not null --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${startDate}' as date)
        group by te."employeeId",te."DRCRCode",a."DRCRCode"
        ) as beg
        group by beg.id,beg."ADRCRCode"

        UNION ALL

        SELECT
        te."employeeId" as ID,
        t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",
        a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        where t."companyId"=${companyId} and te."accountId"=${accountId}
        and te."clientId" IS NULL and te."vendorId" IS NULL
        and te."employeeId" is not null --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)  
        group by te."employeeId",t.id,te."DRCRCode",a."DRCRCode"
        ) as gld
        group by gld.id,gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode"
        --get employee transactions--

        UNION ALL

        --get totals employee transactions--
        select
        0 as clientid,
        0 as vendorid, tv.employeeid as employeeid, 'Sub-Total' as "transactionDate", '' as "transactionNo", '' as "transactionType", '' as "transactionDescription",'' as "createdBy",
        sum(tv.debit) as debit, sum(tv.credit) as credit,
        (case when tv."ADRCRCode"='DR' then (sum(tv.debit)-sum(tv.credit)) else(sum(tv.credit)-sum(tv.debit)) end) endingbalance,
        0 transactionid, 2 key
        from (
        SELECT
        0 as clientid, 0 as vendorid, gld.id as employeeid,gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",
        sum(gld.debit) as debit,
        sum(gld.credit) as credit,
        (case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (partition by gld.id order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (partition by gld.id  order by gld.tid)) end) as endingbalance
        ,gld.tid as transactionid,
        gld."ADRCRCode"
        FROM (
        SELECT
        beg.id,0 as tid,
        NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",
        beg."ADRCRCode",
        sum(beg.debit) as debit,
        sum(beg.credit) as credit
        FROM (
        SELECT
        te."employeeId" as ID,'' AS NAME, 'EMPLOYEE' AS TYPE,te."DRCRCode",a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        inner join groups g on g.id=a."groupId" and g."companyId"=a."companyId"
        inner join classes c on c.id=g."classId" and c."companyId"=g."companyId"
        inner join types ty on ty.id=c."typeId"
        where t."companyId"=${companyId} and te."accountId"=${accountId} and ty."finDocName"='BALANCE SHEET'
        and te."clientId" IS NULL and te."vendorId" IS NULL
        and te."employeeId" is not null --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${startDate}' as date)
        group by te."employeeId",te."DRCRCode",a."DRCRCode"
        ) as beg
        group by beg.id,beg."ADRCRCode"

        UNION ALL

        SELECT
        te."employeeId" as ID,
        t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",
        a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        where t."companyId"=${companyId} and te."accountId"=${accountId}
        and te."clientId" IS NULL and te."vendorId" IS NULL
        and te."employeeId" is not null --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)  
        group by te."employeeId",t.id,te."DRCRCode",a."DRCRCode"
        ) as gld
        group by gld.id,gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode"
        ) tv
        group by tv.employeeid, tv."ADRCRCode"
        --get totals employee transactions--
        ) c
        order by c.employeeid, c.key, c.transactionid
        --get employee subsidiary ledger--
        ) as sle
        --EMPLOYEE--

        UNION ALL

        --UNALLOCATED--
        SELECT * FROM
        (
        --get unallocated subsidiary ledger--
        select
        c.clientid,c.vendorid,c.employeeid,c."transactionDate",c."transactionNo",c."transactionType",c."transactionDescription",c."createdBy",
        c.debit, c.credit,
        c.endingbalance,
        --(CASE WHEN c.endingbalance < 0 THEN '(' || TO_CHAR(ABS(c.endingbalance), '999999999.99') || ')' ELSE TO_CHAR(c.endingbalance, '999999999.99') END) AS endingbalance
        c.transactionid
        from (
        --get unallocated transactions--
        SELECT
        0 as clientid,0 as vendorid, 0 as employeeid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",
        --gld."ADRCRCode",
        sum(gld.debit) as debit,
        sum(gld.credit) as credit,
        (case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (partition by gld.id order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (partition by gld.id order by gld.tid)) end) as endingbalance
        ,gld.tid as transactionid, 1 key
        FROM (
        SELECT
        beg.id,0 as tid,
        NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",
        beg."ADRCRCode",
        sum(beg.debit) as debit,
        sum(beg.credit) as credit
        FROM (
        SELECT
        te."clientId" as ID,
        '' AS NAME, 'CLIENT' AS TYPE,te."DRCRCode",a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        inner join groups g on g.id=a."groupId" and g."companyId"=a."companyId"
        inner join classes c on c.id=g."classId" and c."companyId"=g."companyId"
        inner join types ty on ty.id=c."typeId"
        where t."companyId"=${companyId} and te."accountId"=${accountId} and ty."finDocName"='BALANCE SHEET'
        and te."clientId" is null and te."vendorId" IS NULL and te."employeeId" is null--and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${startDate}' as date)
        group by te."clientId",te."DRCRCode",a."DRCRCode"
        ) as beg
        group by beg.id,beg."ADRCRCode"

        UNION ALL

        SELECT
        te."clientId" as ID,
        t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",
        a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        where t."companyId"=${companyId} and te."accountId"=${accountId}
        and te."clientId" is null and te."vendorId" IS NULL and te."employeeId" is null --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)  
        group by te."clientId",t.id,te."DRCRCode",a."DRCRCode"
        ) as gld
        group by gld.id,gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode"
        --get unalloacted transactions--

        UNION ALL

        --get totals unallocated transactions--
        select
        t.clientid,
        0 as vendorid, 0 as employeeid, 'Sub-Total' as "transactionDate", '' as "transactionNo", '' as "transactionType", '' as "transactionDescription",'' as "createdBy",
        sum(t.debit) as debit, sum(t.credit) as credit,
        (case when t."ADRCRCode"='DR' then (sum(t.debit)-sum(t.credit)) else(sum(t.credit)-sum(t.debit)) end) endingbalance,
        0 transactionid, 2 key
        from (
        SELECT
        0 as clientid,0 as vendorid, 0 as employeeid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",
        --gld."ADRCRCode",
        sum(gld.debit) as debit,
        sum(gld.credit) as credit,
        (case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (partition by gld.id order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (partition by gld.id order by gld.tid)) end) as endingbalance
        ,gld.tid as transactionid
        ,gld."ADRCRCode"
        FROM (
        SELECT
        beg.id,0 as tid,
        NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",
        beg."ADRCRCode",
        sum(beg.debit) as debit,
        sum(beg.credit) as credit
        FROM (
        SELECT
        te."clientId" as ID,
        '' AS NAME, 'CLIENT' AS TYPE,te."DRCRCode",a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        inner join groups g on g.id=a."groupId" and g."companyId"=a."companyId"
        inner join classes c on c.id=g."classId" and c."companyId"=g."companyId"
        inner join types ty on ty.id=c."typeId"
        where t."companyId"=${companyId} and te."accountId"=${accountId} and ty."finDocName"='BALANCE SHEET'
        and te."clientId" is null and te."vendorId" IS NULL and te."employeeId" is null--and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${startDate}' as date)
        group by te."clientId",te."DRCRCode",a."DRCRCode"
        ) as beg
        group by beg.id,beg."ADRCRCode"

        UNION ALL

        SELECT
        te."clientId" as ID,
        t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",
        a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        where t."companyId"=${companyId} and te."accountId"=${accountId}
        and te."clientId" is null and te."vendorId" IS NULL and te."employeeId" is null --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)    
        group by te."clientId",t.id,te."DRCRCode",a."DRCRCode"
        ) as gld
        group by gld.id,gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode"
        ) t
        group by t.clientid, t."ADRCRCode"
        --get totals unalloacted transactions--
        ) c
        order by c.clientid, c.key, c.transactionid
        --get unallocated subsidiary ledger--
        )as slu
        --UNALLOCATED--

        UNION ALL

        --GRAND TOTAL--
        SELECT
        --*
        0 as clientid,0 as vendorid, 0 as employeeid, '' as "transactionDate", '' as "transactionNo", '' as "transactionType", '' as "transactionDescription",'GRAND TOTAL' as "createdBy",
        --gt."ADRCRCode",
        sum(gt.debit) as gtDebit, sum(gt.credit) as gtCredit,
        (case when gt."ADRCRCode"='DR' then (sum(gt.debit)-sum(gt.credit)) else(sum(gt.credit)-sum(gt.debit)) end) grandtotal,
        --(CASE WHEN
        --(case when gt."ADRCRCode"='DR' then (sum(gt.debit)-sum(gt.credit)) else(sum(gt.credit)-sum(gt.debit)) end)
        --< 0 THEN '(' || TO_CHAR(ABS(
        --(case when gt."ADRCRCode"='DR' then (sum(gt.debit)-sum(gt.credit)) else(sum(gt.credit)-sum(gt.debit)) end)
        --), '999999999.99') || ')' ELSE TO_CHAR(
        --(case when gt."ADRCRCode"='DR' then (sum(gt.debit)-sum(gt.credit)) else(sum(gt.credit)-sum(gt.debit)) end)
        --, '999999999.99') END) AS grandtotal,
        0 AS transactionid
        FROM
        (
        --get totals client transactions--
        select
        t.clientid,
        0 as vendorid, 0 as employeeid, '' as "transactionDate", '' as "transactionNo", '' as "transactionType", '' as "transactionDescription",'' as "createdBy",
        sum(t.debit) as debit, sum(t.credit) as credit,
        (case when t."ADRCRCode"='DR' then (sum(t.debit)-sum(t.credit)) else(sum(t.credit)-sum(t.debit)) end) endingbalance,
        0 transactionid, 2 key, t."ADRCRCode"
        from (
        SELECT
        gld.id as clientid,0 as vendorid, 0 as employeeid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",
        sum(gld.debit) as debit,
        sum(gld.credit) as credit,
        (case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (partition by gld.id order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (partition by gld.id  order by gld.tid)) end) as endingbalance
        ,gld.tid as transactionid
        ,gld."ADRCRCode"
        FROM (
        SELECT
        beg.id,0 as tid,
        NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",
        beg."ADRCRCode",
        sum(beg.debit) as debit,
        sum(beg.credit) as credit
        FROM (
        SELECT
        te."clientId" as ID,
        '' AS NAME, 'CLIENT' AS TYPE,te."DRCRCode",a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        inner join groups g on g.id=a."groupId" and g."companyId"=a."companyId"
        inner join classes c on c.id=g."classId" and c."companyId"=g."companyId"
        inner join types ty on ty.id=c."typeId"
        where t."companyId"=${companyId} and te."accountId"=${accountId} and ty."finDocName"='BALANCE SHEET'
        and te."clientId" is not null and te."vendorId" IS NULL --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${startDate}' as date)
        group by te."clientId",te."DRCRCode",a."DRCRCode"
        ) as beg
        group by beg.id,beg."ADRCRCode"

        UNION ALL

        SELECT
        te."clientId" as ID,
        t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",
        a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        where t."companyId"=${companyId} and te."accountId"=${accountId}
        and te."clientId" is not null and te."vendorId" IS NULL --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)  
        group by te."clientId",t.id,te."DRCRCode",a."DRCRCode"
        ) as gld
        group by gld.id,gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode"
        ) t
        group by t.clientid, t."ADRCRCode"
        --get totals client transactions--

        UNION ALL

        --get totals vendor transactions--
        select
        0 as clientid,
        tv.vendorid as vendorid, 0 as employeeid, '' as "transactionDate", '' as "transactionNo", '' as "transactionType", '' as "transactionDescription",'' as "createdBy",
        sum(tv.debit) as debit, sum(tv.credit) as credit,
        (case when tv."ADRCRCode"='DR' then (sum(tv.debit)-sum(tv.credit)) else(sum(tv.credit)-sum(tv.debit)) end) endingbalance,
        0 transactionid, 2 key, tv."ADRCRCode"
        from (
        SELECT
        0 as clientid, gld.id as vendorid, 0 as employeeid,gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",
        sum(gld.debit) as debit,
        sum(gld.credit) as credit,
        (case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (partition by gld.id order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (partition by gld.id  order by gld.tid)) end) as endingbalance
        ,gld.tid as transactionid
        ,gld."ADRCRCode"
        FROM (
        SELECT
        beg.id,0 as tid,
        NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",
        beg."ADRCRCode",
        sum(beg.debit) as debit,
        sum(beg.credit) as credit
        FROM (
        SELECT
        te."vendorId" as ID,'' AS NAME, 'VENDOR' AS TYPE,te."DRCRCode",a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        inner join groups g on g.id=a."groupId" and g."companyId"=a."companyId"
        inner join classes c on c.id=g."classId" and c."companyId"=g."companyId"
        inner join types ty on ty.id=c."typeId"
        where t."companyId"=${companyId} and te."accountId"=${accountId} and ty."finDocName"='BALANCE SHEET'
        and te."clientId" IS NULL and te."vendorId" is not null
        --and te."employeeId" IS NULL
        --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${startDate}' as date)
        group by te."vendorId",te."DRCRCode",a."DRCRCode"
        ) as beg
        group by beg.id,beg."ADRCRCode"

        UNION ALL

        SELECT
        te."vendorId" as ID,
        t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",
        a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        where t."companyId"=${companyId} and te."accountId"=${accountId}
        and te."clientId" IS NULL and te."vendorId" is not null
        --and te."employeeId" IS NULL
        --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)  
        group by te."vendorId",t.id,te."DRCRCode",a."DRCRCode"
        ) as gld
        group by gld.id,gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode"
        ) tv
        group by tv.vendorid, tv."ADRCRCode"
        --get totals vendor transactions--

        UNION ALL

        --get totals employee transactions--
        select
        0 as clientid,
        0 as vendorid, tv.employeeid as employeeid, '' as "transactionDate", '' as "transactionNo", '' as "transactionType", '' as "transactionDescription",'' as "createdBy",
        sum(tv.debit) as debit, sum(tv.credit) as credit,
        (case when tv."ADRCRCode"='DR' then (sum(tv.debit)-sum(tv.credit)) else(sum(tv.credit)-sum(tv.debit)) end) endingbalance,
        0 transactionid, 2 key, tv."ADRCRCode"
        from (
        SELECT
        0 as clientid, 0 as vendorid, gld.id as employeeid,gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",
        sum(gld.debit) as debit,
        sum(gld.credit) as credit,
        (case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (partition by gld.id order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (partition by gld.id  order by gld.tid)) end) as endingbalance
        ,gld.tid as transactionid,
        gld."ADRCRCode"
        FROM (
        SELECT
        beg.id,0 as tid,
        NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",
        beg."ADRCRCode",
        sum(beg.debit) as debit,
        sum(beg.credit) as credit
        FROM (
        SELECT
        te."employeeId" as ID,'' AS NAME, 'EMPLOYEE' AS TYPE,te."DRCRCode",a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        inner join groups g on g.id=a."groupId" and g."companyId"=a."companyId"
        inner join classes c on c.id=g."classId" and c."companyId"=g."companyId"
        inner join types ty on ty.id=c."typeId"
        where t."companyId"=${companyId} and te."accountId"=${accountId} and ty."finDocName"='BALANCE SHEET'
        and te."clientId" IS NULL and te."vendorId" IS NULL
        and te."employeeId" is not null --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${startDate}' as date)
        group by te."employeeId",te."DRCRCode",a."DRCRCode"
        ) as beg
        group by beg.id,beg."ADRCRCode"

        UNION ALL

        SELECT
        te."employeeId" as ID,
        t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",
        a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        where t."companyId"=${companyId} and te."accountId"=${accountId}
        and te."clientId" IS NULL and te."vendorId" IS NULL
        and te."employeeId" is not null --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)  
        group by te."employeeId",t.id,te."DRCRCode",a."DRCRCode"
        ) as gld
        group by gld.id,gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode"
        ) tv
        group by tv.employeeid, tv."ADRCRCode"
        --get totals employee transactions--

        UNION ALL

        --get totals unallocated transactions--
        select
        t.clientid,
        0 as vendorid, 0 as employeeid, '' as "transactionDate", '' as "transactionNo", '' as "transactionType", '' as "transactionDescription",'' as "createdBy",
        sum(t.debit) as debit, sum(t.credit) as credit,
        (case when t."ADRCRCode"='DR' then (sum(t.debit)-sum(t.credit)) else(sum(t.credit)-sum(t.debit)) end) endingbalance,
        0 transactionid, 2 key, t."ADRCRCode"
        from (
        SELECT
        0 as clientid,0 as vendorid, 0 as employeeid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",
        --gld."ADRCRCode",
        sum(gld.debit) as debit,
        sum(gld.credit) as credit,
        (case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (partition by gld.id order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (partition by gld.id order by gld.tid)) end) as endingbalance
        ,gld.tid as transactionid
        ,gld."ADRCRCode"
        FROM (
        SELECT
        beg.id,0 as tid,
        NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",
        beg."ADRCRCode",
        sum(beg.debit) as debit,
        sum(beg.credit) as credit
        FROM (
        SELECT
        te."clientId" as ID,
        '' AS NAME, 'CLIENT' AS TYPE,te."DRCRCode",a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        inner join groups g on g.id=a."groupId" and g."companyId"=a."companyId"
        inner join classes c on c.id=g."classId" and c."companyId"=g."companyId"
        inner join types ty on ty.id=c."typeId"
        where t."companyId"=${companyId} and te."accountId"=${accountId} and ty."finDocName"='BALANCE SHEET'
        and te."clientId" is null and te."vendorId" IS NULL and te."employeeId" is null--and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${startDate}' as date)
        group by te."clientId",te."DRCRCode",a."DRCRCode"
        ) as beg
        group by beg.id,beg."ADRCRCode"

        UNION ALL

        SELECT
        te."clientId" as ID,
        t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",
        a."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
        where t."companyId"=${companyId} and te."accountId"=${accountId}
        and te."clientId" is null and te."vendorId" IS NULL and te."employeeId" is null --and te."isAllocated"='ALLOCATED'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)    
        group by te."clientId",t.id,te."DRCRCode",a."DRCRCode"
        ) as gld
        group by gld.id,gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode"
        ) t
        group by t.clientid, t."ADRCRCode"
        --get totals unalloacted transactions--
        ) as gt
        group by gt."ADRCRCode"
        --GRAND TOTAL--`);
      return result[0];
    } catch (e) {
      throw new HttpException(`Error: ${e}`, 500);
    }
  }

  async addTaxForAccount(accountId, dto: CreateTaxAccountDto) {
    const account = await this.getById(accountId);
    if (!account) throw new HttpException('Account not found', 404);
    try {
      await account.update({ taxId: dto.taxId, taxTypeId: dto.taxTypeId });
    } catch (error) {
      throw new HttpException(`Error: ${error}`, 500);
    }
  }

  async accountWithTaxDirectories(companyId) {
    let groups = await GroupService.getAllGroupsByCompanyId(companyId);
    let accounts = await this.getAllAccountsByCompanyId(companyId);
    return {
      groups,
      accounts,
    };
  }

  async createAccountWithTax(dto: CreateAccountDto) {
    let parentCodes;
    let maxAccountNumber;
    let filePath = dto.filePath;
    let parentId = dto.parentId;

    if (parentId === null || parentId === 'null') {
      parentCodes = await GroupService.getGroupCodesById(dto.groupId);
      maxAccountNumber = await this.accountRepository.count({
        where: { groupId: dto.groupId, companyId: dto.companyId },
      });
    } else {
      parentCodes = await this.getParentAccountCodes(parentId);
      maxAccountNumber = await this.accountRepository.count({
        where: { parentId },
      });
    }

    let data = {
      code: `${parentCodes.code}.${maxAccountNumber + 1}`,
      DRCRCode: parentCodes.DRCRCode,
      name: dto.name,
      groupId: dto.groupId,
      parentId: parentId === 'null' ? null : parentId,
      entityType: 'account',
      active: true,
      companyId: dto.companyId,
      createdDate: Date.now(),
      clashflowId: dto.clashflowId,
      createdBy: dto.userId,
      filePath: '',
      currencyId: dto.currencyId,
      accountCurrencyId: dto.accountCurrencyId,
      taxId: dto.taxId,
      taxTypeId: dto.taxTypeId,
      bankId: dto.bankId === 'null' ? null : dto.bankId,
      CCId: dto.CCId === 'null' ? null : dto.CCId,
      isBankAccount: false,
      isCreditCardAccount: false,
      defaultId: maxAccountNumber + 1,
    };

    let newAccount = await this.accountRepository.create(data);
    await newAccount.update({ filePath: `[${filePath},${newAccount.id}]` });

    let accountOpenBalance = await AccountService.getByNameAndCompanyId(
      'Opening Balance Equity',
      dto.companyId,
    );

    let maxTransactionNumber = await Transaction.count({
      where: {
        transactionCode: 'GENERAL',
        companyId: dto.companyId,
      },
    });

    let newTransaction = await Transaction.create({
      transactionDescription: '',
      reference: null,
      transactionId: 1,
      transactionCode: 'GENERAL',
      transactionType: 'OPENING',
      transactionNo: `GJ${maxTransactionNumber + 1}`,
      transactionDate: Number(Date.now()),
      transactionCurrency: dto.accountCurrencyId,
      foreignCurrency: null,
      isPosted: true,
      postedDate: Date.now(),
      createdBy: dto.userId,
      createdDate: Date.now(),
      recorderBy: dto.userId,
      recorderDate: Date.now(),
      companyId: dto.companyId,
      accountId: newAccount.id,
      amount: dto.amount,
      foreignAmount: dto.amount,
      exchangeRate: null,
      taxTypeId: 1,
    });

    let transactionEntry = await TransactionEntryService.openBalance({
      transactionId: newTransaction.id,
      companyId: dto.companyId,
      accountId: newAccount.id,
      DRCRCode: parentCodes.DRCRCode,
      userId: dto.userId,
      transactionOpeningBalance: dto.amount,
      foreignAmount: dto.accountCurrencyId,
    });

    let transactionEntryOpeningBalance =
      await TransactionEntryService.openBalance({
        transactionId: newTransaction.id,
        companyId: dto.companyId,
        accountId: accountOpenBalance.id,
        DRCRCode: parentCodes.DRCRCode === 'DR' ? 'CR' : 'DR',
        userId: dto.userId,
        transactionOpeningBalance: dto.amount,
        foreignAmount: dto.accountCurrencyId,
      });

    newTransaction.setDataValue('transactionEntry', [
      transactionEntry,
      transactionEntryOpeningBalance,
    ]);

    newAccount.setDataValue('transaction', newTransaction);

    return newAccount;
  }

  async updateNameAccount(accountId, dto: UpdateNameAccountDto) {
    const account = await this.getById(accountId);
    if (!account) throw new HttpException('Account not found', 404);
    try {
      await account.update({ name: dto.name });
    } catch (error) {
      throw new HttpException(`Error: ${error}`, 500);
    }
  }

  async updateZeroTaxAccount(accountId) {
    const account = await this.getById(accountId);
    if (!account) return null;
    if (account.zeroTax == false) {
      await this.accountRepository.update(
        { zeroTax: false },
        {
          where: {
            companyId: account.companyId,
            accountTypeId: account.accountTypeId,
          },
        },
      );
      await account.update({ zeroTax: true, exemptTax: false, noTax: false });
    } else {
      await account.update({ zeroTax: false });
    }
  }

  async updateExemptTaxAccount(accountId) {
    const account = await this.getById(accountId);
    if (!account) return null;
    if (account.exemptTax == false) {
      await this.accountRepository.update(
        { exemptTax: false },
        {
          where: {
            companyId: account.companyId,
            accountTypeId: account.accountTypeId,
          },
        },
      );
      await account.update({ exemptTax: true, zeroTax: false, noTax: false });
    } else {
      await account.update({ exemptTax: false });
    }
  }

  async updateNoTaxAccount(accountId) {
    const account = await this.getById(accountId);
    if (!account) return null;
    if (account.exemptTax == false) {
      await this.accountRepository.update(
        { noTax: false },
        {
          where: {
            companyId: account.companyId,
            accountTypeId: account.accountTypeId,
          },
        },
      );
      await account.update({ noTax: true, exemptTax: false, zeroTax: false });
    } else {
      await account.update({ exemptTax: false });
    }
  }

  async updateActiveAccount(accountId, dto: UpdateActiveAccountDto) {
    const account = await this.getById(accountId);
    if (!account) throw new HttpException('Account not found', 404);
    try {
      let checkFolder = await this.accountRepository.findAll({
        where: { parentId: accountId, active: true },
      });
      if (checkFolder.length === 0)
        await account.update({ active: dto.active });
      else {
        throw new HttpException('Deactivate sub-account', 404);
      }
    } catch (error) {
      throw new HttpException(`Error: ${error}`, 500);
    }
  }

  async getAccountOnlyTax(companyId) {
    let saleTax = await this.saleTaxService.getAll();
    let withHoldingTax = await this.withHoldingTaxService.getAll();
    let accountArr: any = await this.accountRepository.findAll({
      where: {
        companyId,
        taxId: {
          [Op.not]: null,
        },
        taxTypeId: {
          [Op.not]: null,
        },
      },
      include: [
        {
          model: Group,
        },
        {
          model: Transaction,
        },
      ],
    });
    return accountArr.map((acc) => {
      let findTax: any = 'No tax';
      if (acc.taxTypeId === 1) {
        findTax = saleTax.find((findTax) => findTax.id === acc.taxId);
        acc.dataValues.nameTax = '';
        //x.nameTax = findTax ? findTax.name : 'No tax';
        acc.dataValues.codeTax = findTax ? findTax.code : 'No tax';
        acc.dataValues.valueTax = findTax ? findTax.rate[0].rate : null;
      } else if (acc.taxTypeId === 2) {
        findTax = withHoldingTax.find((findTax) => findTax.id === acc.taxId);
        acc.dataValues.nameTax = '';
        //x.nameTax = findTax ? findTax.name : 'No tax';
        acc.dataValues.codeTax = findTax ? findTax.code : 'No tax';
        acc.dataValues.valueTax = findTax ? findTax.rate[0].rate : null;
      } else if (acc.assignToTaxAccountId) {
        let parentTax = accountArr.find(
          (parentTax) => acc.assignToTaxAccountId === parentTax.id,
        );
        if (parentTax) {
          if (parentTax.taxTypeId === 1) {
            findTax = saleTax.find((findTax) => findTax.id === parentTax.taxId);
            acc.dataValues.nameTax = findTax ? findTax.name : 'No tax';
            acc.dataValues.codeTax = findTax ? findTax.code : 'No tax';
            acc.dataValues.valueTax = findTax ? findTax.rate[0].rate : null;
          } else {
            findTax = withHoldingTax.find(
              (findTax) => findTax.id === parentTax.taxId,
            );
            acc.dataValues.nameTax = findTax ? findTax.name : 'No tax';
            acc.dataValues.codeTax = findTax ? findTax.code : 'No tax';
            acc.dataValues.valueTax = findTax ? findTax.rate[0].rate : null;
          }
        }
      }
      //else {
      //   x.nameTax = findTax
      // }
      return acc;
    });
  }

  async getAccountOnlyBank(companyId) {
    //return await BankAccountService.getBankAccount();
    let result = await this.accountRepository.sequelize.query(`SELECT
                gld."dbCode",gld."accountName",
                gld."ADRCRCode",
                gld."accountId",
                sum(gld.debit) as debit,
                sum(gld.credit) as credit,
                (case when gld."ADRCRCode"='DR' then  (sum(gld.debit)-sum(gld.credit)) else (sum(gld.credit)-sum(gld.debit))  end) as endbalance
                FROM
                (
                SELECT
                ac.code as "dbCode",ac.name as "accountName",
                ac."DRCRCode" as "ADRCRCode", ac.id as "accountId",
                (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
                (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
                from types ty
                inner join classes cl on cl."typeId"=ty.id
                inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
                inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
                inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
                inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
                where t."companyId"=${companyId} and ac."accountTypeId"=1
                group by ac.code,ac.name,te."DRCRCode",ac."DRCRCode", ac.id) as gld
                group by gld."dbCode",gld."accountName",gld."ADRCRCode", gld."accountId"
                `); 

    let currentBalanceArr: any = result[0];
    let bankAccountArr: any = await this.accountRepository.findAll({
      where: {
        companyId,
        accountTypeId: 1,
        //entityType: 'account'
      },
      include: [
        {
          model: Group,
        },
        {
          model: BankAccount,
          include: [
            {
              model: BankAccountType,
            },
            {
              model: SaleTax,
            },
          ],
        },
      ],
    });
    let bankAccountResultArr = bankAccountArr.map((x) => {
      x.dataValues.currentBalance = 0;
      let find = currentBalanceArr.find((cb) => cb.accountId === x.id);
      if (find) x.dataValues.currentBalance = Number(find.endbalance);
      x.dataValues.outOfBalance = x.dataValues.currentBalance;
      return x;
    });
    //console.log(bankAccountResultArr)
    return bankAccountResultArr;
    // return (await this.accountRepository.findAll({
    //   where: {
    //     companyId,
    //     accountTypeId: 1,
    //     //entityType: 'account'
    //   },
    //   include: [
    //     {
    //       model: Group
    //     },
    //     {
    //       model: BankAccount,
    //     }
    //   ]
    // }));
  }

    async getAccountOnlyBank2(companyId) {
    let result = await this.accountRepository.sequelize.query(`SELECT 
            public.accounts.code as dbCode, 
            public.accounts.name as accountName,
            public.accounts."DRCRCode" as ADRCRCode,
            public.accounts.id as accountId,
            public.accounts.id as debit,
            public.accounts.id as credit,
            public.accounts.id as endbalance
            FROM public.accounts
            WHERE "companyId" = ${companyId}  
              AND "accountTypeId" = 1
              AND NOT EXISTS (
                SELECT 1 FROM "public"."user-accounts" ua
                WHERE ua."accountId" = accounts."id"
                  AND ua."companyId" = ${companyId} 
                  AND ua."cashAccountTypeId" = '1'
              )
            ORDER BY
                public.accounts.name ASC;
                            `); 

      return result[0]; // getAccountOnlyBank2
  }

  async getAccountOnlyCreditCard(companyId) {
    // console.log('companyId');
    // console.log(companyId);

    const result = await this.accountRepository.findAll({
      where: {
        companyId,
        accountTypeId: 7,
        isCreditCardAccount: true,
        //entityType: 'account'
      },
      include: [
        {
          model: Group,
        },
        {
          model: CreditCardAccount,
          //required: true
        },
      ],
    });
    return result;
  }

  async assignAccountToTaxAccount(accountId, assignToTaxAccountId) {
    const account = await this.getById(accountId);
    if (!account) throw new HttpException('Account not found', 404);
    try {
      await account.update({ assignToTaxAccountId });
    } catch (error) {
      throw new HttpException(`Error: ${error}`, 500);
    }
  }

  // async getCompanyIncomeStatement (params) {
  //   try {
  //     let result: any = await this.accountRepository.sequelize.query(`select
  //       bs."sortOrder", bs.type, bs.class, bs.group, bs.account,
  //       sum((case when bs."DRCRCode"='DR' then (bs.debit-bs.credit)*-1 else bs.credit-bs.debit end)) AS Amount
  //       from
  //       (
  //       select
  //       ty."sortOrder",ty.name as type,cl.name as class,gp.name as group,ac.name as account,ac."DRCRCode",
  //       (case when te."DRCRCode" = 'DR' then sum(te.amount/100) else 0 end) as debit,
  //       (case when te."DRCRCode" = 'CR' then sum(te.amount/100) else 0 end) as credit
  //       from types ty
  //       inner join classes cl on cl."typeId"=ty.id
  //       inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
  //       inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
  //       inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
  //       inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
  //       where t."companyId"=${params.companyId} and ty."finDocName"='INCOME STATEMENT'and t."transactionDate" BETWEEN '${params.startDate}' AND '${params.endDate}'
  //       group by ty."sortOrder",ty.name,cl.name,gp.name,ac.name,ac."DRCRCode",te."DRCRCode") as bs
  //       group by bs."sortOrder", bs.type, bs.class, bs.group, bs.account
  //       UNION ALL
  //       select 6,'','','','NET CURRENT EARNINGS',public.get_currentearnings('${params.startDate}','${params.endDate}')`);
  //     return result[0]
  //   } catch (e) {
  //     console.log(e);
  //     return e
  //   }
  // }

  async getCompanyIncomeStatement(params) {
    try {
      let result: any;
      if (params.typeReport === 'QUARTERLY') {
        result = await this.accountRepository.sequelize.query(`
          
          SELECT
          is2.type,is2.class,is2.group,is2.account, sum(is2.totalytd) as amount, sum(is2.q1) as q1, sum(is2.q2) as q2, sum(is2.q3) as q3, sum(is2.q4) as q4
          FROM
          (
          SELECT 
          is1.typename as type,is1.classname as class,is1.groupname as group,is1.accountname as account, is1.key, is1.amount as totalytd
          ,coalesce(is1.q1,0) as q1,coalesce(is1.q2,0) as q2,coalesce(is1.q3,0) as q3,coalesce(is1.q4,0) as q4

          FROM
          (
          --get income statement details--
          select
          bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname,
          sum((case when bs."DRCRCode"='DR' then (bs.debit-bs.credit) else bs.credit-bs.debit end)) AS Amount,
          sum((case when bs.month in (1,2,3) then (case when bs."DRCRCode"='DR' then (bs.debit-bs.credit) else bs.credit-bs.debit end) end)) as q1,
          sum((case when bs.month in (4,5,6) then (case when bs."DRCRCode"='DR' then (bs.debit-bs.credit) else bs.credit-bs.debit end) end)) as q2,
          sum((case when bs.month in (7,8,9) then (case when bs."DRCRCode"='DR' then (bs.debit-bs.credit) else bs.credit-bs.debit end) end)) as q3,
          sum((case when bs.month in (10,11,12) then (case when bs."DRCRCode"='DR' then (bs.debit-bs.credit) else bs.credit-bs.debit end) end)) as q4,
          1 as key
          from
          (
          select
          ty."sortOrder",ty.code as typecode,ty.name as typename,cl.code as classcode,cl.name as classname,gp.code as groupcode,gp.name as groupname,
          ac.code as accountcode,ac.name as accountname,ac."DRCRCode",
          extract(month from t."transactionDate") as month,
          extract(year from t."transactionDate") as year,
          (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
          (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
          from types ty
          inner join classes cl on cl."typeId"=ty.id
          inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
          inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
          inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
          inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
          where t."companyId"=${params.companyId} and ty."finDocName"='INCOME STATEMENT'and t."transactionDate" between '${params.startDate}' and '${params.endDate}'
          group by ty."sortOrder",ty.code,ty.name,cl.code,cl.name,gp.code,gp.name,ac.code,ac.name,ac."DRCRCode",te."DRCRCode",t."transactionDate") as bs
          group by bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname, bs.month,bs.year
          --get income statement details--

          UNION ALL

          --get totals by class--
          select
          totals."sortOrder", totals.typecode, totals.typename, totals.classcode, totals.classname, '', '', '', 'TOTAL' || ' ' || totals.classname as accountname,
          sum(totals.amount) as amount,
          (case when totals.month in (1,2,3) then sum(totals.amount) else 0 end) as q1,
          (case when totals.month in (4,5,6) then sum(totals.amount) else 0 end) as q2,
          (case when totals.month in (7,8,9) then sum(totals.amount) else 0 end) as q3,
          (case when totals.month in (10,11,12) then sum(totals.amount) else 0 end) as q4,
          2 as key
          from
          (
          select bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname,bs.month, bs.year,
          sum((case when bs."DRCRCode"='DR' then (bs.debit-bs.credit) else bs.credit-bs.debit end)) AS amount, 0 as key
          from
          (
          select
          ty."sortOrder",ty.code as typecode,ty.name as typename,cl.code as classcode,cl.name as classname,gp.code as groupcode,gp.name as groupname,
          ac.code as accountcode,ac.name as accountname,ac."DRCRCode",
          extract(month from t."transactionDate") as month,
          extract(year from t."transactionDate") as year,
          (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
          (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
          from types ty
          inner join classes cl on cl."typeId"=ty.id
          inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
          inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
          inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
          inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
          where t."companyId"=${params.companyId} and ty."finDocName"='INCOME STATEMENT'and t."transactionDate" between '${params.startDate}' and '${params.endDate}'
          group by ty."sortOrder",ty.code,ty.name,cl.code,cl.name,gp.code,gp.name,ac.code,ac.name,ac."DRCRCode",te."DRCRCode",t."transactionDate") as bs
          group by bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname, bs.month, bs.year) as totals
          group by totals."sortOrder", totals.typecode, totals.typename, totals.classcode, totals.classname, totals.month, totals.year
          --get totals by class--

          UNION ALL

          --get gross earnings with quarters--
          select
          5,'','','','GROSS EARNINGS','', '','','GROSS EARNINGS',
          sum(ce.Amount*ce.DRCRCode) as amount,
          sum((case when ce.month in (1,2,3) then ce.Amount*ce.DRCRCode else 0 end)) as q1,
          sum((case when ce.month in (4,5,6) then ce.Amount*ce.DRCRCode else 0 end)) as q2,
          sum((case when ce.month in (7,8,9) then ce.Amount*ce.DRCRCode else 0 end)) as q3,
          sum((case when ce.month in (10,11,12) then ce.Amount*ce.DRCRCode else 0 end)) as q4,
          3 as key
          from (
          select
            (case when bs."DRCRCode"='DR' then -1 else 1 end) as DRCRCode,bs.month,
            sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else bs.credit-bs.debit end)) as Amount
            from
            (
            select
            ty."sortOrder",ty.name as type,cl.name as class,gp.name as group,ac.name as account,ac."DRCRCode",
            extract(month from t."transactionDate") as month,
            extract(year from t."transactionDate") as year,
            (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
            (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
            from types ty
            inner join classes cl on cl."typeId"=ty.id
            inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
            inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
            inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
            inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
            where t."companyId"=${params.companyId} and ty."finDocName"='INCOME STATEMENT'and t."transactionDate" between '${params.startDate}' and '${params.endDate}' 
            AND cl.name in ('SALES','SERVICE INCOME','SALES ADJUSTMENT','COST OF SALES','PURCHASE ADJUSTMENT')
            group by ty."sortOrder",ty.name,cl.name,gp.name,ac.name,ac."DRCRCode",te."DRCRCode",t."transactionDate") as bs
            group by bs."sortOrder", bs.type, bs.class, bs.group, bs.account,bs."DRCRCode", bs.month, bs.year) ce
          --get gross earnings with quarters--

          UNION ALL

          --get net operating earnings with quarters--
          select 5,'','','','NET OPERATING EARNINGS','','','','NET OPERATING EARNINGS',
          sum(ce.Amount*ce.DRCRCode) as amount,
          sum((case when ce.month in (1,2,3) then ce.Amount*ce.DRCRCode else 0 end)) as q1,
          sum((case when ce.month in (4,5,6) then ce.Amount*ce.DRCRCode else 0 end)) as q2,
          sum((case when ce.month in (7,8,9) then ce.Amount*ce.DRCRCode else 0 end)) as q3,
          sum((case when ce.month in (10,11,12) then ce.Amount*ce.DRCRCode else 0 end)) as q4,
          3 as key
          from (
          select
            (case when bs."DRCRCode"='DR' then -1 else 1 end) as DRCRCode,bs.month,
            sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else bs.credit-bs.debit end)) as Amount
            from
            (
            select
            ty."sortOrder",ty.name as type,cl.name as class,gp.name as group,ac.name as account,ac."DRCRCode",
            extract(month from t."transactionDate") as month,
            extract(year from t."transactionDate") as year,
            (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
            (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
            from types ty
            inner join classes cl on cl."typeId"=ty.id
            inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
            inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
            inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
            inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
            where t."companyId"=${params.companyId} and ty."finDocName"='INCOME STATEMENT'and t."transactionDate" between '${params.startDate}' and '${params.endDate}'
            AND cl.name in ('SALES','SERVICE INCOME','SALES ADJUSTMENT','COST OF SALES','OPERATING EXPENSES','PURCHASE ADJUSTMENT')
            group by ty."sortOrder",ty.name,cl.name,gp.name,ac.name,ac."DRCRCode",te."DRCRCode",t."transactionDate") as bs
            group by bs."sortOrder", bs.type, bs.class, bs.group, bs.account,bs."DRCRCode", bs.month, bs.year) ce
            
          --get net operating earnings with quarters--

          UNION ALL

          --get net current earnings with quarters--
          select 6,'','','','NET CURRENT EARNINGS','','','','NET CURRENT EARNINGS',
          sum(ce.Amount*ce.DRCRCode) as amount,
          sum((case when ce.month in (1,2,3) then ce.Amount*ce.DRCRCode else 0 end)) as q1,
          sum((case when ce.month in (4,5,6) then ce.Amount*ce.DRCRCode else 0 end)) as q2,
          sum((case when ce.month in (7,8,9) then ce.Amount*ce.DRCRCode else 0 end)) as q3,
          sum((case when ce.month in (10,11,12) then ce.Amount*ce.DRCRCode else 0 end)) as q4,
          3 as key
          from (
          select
            (case when bs."DRCRCode"='DR' then -1 else 1 end) as DRCRCode,bs.month,
            sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else bs.credit-bs.debit end)) as Amount
            from
            (
            select
            ty."sortOrder",ty.name as type,cl.name as class,gp.name as group,ac.name as account,ac."DRCRCode",
            extract(month from t."transactionDate") as month,
            extract(year from t."transactionDate") as year,
            (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
            (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
            from types ty
            inner join classes cl on cl."typeId"=ty.id
            inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
            inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
            inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
            inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
            where t."companyId"=${params.companyId} and ty."finDocName"='INCOME STATEMENT'and t."transactionDate" between '${params.startDate}' and '${params.endDate}'
            group by ty."sortOrder",ty.name,cl.name,gp.name,ac.name,ac."DRCRCode",te."DRCRCode",t."transactionDate") as bs
            group by bs."sortOrder", bs.type, bs.class, bs.group, bs.account,bs."DRCRCode", bs.month, bs.year) ce
            
          --get net current earnings with quarters--
          ) as is1
          ) AS is2
          group by
          is2.type,is2.class,is2.group,is2.account,is2.key
          order by
          (case when is2.class='SALES' then 1 else
          (case when is2.class='SERVICE INCOME' then 2 else
          (case when is2.class='SALES ADJUSTMENT' then 3 else 
          (case when is2.class='COST OF SALES' then 4 else
          (case when is2.class='PURCHASE ADJUSTMENT' then 5 else
          (case when is2.class='GROSS EARNINGS' then 6 else
          (case when is2.class='OPERATING EXPENSES' then 7 else 
          (CASE WHEN is2.class='NET OPERATING EARNINGS' THEN 8 else
          (case when is2.class='OTHER REVENUES' then 9 else 
          (case when is2.class='OTHER EXPENDITURES' then 10 else
          (case when is2.class='NET CURRENT EARNINGS' then 11 else
          12 end) end) end) end) end) end) end) end) end) end) end),
          is2.key,is2.type,is2.class,is2.group, is2.account

          
          `);
      } else {
        result = await this.accountRepository.sequelize.query(`
          
            SELECT
            is2.type,is2.class,is2.group,is2.account, sum(is2.totalytd) as amount
            --, sum(is2.q1) as q1, sum(is2.q2) as q2, sum(is2.q3) as q3, sum(is2.q4) as q4
            FROM
            (
            SELECT 
            is1.typename as type,is1.classname as class,is1.groupname as group,is1.accountname as account, is1.key, is1.amount as totalytd
            ,coalesce(is1.q1,0) as q1,coalesce(is1.q2,0) as q2,coalesce(is1.q3,0) as q3,coalesce(is1.q4,0) as q4

            FROM
            (
            --get income statement details--
            select
            bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname,
            sum((case when bs."DRCRCode"='DR' then (bs.debit-bs.credit) else bs.credit-bs.debit end)) AS Amount,
            sum((case when bs.month in (1,2,3) then (case when bs."DRCRCode"='DR' then (bs.debit-bs.credit) else bs.credit-bs.debit end) end)) as q1,
            sum((case when bs.month in (4,5,6) then (case when bs."DRCRCode"='DR' then (bs.debit-bs.credit) else bs.credit-bs.debit end) end)) as q2,
            sum((case when bs.month in (7,8,9) then (case when bs."DRCRCode"='DR' then (bs.debit-bs.credit) else bs.credit-bs.debit end) end)) as q3,
            sum((case when bs.month in (10,11,12) then (case when bs."DRCRCode"='DR' then (bs.debit-bs.credit) else bs.credit-bs.debit end) end)) as q4,
            1 as key
            from
            (
            select
            ty."sortOrder",ty.code as typecode,ty.name as typename,cl.code as classcode,cl.name as classname,gp.code as groupcode,gp.name as groupname,
            ac.code as accountcode,ac.name as accountname,ac."DRCRCode",
            extract(month from t."transactionDate") as month,
            extract(year from t."transactionDate") as year,
            (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
            (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
            from types ty
            inner join classes cl on cl."typeId"=ty.id
            inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
            inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
            inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
            inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
            where t."companyId"=${params.companyId} and ty."finDocName"='INCOME STATEMENT'and t."transactionDate" between '${params.startDate}' and '${params.endDate}'
            group by ty."sortOrder",ty.code,ty.name,cl.code,cl.name,gp.code,gp.name,ac.code,ac.name,ac."DRCRCode",te."DRCRCode",t."transactionDate") as bs
            group by bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname, bs.month,bs.year
            --get income statement details--

            UNION ALL

            --get totals by class--
            select
            totals."sortOrder", totals.typecode, totals.typename, totals.classcode, totals.classname, '', '', '', 'TOTAL' || ' ' || totals.classname as accountname,
            sum(totals.amount) as amount,
            (case when totals.month in (1,2,3) then sum(totals.amount) else 0 end) as q1,
            (case when totals.month in (4,5,6) then sum(totals.amount) else 0 end) as q2,
            (case when totals.month in (7,8,9) then sum(totals.amount) else 0 end) as q3,
            (case when totals.month in (10,11,12) then sum(totals.amount) else 0 end) as q4,
            2 as key
            from
            (
            select bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname,bs.month, bs.year,
            sum((case when bs."DRCRCode"='DR' then (bs.debit-bs.credit) else bs.credit-bs.debit end)) AS amount, 0 as key
            from
            (
            select
            ty."sortOrder",ty.code as typecode,ty.name as typename,cl.code as classcode,cl.name as classname,gp.code as groupcode,gp.name as groupname,
            ac.code as accountcode,ac.name as accountname,ac."DRCRCode",
            extract(month from t."transactionDate") as month,
            extract(year from t."transactionDate") as year,
            (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
            (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
            from types ty
            inner join classes cl on cl."typeId"=ty.id
            inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
            inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
            inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
            inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
            where t."companyId"=${params.companyId} and ty."finDocName"='INCOME STATEMENT'and t."transactionDate" between '${params.startDate}' and '${params.endDate}'
            group by ty."sortOrder",ty.code,ty.name,cl.code,cl.name,gp.code,gp.name,ac.code,ac.name,ac."DRCRCode",te."DRCRCode",t."transactionDate") as bs
            group by bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname, bs.month, bs.year) as totals
            group by totals."sortOrder", totals.typecode, totals.typename, totals.classcode, totals.classname, totals.month, totals.year
            --get totals by class--

            UNION ALL

            --get gross earnings with quarters--
            select
            5,'','','','GROSS EARNINGS','', '','','GROSS EARNINGS',
            sum(ce.Amount*ce.DRCRCode) as amount,
            sum((case when ce.month in (1,2,3) then ce.Amount*ce.DRCRCode else 0 end)) as q1,
            sum((case when ce.month in (4,5,6) then ce.Amount*ce.DRCRCode else 0 end)) as q2,
            sum((case when ce.month in (7,8,9) then ce.Amount*ce.DRCRCode else 0 end)) as q3,
            sum((case when ce.month in (10,11,12) then ce.Amount*ce.DRCRCode else 0 end)) as q4,
            3 as key
            from (
            select
              (case when bs."DRCRCode"='DR' then -1 else 1 end) as DRCRCode,bs.month,
              sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else bs.credit-bs.debit end)) as Amount
              from
              (
              select
              ty."sortOrder",ty.name as type,cl.name as class,gp.name as group,ac.name as account,ac."DRCRCode",
              extract(month from t."transactionDate") as month,
              extract(year from t."transactionDate") as year,
              (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
              (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
              from types ty
              inner join classes cl on cl."typeId"=ty.id
              inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
              inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
              inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
              inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
              where t."companyId"=${params.companyId} and ty."finDocName"='INCOME STATEMENT'and t."transactionDate" between '${params.startDate}' and '${params.endDate}' 
              AND cl.name in ('SALES','SERVICE INCOME','SALES ADJUSTMENT','COST OF SALES','PURCHASE ADJUSTMENT')
              group by ty."sortOrder",ty.name,cl.name,gp.name,ac.name,ac."DRCRCode",te."DRCRCode",t."transactionDate") as bs
              group by bs."sortOrder", bs.type, bs.class, bs.group, bs.account,bs."DRCRCode", bs.month, bs.year) ce
            --get gross earnings with quarters--

            UNION ALL

            --get net operating earnings with quarters--
            select 5,'','','','NET OPERATING EARNINGS','','','','NET OPERATING EARNINGS',
            sum(ce.Amount*ce.DRCRCode) as amount,
            sum((case when ce.month in (1,2,3) then ce.Amount*ce.DRCRCode else 0 end)) as q1,
            sum((case when ce.month in (4,5,6) then ce.Amount*ce.DRCRCode else 0 end)) as q2,
            sum((case when ce.month in (7,8,9) then ce.Amount*ce.DRCRCode else 0 end)) as q3,
            sum((case when ce.month in (10,11,12) then ce.Amount*ce.DRCRCode else 0 end)) as q4,
            3 as key
            from (
            select
              (case when bs."DRCRCode"='DR' then -1 else 1 end) as DRCRCode,bs.month,
              sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else bs.credit-bs.debit end)) as Amount
              from
              (
              select
              ty."sortOrder",ty.name as type,cl.name as class,gp.name as group,ac.name as account,ac."DRCRCode",
              extract(month from t."transactionDate") as month,
              extract(year from t."transactionDate") as year,
              (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
              (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
              from types ty
              inner join classes cl on cl."typeId"=ty.id
              inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
              inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
              inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
              inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
              where t."companyId"=${params.companyId} and ty."finDocName"='INCOME STATEMENT'and t."transactionDate" between '${params.startDate}' and '${params.endDate}'
              AND cl.name in ('SALES','SERVICE INCOME','SALES ADJUSTMENT','COST OF SALES','OPERATING EXPENSES','PURCHASE ADJUSTMENT')
              group by ty."sortOrder",ty.name,cl.name,gp.name,ac.name,ac."DRCRCode",te."DRCRCode",t."transactionDate") as bs
              group by bs."sortOrder", bs.type, bs.class, bs.group, bs.account,bs."DRCRCode", bs.month, bs.year) ce
              
            --get net operating earnings with quarters--

            UNION ALL

            --get net current earnings with quarters--
            select 6,'','','','NET CURRENT EARNINGS','','','','NET CURRENT EARNINGS',
            sum(ce.Amount*ce.DRCRCode) as amount,
            sum((case when ce.month in (1,2,3) then ce.Amount*ce.DRCRCode else 0 end)) as q1,
            sum((case when ce.month in (4,5,6) then ce.Amount*ce.DRCRCode else 0 end)) as q2,
            sum((case when ce.month in (7,8,9) then ce.Amount*ce.DRCRCode else 0 end)) as q3,
            sum((case when ce.month in (10,11,12) then ce.Amount*ce.DRCRCode else 0 end)) as q4,
            3 as key
            from (
            select
              (case when bs."DRCRCode"='DR' then -1 else 1 end) as DRCRCode,bs.month,
              sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else bs.credit-bs.debit end)) as Amount
              from
              (
              select
              ty."sortOrder",ty.name as type,cl.name as class,gp.name as group,ac.name as account,ac."DRCRCode",
              extract(month from t."transactionDate") as month,
              extract(year from t."transactionDate") as year,
              (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
              (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
              from types ty
              inner join classes cl on cl."typeId"=ty.id
              inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
              inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
              inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
              inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
              where t."companyId"=${params.companyId} and ty."finDocName"='INCOME STATEMENT'and t."transactionDate" between '${params.startDate}' and '${params.endDate}'
              group by ty."sortOrder",ty.name,cl.name,gp.name,ac.name,ac."DRCRCode",te."DRCRCode",t."transactionDate") as bs
              group by bs."sortOrder", bs.type, bs.class, bs.group, bs.account,bs."DRCRCode", bs.month, bs.year) ce
              
            --get net current earnings with quarters--
            ) as is1
            ) AS is2
            group by
            is2.type,is2.class,is2.group,is2.account,is2.key
            order by
            (case when is2.class='SALES' then 1 else
            (case when is2.class='SERVICE INCOME' then 2 else
            (case when is2.class='SALES ADJUSTMENT' then 3 else 
            (case when is2.class='COST OF SALES' then 4 else
            (case when is2.class='PURCHASE ADJUSTMENT' then 5 else
            (case when is2.class='GROSS EARNINGS' then 6 else
            (case when is2.class='OPERATING EXPENSES' then 7 else 
            (CASE WHEN is2.class='NET OPERATING EARNINGS' THEN 8 else
            (case when is2.class='OTHER REVENUES' then 9 else 
            (case when is2.class='OTHER EXPENDITURES' then 10 else
            (case when is2.class='NET CURRENT EARNINGS' then 11 else
            12 end) end) end) end) end) end) end) end) end) end) end),
            is2.key,is2.type,is2.class,is2.group, is2.account

            
            `);
      }
      return result[0];
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  // async getCompanyBalanceSheet(params) {
  //   try {
  //     let result: any = await this.accountRepository.sequelize.query(`select
  //       bs."sortOrder", bs.type, bs.class, bs.group, bs.account,
  //       sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end)) AS debit,
  //       sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end)) AS credit
  //       from
  //       (
  //       select
  //       ty."sortOrder",ty.name as type,cl.name as class,gp.name as group,ac.name as account,ac."DRCRCode",
  //       (case when te."DRCRCode" = 'DR' then sum(te.amount/100) else 0 end) as debit,
  //       (case when te."DRCRCode" = 'CR' then sum(te.amount/100) else 0 end) as credit
  //       from types ty
  //       inner join classes cl on cl."typeId"=ty.id
  //       inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
  //       inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
  //       inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
  //       inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
  //       where t."companyId"=${params.companyId} and ty."finDocName"='BALANCE SHEET'and t."transactionDate" <= '${params.endDate}'
  //       group by ty."sortOrder",ty.name,cl.name,gp.name,ac.name,ac."DRCRCode",te."DRCRCode") as bs
  //       group by bs."sortOrder", bs.type, bs.class, bs.group, bs.account
  //       UNION ALL
  //       select 3,'EQUITY','RETAINED EARNINGS','RETAINED EARNINGS','Retained Earnings',
  //       (case when public.get_retainedearnings('${params.startDate}')<0 then public.get_retainedearnings('${params.startDate}')*-1 else 0 end),
  //       (case when public.get_retainedearnings('${params.startDate}')>0 then public.get_retainedearnings('${params.startDate}') else 0 end)
  //       UNION ALL
  //       select 3,'EQUITY','RETAINED EARNINGS','RETAINED EARNINGS','Net Current Earnings',
  //       (case when public.get_currentearnings('${params.startDate}','${params.endDate}')<0 then public.get_currentearnings('${params.startDate}','${params.endDate}')*-1 else 0 end),
  //       (case when public.get_currentearnings('${params.startDate}','${params.endDate}')>0 then public.get_currentearnings('${params.startDate}','${params.endDate}') else 0 end)`);
  //     return result[0]
  //   } catch (e) {
  //     console.log(e);
  //     return e
  //   }
  // }

  async getCompanyBalanceSheet(params) {
    try {
      let result: any = await this.accountRepository.sequelize.query(`select
        bs2.typename as type, bs2.classname as class, bs2.groupname as group, bs2.accountname as account, bs2.amount as amount
        from
        (
        select
        bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname,
        sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else bs.credit-bs.debit end)) *
        (
        case when
        (case when bs."GDRCRCode"='DR' then -1 else 1 end) !=
        (case when bs."DRCRCode"='DR' then -1 else 1 end) then -1 else 1 end
        ) as amount, 0 as key
        from
        (
        select
        ty."sortOrder",ty.code as typecode,ty.name as typename,cl.code as classcode,cl.name as classname,gp.code as groupcode,gp.name as groupname,
        ac.code as accountcode,ac.name as accountname,ac."DRCRCode", gp."DRCRCode" as "GDRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        from types ty
        inner join classes cl on cl."typeId"=ty.id
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
        inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
        inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
        where t."companyId"=${params.companyId} and ty."finDocName"='BALANCE SHEET'and t."transactionDate" <= '${params.endDate}'
        group by ty."sortOrder",ty.code,ty.name,cl.code,cl.name,gp.code,gp.name,ac.code,ac.name,ac."DRCRCode",te."DRCRCode",gp."DRCRCode") as bs
        group by bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname,bs."DRCRCode",bs."GDRCRCode"
        UNION ALL
        select 3,'3','EQUITY','3.5','RETAINED EARNINGS','3.5.1','RETAINED EARNINGS','','Retained Earnings', public.get_retainedearnings(${params.companyId},'${params.startDate}'), 0 as key
        UNION ALL
        select 3,'3','EQUITY','3.5','RETAINED EARNINGS','3.5.1','RETAINED EARNINGS','','Net Current Earnings',public.get_currentearnings(${params.companyId},'${params.startDate}','${params.endDate}') ,0 as key
        --get balance sheet account details--
        UNION ALL
        --get total by group--
        select
        bs1."sortOrder", bs1.typecode, bs1.typename, bs1.classcode, bs1.classname, bs1.groupcode, 'TOTAL' || ' ' || bs1.groupname,'' as accountcode,
        '' as accountname,
        sum(bs1.amount) as amount, 1 as key
        from
        (
        select
        bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname,
        sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else bs.credit-bs.debit end)) *
        (
        case when
        (case when bs."GDRCRCode"='DR' then -1 else 1 end) !=
        (case when bs."DRCRCode"='DR' then -1 else 1 end) then -1 else 1 end
        ) as amount
        from
        (
        select
        ty."sortOrder",ty.code as typecode,ty.name as typename,cl.code as classcode,cl.name as classname,gp.code as groupcode,gp.name as groupname,
        ac.code as accountcode,ac.name as accountname,ac."DRCRCode", gp."DRCRCode" as "GDRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        from types ty
        inner join classes cl on cl."typeId"=ty.id
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
        inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
        inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
        where t."companyId"=${params.companyId} and ty."finDocName"='BALANCE SHEET'and t."transactionDate" <= '${params.endDate}'
        group by ty."sortOrder",ty.code,ty.name,cl.code,cl.name,gp.code,gp.name,ac.code,ac.name,ac."DRCRCode",te."DRCRCode",gp."DRCRCode") as bs
        group by bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname,bs."DRCRCode",bs."GDRCRCode"
        UNION ALL
        select 3,'3','EQUITY','3.5','RETAINED EARNINGS','3.5.1','RETAINED EARNINGS','','Retained Earnings', public.get_retainedearnings(${params.companyId},'${params.startDate}')
        UNION ALL
        select 3,'3','EQUITY','3.5','RETAINED EARNINGS','3.5.1','RETAINED EARNINGS','','Net Current Earnings',public.get_currentearnings(${params.companyId},'${params.startDate}','${params.endDate}')
        ) as bs1
        group by bs1."sortOrder", bs1.typecode, bs1.typename, bs1.classcode, bs1.classname, bs1.groupcode, bs1.groupname
        --get total by group--
        UNION ALL
        --get total by class--
        select
        bs1."sortOrder", bs1.typecode, bs1.typename, bs1.classcode,
        'TOTAL' || ' ' || bs1.classname as classname,'' as groupcode, '' as groupname, '' as accountcode, '' as accountname,
        sum(bs1.amount) as amount, 2 as key
        from
        (
        select
        bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname,
        sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else bs.credit-bs.debit end)) *
        (
        case when
        (case when bs."GDRCRCode"='DR' then -1 else 1 end) !=
        (case when bs."DRCRCode"='DR' then -1 else 1 end) then -1 else 1 end
        ) as amount
        from
        (
        select
        ty."sortOrder",ty.code as typecode,ty.name as typename,cl.code as classcode,cl.name as classname,gp.code as groupcode,gp.name as groupname,
        ac.code as accountcode,ac.name as accountname,ac."DRCRCode", gp."DRCRCode" as "GDRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        from types ty
        inner join classes cl on cl."typeId"=ty.id
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
        inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
        inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
        where t."companyId"=${params.companyId} and ty."finDocName"='BALANCE SHEET'and t."transactionDate" <= '${params.endDate}'
        group by ty."sortOrder",ty.code,ty.name,cl.code,cl.name,gp.code,gp.name,ac.code,ac.name,ac."DRCRCode",te."DRCRCode",gp."DRCRCode") as bs
        group by bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname,bs."DRCRCode",bs."GDRCRCode"
        UNION ALL
        select 3,'3','EQUITY','3.5','RETAINED EARNINGS','3.5.1','RETAINED EARNINGS','','Retained Earnings', public.get_retainedearnings(${params.companyId},'${params.startDate}')
        UNION ALL
        select 3,'3','EQUITY','3.5','RETAINED EARNINGS','3.5.1','RETAINED EARNINGS','','Net Current Earnings',public.get_currentearnings(${params.companyId},'${params.startDate}','${params.endDate}')
        ) as bs1
        group by bs1."sortOrder", bs1.typecode, bs1.typename, bs1.classcode, bs1.classname
        --get total by class--
        UNION ALL
        --get total by type--
        select
        bs1."sortOrder", bs1.typecode, 'TOTAL' || ' ' || bs1.typename as typename, '' as classcode, '' as classname, '' as groupcode, '' as groupname,'' as accountcode, '' as accountname,
        sum(bs1.amount) as amount, 3 as key
        from
        (
        select
        bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname,
        sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else bs.credit-bs.debit end)) *
        (
        case when
        (case when bs."GDRCRCode"='DR' then -1 else 1 end) !=
        (case when bs."DRCRCode"='DR' then -1 else 1 end) then -1 else 1 end
        ) as amount
        from
        (
        select
        ty."sortOrder",ty.code as typecode,ty.name as typename,cl.code as classcode,cl.name as classname,gp.code as groupcode,gp.name as groupname,
        ac.code as accountcode,ac.name as accountname,ac."DRCRCode", gp."DRCRCode" as "GDRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        from types ty
        inner join classes cl on cl."typeId"=ty.id
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
        inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
        inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
        where t."companyId"=${params.companyId} and ty."finDocName"='BALANCE SHEET'and t."transactionDate" <= '${params.endDate}'
        group by ty."sortOrder",ty.code,ty.name,cl.code,cl.name,gp.code,gp.name,ac.code,ac.name,ac."DRCRCode",te."DRCRCode",gp."DRCRCode") as bs
        group by bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname,bs."DRCRCode",bs."GDRCRCode"
        UNION ALL
        select 3,'3','EQUITY','3.5','RETAINED EARNINGS','3.5.1','RETAINED EARNINGS','','Retained Earnings', public.get_retainedearnings(${params.companyId},'${params.startDate}')
        UNION ALL
        select 3,'3','EQUITY','3.5','RETAINED EARNINGS','3.5.1','RETAINED EARNINGS','','Net Current Earnings',public.get_currentearnings(${params.companyId},'${params.startDate}','${params.endDate}')
        ) as bs1
        group by bs1."sortOrder", bs1.typecode, bs1.typename
        --get total by type--
        UNION ALL
        --get total of liabilities and equity--
        select
        3, '3', 'TOTAL LIABILITIES AND EQUITY', '' as classcode, '' as classname, '' as groupcode, '' as groupname,'' as accountcode, '' as accountname,
        sum(bs1.amount) as amount, 4
        from
        (
        select
        bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname,
        sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else bs.credit-bs.debit end)) *
        (
        case when
        (case when bs."GDRCRCode"='DR' then -1 else 1 end) !=
        (case when bs."DRCRCode"='DR' then -1 else 1 end) then -1 else 1 end
        ) as amount
        from
        (
        select
        ty."sortOrder",ty.code as typecode,ty.name as typename,cl.code as classcode,cl.name as classname,gp.code as groupcode,gp.name as groupname,
        ac.code as accountcode,ac.name as accountname,ac."DRCRCode", gp."DRCRCode" as "GDRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        from types ty
        inner join classes cl on cl."typeId"=ty.id
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
        inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
        inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
        where t."companyId"=${params.companyId} and ty."finDocName"='BALANCE SHEET'and t."transactionDate" <= '${params.endDate}' and ty.name in ('LIABILITIES','EQUITY')
        group by ty."sortOrder",ty.code,ty.name,cl.code,cl.name,gp.code,gp.name,ac.code,ac.name,ac."DRCRCode",te."DRCRCode",gp."DRCRCode") as bs
        group by bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname,bs."DRCRCode",bs."GDRCRCode"
        UNION ALL
        select 3,'3','EQUITY','3.5','RETAINED EARNINGS','3.5.1','RETAINED EARNINGS','','Retained Earnings', public.get_retainedearnings(${params.companyId},'${params.startDate}')
        UNION ALL
        select 3,'3','EQUITY','3.5','RETAINED EARNINGS','3.5.1','RETAINED EARNINGS','','Net Current Earnings',public.get_currentearnings(${params.companyId},'${params.startDate}','${params.endDate}')
        ) as bs1
        --get total of liabilities and equity--
        ) as bs2
        order by bs2."sortOrder", bs2.typecode, bs2.typename, bs2.classcode, bs2.classname, bs2.groupcode, bs2.groupname, bs2.key, bs2.accountname`);
      return result[0];
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async getCompanyStatementOfCashflows(params) {
    try {
      let result: any = await this.accountRepository.sequelize.query(``);
      return result[0];
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  // async getCompanyTrialBalance(params) {
  //   try {
  //     let result: any = await this.accountRepository.sequelize.query(`select
  //       bs."sortOrder", bs.type, bs.class, bs.group, bs.account,
  //       sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end)) AS debit,
  //       sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end)) AS credit
  //       from
  //       (
  //       select
  //       ty."sortOrder",ty.name as type,cl.name as class,gp.name as group,ac.name as account,ac."DRCRCode",
  //       (case when te."DRCRCode" = 'DR' then sum(te.amount/100) else 0 end) as debit,
  //       (case when te."DRCRCode" = 'CR' then sum(te.amount/100) else 0 end) as credit
  //       from types ty
  //       inner join classes cl on cl."typeId"=ty.id
  //       inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
  //       inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
  //       inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
  //       inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
  //       where t."companyId"=${params.companyId} and ty."finDocName"='BALANCE SHEET'and t."transactionDate" <= '${params.endDate}'
  //       group by ty."sortOrder",ty.name,cl.name,gp.name,ac.name,ac."DRCRCode",te."DRCRCode") as bs
  //       group by bs."sortOrder", bs.type, bs.class, bs.group, bs.account
  //       UNION ALL
  //       select 3,'EQUITY','RETAINED EARNINGS','RETAINED EARNINGS','Retained Earnings',
  //       (case when public.get_retainedearnings('${params.startDate}')<0 then public.get_retainedearnings('${params.startDate}')*-1 else 0 end),
  //       (case when public.get_retainedearnings('${params.startDate}')>0 then public.get_retainedearnings('${params.startDate}') else 0 end)
  //       UNION ALL
  //       select
  //       bs."sortOrder", bs.type, bs.class, bs.group, bs.account,
  //       sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end)) AS debit,
  //       sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end)) AS credit
  //       from
  //       (
  //       select
  //       ty."sortOrder",ty.name as type,cl.name as class,gp.name as group,ac.name as account,ac."DRCRCode",
  //       (case when te."DRCRCode" = 'DR' then sum(te.amount/100) else 0 end) as debit,
  //       (case when te."DRCRCode" = 'CR' then sum(te.amount/100) else 0 end) as credit
  //       from types ty
  //       inner join classes cl on cl."typeId"=ty.id
  //       inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
  //       inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
  //       inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
  //       inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
  //       where t."companyId"=${params.companyId} and ty."finDocName"='INCOME STATEMENT' and t."transactionDate" between '${params.startDate}' and '${params.endDate}'
  //       group by ty."sortOrder",ty.name,cl.name,gp.name,ac.name,ac."DRCRCode",te."DRCRCode") as bs
  //       group by bs."sortOrder", bs.type, bs.class, bs.group, bs.account`);
  //     return result[0]
  //   } catch (e) {
  //     console.log(e);
  //     return e
  //   }
  // }

  async getCompanyTrialBalance(params) {
    try {
      let result: any = await this.accountRepository.sequelize.query(`
      --get balance sheet and income statement details--
      select
      bs1.typename as type, bs1.classname as class, bs1.groupname as group, bs1.accountname as account, bs1.debit as debit, bs1.credit as credit
      from
      (
      select
      bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname,
      --sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end)) AS debit,
      --sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end)) AS credit
        
      (case when
      sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end))<0
      then abs(sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end)))
      else
      (
      case when sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end))<0
      then 0 else sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end)) end
      )
      end) as debit,
      (case when
      sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end))<0
      then abs(sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end)))
      else
      (
      case when sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end))<0
      then 0 else sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end)) end
      )
      end) as credit
        
      from
      (
      select
      ty."sortOrder",ty.code as typecode,ty.name as typename,cl.code as classcode,cl.name as classname,gp.code as groupcode,gp.name as groupname,
      ac.code as accountcode,ac.name as accountname,ac."DRCRCode",
      (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
      (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
      from types ty
      inner join classes cl on cl."typeId"=ty.id
      inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
      inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
      inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
      inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
      where t."companyId"=${params.companyId} and ty."finDocName"='BALANCE SHEET'and t."transactionDate" <= '${params.endDate}'
      group by ty."sortOrder",ty.code,ty.name,cl.code,cl.name,gp.code,gp.name,ac.code,ac.name,ac."DRCRCode",te."DRCRCode") as bs
      group by bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname
      UNION ALL
      select 3,'3','EQUITY','3.5','RETAINED EARNINGS','','RETAINED EARNINGS','','Retained Earnings',
      (case when public.get_retainedearnings(${params.companyId},'${params.startDate}')<0 then public.get_retainedearnings(${params.companyId},'${params.startDate}')*-1 else 0 end),
      (case when public.get_retainedearnings(${params.companyId},'${params.startDate}')>0 then public.get_retainedearnings(${params.companyId},'${params.startDate}') else 0 end)

      UNION ALL

      select
      bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname,
      --sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end)) AS debit,
      --sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end)) AS credit
        
      (case when
      sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end))<0
      then abs(sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end)))
      else
      (
      case when sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end))<0
      then 0 else sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end)) end
      )
      end) as debit,
      (case when
      sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end))<0
      then abs(sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end)))
      else
      (
      case when sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end))<0
      then 0 else sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end)) end
      )
      end) as credit
        
      from
      (
      select
      ty."sortOrder",ty.code as typecode,ty.name as typename,cl.code as classcode,cl.name as classname,gp.code as groupcode,gp.name as groupname,
      ac.code as accountcode,ac.name as accountname,ac."DRCRCode",
      (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
      (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
      from types ty
      inner join classes cl on cl."typeId"=ty.id
      inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
      inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
      inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
      inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
      where t."companyId"=${params.companyId} and ty."finDocName"='INCOME STATEMENT'and t."transactionDate" BETWEEN '${params.startDate}' AND '${params.endDate}'
      group by ty."sortOrder",ty.code,ty.name,cl.code,cl.name,gp.code,gp.name,ac.code,ac.name,ac."DRCRCode",te."DRCRCode") as bs
      group by bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname
      order by "sortOrder", typecode, typename, classcode, classname, groupcode, groupname, accountname
      ) as bs1
      --get balance sheet and income statement details--

      UNION ALL
      --get total debit and credits--
      select
      '','','','TOTAL',sum(bs1.debit) as debit, sum(bs1.credit) as credit
      from
      (
      select
      bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname,
      --sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end)) AS debit,
      --sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end)) AS credit
        
      (case when
      sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end))<0
      then abs(sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end)))
      else
      (
      case when sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end))<0
      then 0 else sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end)) end
      )
      end) as debit,
      (case when
      sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end))<0
      then abs(sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end)))
      else
      (
      case when sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end))<0
      then 0 else sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end)) end
      )
      end) as credit
        
      from
      (
      select
      ty."sortOrder",ty.code as typecode,ty.name as typename,cl.code as classcode,cl.name as classname,gp.code as groupcode,gp.name as groupname,
      ac.code as accountcode,ac.name as accountname,ac."DRCRCode",
      (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
      (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
      from types ty
      inner join classes cl on cl."typeId"=ty.id
      inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
      inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
      inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
      inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
      where t."companyId"=${params.companyId} and ty."finDocName"='BALANCE SHEET'and t."transactionDate" <= '${params.endDate}'
      group by ty."sortOrder",ty.code,ty.name,cl.code,cl.name,gp.code,gp.name,ac.code,ac.name,ac."DRCRCode",te."DRCRCode") as bs
      group by bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname
      UNION ALL
      select 3,'3','EQUITY','3.5','RETAINED EARNINGS','','RETAINED EARNINGS','','Retained Earnings',
      (case when public.get_retainedearnings(${params.companyId},'${params.startDate}')<0 then public.get_retainedearnings(${params.companyId},'${params.startDate}')*-1 else 0 end),
      (case when public.get_retainedearnings(${params.companyId},'${params.startDate}')>0 then public.get_retainedearnings(${params.companyId},'${params.startDate}') else 0 end)

      UNION ALL

      select
      bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname,
      --sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end)) AS debit,
      --sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end)) AS credit
        
      (case when
      sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end))<0
      then abs(sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end)))
      else
      (
      case when sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end))<0
      then 0 else sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end)) end
      )
      end) as debit,
      (case when
      sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end))<0
      then abs(sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else 0 end)))
      else
      (
      case when sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end))<0
      then 0 else sum((case when bs."DRCRCode"='CR' then bs.credit-bs.debit else 0 end)) end
      )
      end) as credit
        
      from
      (
      select
      ty."sortOrder",ty.code as typecode,ty.name as typename,cl.code as classcode,cl.name as classname,gp.code as groupcode,gp.name as groupname,
      ac.code as accountcode,ac.name as accountname,ac."DRCRCode",
      (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
      (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
      from types ty
      inner join classes cl on cl."typeId"=ty.id
      inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
      inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
      inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
      inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
      where t."companyId"=${params.companyId} and ty."finDocName"='INCOME STATEMENT'and t."transactionDate" BETWEEN '${params.startDate}' AND '${params.endDate}'
      group by ty."sortOrder",ty.code,ty.name,cl.code,cl.name,gp.code,gp.name,ac.code,ac.name,ac."DRCRCode",te."DRCRCode") as bs
      group by bs."sortOrder", bs.typecode, bs.typename, bs.classcode, bs.classname, bs.groupcode, bs.groupname, bs.accountcode, bs.accountname
      ) as bs1

      --get total debit and credits--

      `);
      return result[0];
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async getCompanyLedgerReport(companyId, filter) {
    try {
      let conditions = `t."companyId"=${companyId}`;
      if (filter !== null) {
        switch (filter.filterBy) {
          // case 'tax': {
          //   conditions = conditions + ` and tr."taxTypeId"=${filter.taxTypeId} and a."assignToTaxAccountId"=${filter.taxId}`;
          //   break
          // }
          case 'account': {
            conditions = conditions + ` and ac."id"=${filter.accountId}`;
            break;
          }
          case 'period': {
            conditions =
              conditions +
              ` and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${filter.startDate}' as date) and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${filter.endDate}' as date)`;
            //conditions = conditions + ` and tr."transactionDate" between '${filter.startDate}' and '${filter.endDate}'`;
            break;
          }
          // case 'search': {
          //   switch (filter.searchType) {
          //     case 'less': {
          //       conditions = conditions + ` and t.amount<${filter.amount}`;
          //       break
          //     }
          //     case 'more': {
          //       conditions = conditions + ` and t.amount>${filter.amount}`;
          //       break
          //     }
          //     case 'equal': {
          //       conditions = conditions + ` and t.amount=${filter.amount}`;
          //       break
          //     }
          //     case 'between': {
          //       conditions = conditions + ` and t.amount between ${filter.fromAmount} and ${filter.beforeAmount}`;
          //       break
          //     }
          //   }
          //   break
          // }
        }
      }
      let newArray = [];
      let result: any = await this.accountRepository.sequelize.query(`select 
        t.id as TransactionID, te.id as TransactionEntryID,t."transactionNo", t."transactionCode", t."transactionType", 
        to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate", 
        t."postedDate" as "postedDate", t."isVoid" as "isVoid", t."isReverse" as "isReverse", t."isDeleted" as "isDeleted", t."checkedDate" as "checkedDate", t."recorderDate" as "recorderDate",
        '' as Name, te."description" as details, ty.name as type,cl.name as class,gp.name as group, ac.name as Account, 
        --ty."sortOrder",ty.code as typecode,ty.name as typename,cl.code as classcode,cl.name as classname,gp.code as groupcode,gp.name as groupname, 
        --ac.code as accountcode,ac.name as accountname,ac."DRCRCode", gp."DRCRCode" as "GDRCRCode", 
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit,
        t."transactionCurrency", t."foreignCurrency", sum(te.amount) as amount, sum(te."foreignAmount") as foreignamount, 
        te."isAllocated",te."entityId", te."entityTypeId",te."userId",te."taskId",te."buId",te."employeeId",te."vendorId",te."clientId", 
        ac.id as accountid,ac.name as accountname, 
        te."taxAssignAccountId" as TaxID, 
        (select name from accounts where "companyId"=${companyId} and id::varchar=te."taxAssignAccountId") as TaxName 
        from types ty 
        inner join classes cl on cl."typeId"=ty.id 
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId" 
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId" 
        inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId" 
        inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId" 
        where ${conditions}
        group by t.id, te.id, t."transactionNo", t."transactionCode", t."transactionType", t."transactionDate", te."description",te."DRCRCode",ac.name,
        t."transactionCurrency", t."foreignCurrency",te."isAllocated",te."entityId", te."entityTypeId",te."userId",te."taskId",te."buId",te."employeeId",te."vendorId",te."clientId",
        ty.name,cl.name,gp.name,ac.id,ac.name,te."taxAssignAccountId"
        order by t."transactionDate" DESC, t."transactionNo" DESC
        --ty."sortOrder",ty.code,ty.name,cl.code,cl.name,gp.code,gp.name,ac.code,ac.name,ac."DRCRCode",te."DRCRCode",gp."DRCRCode"`);

      if (Array.isArray(result[0]) && result[0].length > 0) {
        result[0] = await this.transformCompanyLedgerList(result[0], false);

        let transactionNo = [...new Set(result[0].map((x) => x.transactionNo))];
        for (let no of transactionNo) {
          let group = result[0].filter((x) => x.transactionNo === no);

          let debit = group.filter((x) => x.debit > 0);
          let credit = group.filter((x) => x.credit > 0);

          newArray.push(...debit.concat(credit));
        }
      }

      return newArray;
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async clearAccountsByCompanyId(companyId: number) {
    await this.accountRepository.destroy({
      where: {
        companyId,
      },
    });
  }

  static async getAccountRawQuery(rawQuery) {
    try {
      let result: any = await Account.sequelize.query(rawQuery);
      return result[0];
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async getCompanyWorksheet(
    companyId: number,
    startDate: string,
    endDate: string,
    lastDate: string,
  ) {
    startDate = startDate.split('-').join('/');
    endDate = endDate.split('-').join('/');
    lastDate = lastDate.split('-').join('/');
    try {
      let result: any = await this.accountRepository.sequelize.query(`select
       bs1.accountcode,
        bs1.accountnumber,
        bs1.accountname as account,
        bs1.unadjdebit as unadjdebit,
        bs1.unadjcredit as unadjcredit,
        bs1.adjdebit as adjdebit,
        bs1.adjcredit as adjcredit,
        --bs1.prevadjdebit as prevadjdebit, bs1.prevadjcredit as prevadjcredit,
        (case
                when (bs1.unadjdebit = 0
                and bs1.unadjcredit = 0
                and bs1.adjdebit>0
                and bs1.adjcredit = 0) then (bs1.unadjdebit-bs1.unadjcredit) + (bs1.adjdebit-bs1.adjcredit)
                else
        (case
                    when bs1.unadjdebit>0
                    and bs1.unadjcredit = 0 then (bs1.unadjdebit-bs1.unadjcredit) + (bs1.adjdebit-bs1.adjcredit)
                    else 0
                end)
            end) as adjtbdebit,
            (case
                when (bs1.unadjdebit = 0
                and bs1.unadjcredit = 0
                and bs1.adjdebit = 0
                and bs1.adjcredit>0) then (bs1.unadjcredit-bs1.unadjdebit) + (bs1.adjcredit-bs1.adjdebit)
                else
        (case
                    when bs1.unadjcredit>0
                    and bs1.unadjdebit = 0 then (bs1.unadjcredit-bs1.unadjdebit) + (bs1.adjcredit-bs1.adjdebit)
                    else 0
                end)
            end) as adjtbcredit,
            (case
                when bs1."finDocName" = 'INCOME STATEMENT' then
        (case
                    when (bs1.unadjdebit = 0
                    and bs1.unadjcredit = 0
                    and bs1.adjdebit>0
                    and bs1.adjcredit = 0) then (bs1.unadjdebit-bs1.unadjcredit) + (bs1.adjdebit-bs1.adjcredit)
                    else
        (case
                        when bs1.unadjdebit>0
                        and bs1.unadjcredit = 0 then (bs1.unadjdebit-bs1.unadjcredit) + (bs1.adjdebit-bs1.adjcredit)
                        else 0
                    end)
                end)
                else 0
            end) as isdebit,
            (case
                when bs1."finDocName" = 'INCOME STATEMENT' then
        (case
                    when (bs1.unadjdebit = 0
                    and bs1.unadjcredit = 0
                    and bs1.adjdebit = 0
                    and bs1.adjcredit>0) then (bs1.unadjcredit-bs1.unadjdebit) + (bs1.adjcredit-bs1.adjdebit)
                    else
        (case
                        when bs1.unadjcredit>0
                        and bs1.unadjdebit = 0 then (bs1.unadjcredit-bs1.unadjdebit) + (bs1.adjcredit-bs1.adjdebit)
                        else 0
                    end)
                end)
                else 0
                end) as iscredit,
                (case
                when bs1."finDocName" = 'INCOME STATEMENT' then
        (case
                    when (bs1.unadjdebit = 0
                    and bs1.unadjcredit = 0
                    and bs1.adjdebit = 0
                    and bs1.adjcredit>0) then (bs1.unadjcredit-bs1.unadjdebit) + (bs1.adjcredit-bs1.adjdebit)
                    else
        (case
                        when bs1.unadjcredit>0
                        and bs1.unadjdebit = 0 then (bs1.unadjcredit-bs1.unadjdebit) + (bs1.adjcredit-bs1.adjdebit)
                        else 0
                    end)
                end)
                else 0
            end) as closingdebit,
            (case
                when bs1."finDocName" = 'INCOME STATEMENT' then
        (case
                    when (bs1.unadjdebit = 0
                    and bs1.unadjcredit = 0
                    and bs1.adjdebit>0
                    and bs1.adjcredit = 0) then (bs1.unadjdebit-bs1.unadjcredit) + (bs1.adjdebit-bs1.adjcredit)
                    else
        (case
                        when bs1.unadjdebit>0
                        and bs1.unadjcredit = 0 then (bs1.unadjdebit-bs1.unadjcredit) + (bs1.adjdebit-bs1.adjcredit)
                        else 0
                    end)
                end)
                else 0
            end) as closingcredit,
            (case
                when bs1."finDocName" = 'BALANCE SHEET' then
        (case
                    when (bs1.unadjdebit = 0
                    and bs1.unadjcredit = 0
                    and bs1.adjdebit>0
                    and bs1.adjcredit = 0) then (bs1.unadjdebit-bs1.unadjcredit) + (bs1.adjdebit-bs1.adjcredit)
                    else
        (case
                        when bs1.unadjdebit>0
                        and bs1.unadjcredit = 0 then (bs1.unadjdebit-bs1.unadjcredit) + (bs1.adjdebit-bs1.adjcredit)
                        else 0
                    end)
                end)
                else
        (
        (case
                    when bs1."finDocName" = 'INCOME STATEMENT' then
        (case
                        when (bs1.unadjdebit = 0
                        and bs1.unadjcredit = 0
                        and bs1.adjdebit>0
                        and bs1.adjcredit = 0) then (bs1.unadjdebit-bs1.unadjcredit) + (bs1.adjdebit-bs1.adjcredit)
                        else
        (case
                            when bs1.unadjdebit>0
                            and bs1.unadjcredit = 0 then (bs1.unadjdebit-bs1.unadjcredit) + (bs1.adjdebit-bs1.adjcredit)
                            else 0
                    end)
                    end)
                    else 0
                end) -
        (case
                        when bs1."finDocName" = 'INCOME STATEMENT' then
        (case
                        when (bs1.unadjdebit = 0
                        and bs1.unadjcredit = 0
                        and bs1.adjdebit>0
                        and bs1.adjcredit = 0) then (bs1.unadjdebit-bs1.unadjcredit) + (bs1.adjdebit-bs1.adjcredit)
                        else
        (case
                            when bs1.unadjdebit>0
                            and bs1.unadjcredit = 0 then (bs1.unadjdebit-bs1.unadjcredit) + (bs1.adjdebit-bs1.adjcredit)
                            else 0
                        end)
                    end)
                    else 0
                end)
        )
            end) as posttbdebit,
            (case
                when bs1."finDocName" = 'BALANCE SHEET' then
        (case
                    when (bs1.unadjdebit = 0
                    and bs1.unadjcredit = 0
                    and bs1.adjdebit = 0
                    and bs1.adjcredit>0) then (bs1.unadjcredit-bs1.unadjdebit) + (bs1.adjcredit-bs1.adjdebit)
                    else
        (case
                        when bs1.unadjcredit>0
                        and bs1.unadjdebit = 0 then (bs1.unadjcredit-bs1.unadjdebit) + (bs1.adjcredit-bs1.adjdebit)
                        else 0
                    end)
                end)
                else
        (
        (case
                    when bs1."finDocName" = 'INCOME STATEMENT' then
        (case
                        when (bs1.unadjdebit = 0
                        and bs1.unadjcredit = 0
                        and bs1.adjdebit = 0
                        and bs1.adjcredit>0) then (bs1.unadjcredit-bs1.unadjdebit) + (bs1.adjcredit-bs1.adjdebit)
                        else
        (case
                            when bs1.unadjcredit>0
                            and bs1.unadjdebit = 0 then (bs1.unadjcredit-bs1.unadjdebit) + (bs1.adjcredit-bs1.adjdebit)
                            else 0
                        end)
                    end)
                    else 0
                end) -
        (case
                    when bs1."finDocName" = 'INCOME STATEMENT' then
        (case
                        when (bs1.unadjdebit = 0
                        and bs1.unadjcredit = 0
                        and bs1.adjdebit = 0
                        and bs1.adjcredit>0) then (bs1.unadjcredit-bs1.unadjdebit) + (bs1.adjcredit-bs1.adjdebit)
                        else
        (case
                            when bs1.unadjcredit>0
                            and bs1.unadjdebit = 0 then (bs1.unadjcredit-bs1.unadjdebit) + (bs1.adjcredit-bs1.adjdebit)
                            else 0
                        end)
                    end)
                    else 0
                end)
        )
            end) as posttbcredit,
            (case
                when bs1."finDocName" = 'BALANCE SHEET' then
        (case
                    when (bs1.unadjdebit = 0
                    and bs1.unadjcredit = 0
                    and bs1.adjdebit>0
                    and bs1.adjcredit = 0) then (bs1.unadjdebit-bs1.unadjcredit) + (bs1.adjdebit-bs1.adjcredit)
                    else
        (case
                        when bs1.unadjdebit>0
                        and bs1.unadjcredit = 0 then (bs1.unadjdebit-bs1.unadjcredit) + (bs1.adjdebit-bs1.adjcredit)
                        else 0
                    end)
                end)
                else 0
            end) as bsdebit,
            (case
                when bs1."finDocName" = 'BALANCE SHEET' then
        (case
                    when (bs1.unadjdebit = 0
                    and bs1.unadjcredit = 0
                    and bs1.adjdebit = 0
                    and bs1.adjcredit>0) then (bs1.unadjcredit-bs1.unadjdebit) + (bs1.adjcredit-bs1.adjdebit)
                    else
        (case
                        when bs1.unadjcredit>0
                        and bs1.unadjdebit = 0 then (bs1.unadjcredit-bs1.unadjdebit) + (bs1.adjcredit-bs1.adjdebit)
                        else 0
                    end)
                end)
                else 0
            end) as bscredit,
            bs1.accountid
        from
            (
            select
                bs."sortOrder",
                bs."finDocName",
                bs.typecode,
                bs.typename,
                bs.classcode,
                bs.classname,
                bs.groupcode,
                bs.groupname,
                bs.accountcode,
                bs.accountnumber,
                bs.accountname,
                (case
                    when
        sum((case when bs."DRCRCode" = 'CR' then (bs.unadjcredit-bs.unadjdebit)+(bs.prevadjcredit-bs.prevadjdebit) else 0 end))<0
        then abs(sum((case when bs."DRCRCode" = 'CR' then (bs.unadjcredit-bs.unadjdebit)+(bs.prevadjcredit-bs.prevadjdebit) else 0 end)))
                    else
        (
        case
                        when sum((case when bs."DRCRCode" = 'DR' then (bs.unadjdebit-bs.unadjcredit)+(bs.prevadjdebit-bs.prevadjcredit) else 0 end))<0
        then 0
                        else sum((case when bs."DRCRCode" = 'DR' then (bs.unadjdebit-bs.unadjcredit)+(bs.prevadjdebit-bs.prevadjcredit) else 0 end))
                    end
        )
                end) as unadjdebit,
                (case
                    when
        sum((case when bs."DRCRCode" = 'DR' then (bs.unadjdebit-bs.unadjcredit)+(bs.prevadjdebit-bs.prevadjcredit) else 0 end))<0
        then abs(sum((case when bs."DRCRCode" = 'DR' then (bs.unadjdebit-bs.unadjcredit)+(bs.prevadjdebit-bs.prevadjcredit) else 0 end)))
                    else
        (
        case
                        when sum((case when bs."DRCRCode" = 'CR' then (bs.unadjcredit-bs.unadjdebit)+(bs.prevadjcredit-bs.prevadjdebit) else 0 end))<0
        then 0
                        else sum((case when bs."DRCRCode" = 'CR' then (bs.unadjcredit-bs.unadjdebit)+(bs.prevadjcredit-bs.prevadjdebit) else 0 end))
                    end
        )
                end) as unadjcredit,
                (case
                    when
        sum((case when bs."DRCRCode" = 'CR' then (bs.adjcredit-bs.adjdebit) else 0 end))<0
        then abs(sum((case when bs."DRCRCode" = 'CR' then (bs.adjcredit-bs.adjdebit) else 0 end)))
                    else
        (
        case
                        when sum((case when bs."DRCRCode" = 'DR' then (bs.adjdebit-bs.adjcredit) else 0 end))<0
        then 0
                        else sum((case when bs."DRCRCode" = 'DR' then (bs.adjdebit-bs.adjcredit) else 0 end))
                    end
        )
                end) as adjdebit,
                (case
                    when
        sum((case when bs."DRCRCode" = 'DR' then bs.adjdebit-bs.adjcredit else 0 end))<0
        then abs(sum((case when bs."DRCRCode" = 'DR' then bs.adjdebit-bs.adjcredit else 0 end)))
                    else
        (
        case
                        when sum((case when bs."DRCRCode" = 'CR' then bs.adjcredit-bs.adjdebit else 0 end))<0
        then 0
                        else sum((case when bs."DRCRCode" = 'CR' then bs.adjcredit-bs.adjdebit else 0 end))
                    end
        )
                end) as adjcredit,
                bs.accountid
            from
                (
                select
                    ty."sortOrder",
                    ty.code as typecode,
                    ty.name as typename,
                    cl.code as classcode,
                    cl.name as classname,
                    gp.code as groupcode,
                    gp.name as groupname,
                    ac.code as accountcode,
                    ac.number as accountnumber,
                    ac.name as accountname,
                    ac."DRCRCode",
                    ty."finDocName",
                    (case
                        when te."DRCRCode" = 'DR'
                        and t."transactionType" <> 'ADJUSTING' then sum(te.amount)
                        else 0
                    end) as unadjdebit,
                    (case
                        when te."DRCRCode" = 'CR'
                        and t."transactionType" <> 'ADJUSTING' then sum(te.amount)
                        else 0
                    end) as unadjcredit,
                    0 as adjdebit,
                    0 as adjcredit,
                    0 as prevadjdebit,
                    0 as prevadjcredit,
                    ac.id as accountid
                from
                    types ty
                inner join classes cl on
                    cl."typeId" = ty.id
                inner join groups gp on
                    gp."classId" = cl.id
                    and cl."companyId" = gp."companyId"
                inner join accounts ac on
                    ac."groupId" = gp.id
                    and gp."companyId" = ac."companyId"
                inner join "transactionEntry" te on
                    te."accountId" = ac.id
                    and te."companyId" = ac."companyId"
                inner join transaction t on
                    t.id = te."transactionId"
                    and t."companyId" = te."companyId"
                where
                    t."companyId" = ${companyId}
                    and ty."finDocName" = 'BALANCE SHEET'
                    and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)
                group by
                    ty."sortOrder",
                    ty.code,
                    ty.name,
                    cl.code,
                    cl.name,
                    gp.code,
                    gp.name,
                    ac.code,
                    ac.number,
                    ac.name,
                    ac."DRCRCode",
                    te."DRCRCode",
                    t."transactionType",
                    ty."finDocName",
                    ac.id
            union all
                select
                    ty."sortOrder",
                    ty.code as typecode,
                    ty.name as typename,
                    cl.code as classcode,
                    cl.name as classname,
                    gp.code as groupcode,
                    gp.name as groupname,
                    ac.code as accountcode,
                    ac.number as accountnumber,
                    ac.name as accountname,
                    ac."DRCRCode",
                    ty."finDocName",
                    0 as unadjdebit,
                    0 as unadjcredit,
                    (case
                        when te."DRCRCode" = 'DR'
                            and t."transactionType" = 'ADJUSTING' then sum(te.amount)
                            else 0
                        end) as adjdebit,
                    (case
                        when te."DRCRCode" = 'CR'
                            and t."transactionType" = 'ADJUSTING' then sum(te.amount)
                            else 0
                        end) as adjcredit,
                    0 as prevadjdebit,
                    0 as prevadjcredit,
                    ac.id as accountid
                from
                    types ty
                inner join classes cl on
                    cl."typeId" = ty.id
                inner join groups gp on
                    gp."classId" = cl.id
                    and cl."companyId" = gp."companyId"
                inner join accounts ac on
                    ac."groupId" = gp.id
                    and gp."companyId" = ac."companyId"
                inner join "transactionEntry" te on
                    te."accountId" = ac.id
                    and te."companyId" = ac."companyId"
                inner join transaction t on
                    t.id = te."transactionId"
                    and t."companyId" = te."companyId"
                where
                    t."companyId" = ${companyId}
                    and ty."finDocName" = 'BALANCE SHEET'
                    and t."transactionType" = 'ADJUSTING'
                    and
        cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)
                    and
        cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)
                group by
                    ty."sortOrder",
                    ty.code,
                    ty.name,
                    cl.code,
                    cl.name,
                    gp.code,
                    gp.name,
                    ac.code,
                    ac.number,
                    ac.name,
                    ac."DRCRCode",
                    te."DRCRCode",
                    t."transactionType",
                    ty."finDocName",
                    ac.id
            union all
                select
                    ty."sortOrder",
                    ty.code as typecode,
                    ty.name as typename,
                    cl.code as classcode,
                    cl.name as classname,
                    gp.code as groupcode,
                    gp.name as groupname,
                    ac.code as accountcode,
                    ac.number as accountnumber,
                    ac.name as accountname,
                    ac."DRCRCode",
                    ty."finDocName",
                    0 as unadjdebit,
                    0 as unadjcredit,
                    0 as unadjdebit,
                    0 as unadjcredit,
                    (case
                        when te."DRCRCode" = 'DR'
                            and t."transactionType" = 'ADJUSTING' then sum(te.amount)
                            else 0
                        end) as prevadjdebit,
                    (case
                        when te."DRCRCode" = 'CR'
                            and t."transactionType" = 'ADJUSTING' then sum(te.amount)
                            else 0
                        end) as prevadjcredit,
                    ac.id as accountid
                from
                    types ty
                inner join classes cl on
                    cl."typeId" = ty.id
                inner join groups gp on
                    gp."classId" = cl.id
                    and cl."companyId" = gp."companyId"
                inner join accounts ac on
                    ac."groupId" = gp.id
                    and gp."companyId" = ac."companyId"
                inner join "transactionEntry" te on
                    te."accountId" = ac.id
                    and te."companyId" = ac."companyId"
                inner join transaction t on
                    t.id = te."transactionId"
                    and t."companyId" = te."companyId"
                where
                    t."companyId" = ${companyId}
                    and ty."finDocName" = 'BALANCE SHEET'
                    and t."transactionType" = 'ADJUSTING'
                    and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${lastDate}' as date)
                group by
                    ty."sortOrder",
                    ty.code,
                    ty.name,
                    cl.code,
                    cl.name,
                    gp.code,
                    gp.name,
                    ac.code,
                    ac.number,
                    ac.name,
                    ac."DRCRCode",
                    te."DRCRCode",
                    t."transactionType",
                    ty."finDocName",
                    ac.id
        ) as bs
            group by
                bs."sortOrder",
                bs.typecode,
                bs.typename,
                bs.classcode,
                bs.classname,
                bs.groupcode,
                bs.groupname,
                bs.accountcode,
                bs.accountnumber,
                bs.accountname,
                bs."finDocName",
                bs.accountid
        union all
            select
                bs."sortOrder",
                bs."finDocName",
                bs.typecode,
                bs.typename,
                bs.classcode,
                bs.classname,
                bs.groupcode,
                bs.groupname,
                bs.accountcode,
                bs.accountnumber,
                bs.accountname,
                (case
                    when
        sum((case when bs."DRCRCode" = 'CR' then bs.unadjcredit-bs.unadjdebit else 0 end))<0
        then abs(sum((case when bs."DRCRCode" = 'CR' then bs.unadjcredit-bs.unadjdebit else 0 end)))
                    else
        (
        case
                        when sum((case when bs."DRCRCode" = 'DR' then bs.unadjdebit-bs.unadjcredit else 0 end))<0
        then 0
                        else sum((case when bs."DRCRCode" = 'DR' then bs.unadjdebit-bs.unadjcredit else 0 end))
                    end
        )
                end) as unadjdebit,
                (case
                    when
        sum((case when bs."DRCRCode" = 'DR' then bs.unadjdebit-bs.unadjcredit else 0 end))<0
        then abs(sum((case when bs."DRCRCode" = 'DR' then bs.unadjdebit-bs.unadjcredit else 0 end)))
                    else
        (
        case
                        when sum((case when bs."DRCRCode" = 'CR' then bs.unadjcredit-bs.unadjdebit else 0 end))<0
        then 0
                        else sum((case when bs."DRCRCode" = 'CR' then bs.unadjcredit-bs.unadjdebit else 0 end))
                    end
        )
                end) as unadjcredit,
                (case
                    when
        sum((case when bs."DRCRCode" = 'CR' then bs.adjcredit-bs.adjdebit else 0 end))<0
        then abs(sum((case when bs."DRCRCode" = 'CR' then bs.adjcredit-bs.adjdebit else 0 end)))
                    else
        (
        case
                        when sum((case when bs."DRCRCode" = 'DR' then bs.adjdebit-bs.adjcredit else 0 end))<0
        then 0
                        else sum((case when bs."DRCRCode" = 'DR' then bs.adjdebit-bs.adjcredit else 0 end))
                    end
        )
                end) as adjdebit,
                (case
                    when
        sum((case when bs."DRCRCode" = 'DR' then bs.adjdebit-bs.adjcredit else 0 end))<0
        then abs(sum((case when bs."DRCRCode" = 'DR' then bs.adjdebit-bs.adjcredit else 0 end)))
                    else
        (
        case
                        when sum((case when bs."DRCRCode" = 'CR' then bs.adjcredit-bs.adjdebit else 0 end))<0
        then 0
                        else sum((case when bs."DRCRCode" = 'CR' then bs.adjcredit-bs.adjdebit else 0 end))
                    end
        )
                end) as adjcredit,
                bs.accountid
            from
                (
                select
                    ty."sortOrder",
                    ty.code as typecode,
                    ty.name as typename,
                    cl.code as classcode,
                    cl.name as classname,
                    gp.code as groupcode,
                    gp.name as groupname,
                    ac.code as accountcode,
                    ac.number as accountnumber,
                    ac.name as accountname,
                    ac."DRCRCode",
                    ty."finDocName",
                    (case
                        when te."DRCRCode" = 'DR'
                            and t."transactionType" <> 'ADJUSTING' then sum(te.amount)
                            else 0
                        end) as unadjdebit,
                    (case
                        when te."DRCRCode" = 'CR'
                            and t."transactionType" <> 'ADJUSTING' then sum(te.amount)
                            else 0
                        end) as unadjcredit,
                    (case
                        when te."DRCRCode" = 'DR'
                            and t."transactionType" = 'ADJUSTING' then sum(te.amount)
                            else 0
                        end) as adjdebit,
                    (case
                        when te."DRCRCode" = 'CR'
                            and t."transactionType" = 'ADJUSTING' then sum(te.amount)
                            else 0
                        end) as adjcredit,
                    0 as prevadjdebit,
                    0 as prevadjcredit,
                    ac.id as accountid
                from
                    types ty
                inner join classes cl on
                    cl."typeId" = ty.id
                inner join groups gp on
                    gp."classId" = cl.id
                    and cl."companyId" = gp."companyId"
                inner join accounts ac on
                    ac."groupId" = gp.id
                    and gp."companyId" = ac."companyId"
                inner join "transactionEntry" te on
                    te."accountId" = ac.id
                    and te."companyId" = ac."companyId"
                inner join transaction t on
                    t.id = te."transactionId"
                    and t."companyId" = te."companyId"
                where
                    t."companyId" = ${companyId}
                    and ty."finDocName" = 'INCOME STATEMENT'
                    and
        cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)
                        and
        cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)
                    group by
                        ty."sortOrder",
                        ty.code,
                        ty.name,
                        cl.code,
                        cl.name,
                        gp.code,
                        gp.name,
                        ac.code,
                        ac.number,
                        ac.name,
                        ac."DRCRCode",
                        te."DRCRCode",
                        t."transactionType",
                        ty."finDocName",
                        ac.id
        ) as bs
            group by
                bs."sortOrder",
                bs.typecode,
                bs.typename,
                bs.classcode,
                bs.classname,
                bs.groupcode,
                bs.groupname,
                bs.accountcode,
                bs.accountnumber,
                bs.accountname,
                bs."finDocName",
                bs.accountid
            order by
                "sortOrder",
                typecode,
                typename,
                classcode,
                classname,
                groupcode,
                groupname,
                accountname
        ) as bs1
        union all
        select
            code,
            number,
            name,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            --0,0,
            (case
                when public.get_currentearnings(${companyId},
                '${startDate}',
                '${endDate}')<0 then public.get_currentearnings(${companyId},
                '${startDate}',
                '${endDate}')*-1
                else 0
            end) as closingdebit,
            (case
                when public.get_currentearnings(${companyId},
                '${startDate}',
                '${endDate}')>0 then public.get_currentearnings(${companyId},
                '${startDate}',
                '${endDate}')
                else 0
            end) as closingcredit,
            (case
                when public.get_currentearnings(${companyId},
                '${startDate}',
                '${endDate}')<0 then public.get_currentearnings(${companyId},
                '${startDate}',
                '${endDate}')*-1
                else 0
            end) as posttbdebit,
            (case
                when public.get_currentearnings(${companyId},
                '${startDate}',
                '${endDate}')>0 then public.get_currentearnings(${companyId},
                '${startDate}',
                '${endDate}')
                else 0
            end) as posttbcredit,
            (case
                when public.get_currentearnings(${companyId},
                '${startDate}',
                '${endDate}')<0 then public.get_currentearnings(${companyId},
                '${startDate}',
                '${endDate}')*-1
                else 0
            end) as bsdebit,
            (case
                when public.get_currentearnings(${companyId},
                '${startDate}',
                '${endDate}')>0 then public.get_currentearnings(${companyId},
                '${startDate}',
                '${endDate}')
                else 0
            end) as bscredit,
            id
        from
            accounts
        where
            "companyId" = ${companyId}
            and name = 'Net Current Earnings'
        union all
        select
            code,
            number,
            name,
            (case
                when public.get_retainedearnings(${companyId},
                '${lastDate}')<0 then public.get_retainedearnings(${companyId},
                '${lastDate}')*-1
                else 0
            end),
            (case
                when public.get_retainedearnings(${companyId},
                '${lastDate}')>0 then public.get_retainedearnings(${companyId},
                '${lastDate}')
                else 0
            end),
            0,
            0,
            (case
                when public.get_retainedearnings(${companyId},
                '${lastDate}')<0 then public.get_retainedearnings(${companyId},
                '${lastDate}')*-1
                else 0
            end),
            (case
                when public.get_retainedearnings(${companyId},
                '${lastDate}')>0 then public.get_retainedearnings(${companyId},
                '${lastDate}')
                else 0
            end),
            0,
            0,
0,0,
            --(case when public.get_retainedearnings(${companyId}, '${lastDate}')<0 then public.get_retainedearnings(${companyId}, '${lastDate}')*-1 else 0 end) as closingdebit,
            --(case when public.get_retainedearnings(${companyId}, '${lastDate}')>0 then public.get_retainedearnings(${companyId}, '${lastDate}') else 0 end) as closingcredit,
            (case
                when public.get_retainedearnings(${companyId},
                '${lastDate}')<0 then public.get_retainedearnings(${companyId},
                '${lastDate}')*-1
                else 0
            end) as posttbdebit,
            (case
                when public.get_retainedearnings(${companyId},
                '${lastDate}')>0 then public.get_retainedearnings(${companyId},
                '${lastDate}')
                else 0
            end) as posttbcredit,
            (case
                when public.get_retainedearnings(${companyId},
                '${lastDate}')<0 then public.get_retainedearnings(${companyId},
                '${lastDate}')*-1
                else 0
            end) as bsdebit,
            (case
                when public.get_retainedearnings(${companyId},
                '${lastDate}')>0 then public.get_retainedearnings(${companyId},
                '${lastDate}')
                else 0
            end) as bscredit,
            id
        from
            accounts
        where
            "companyId" = ${companyId}
            and name = 'Retained Earnings'`);
      return result[0];
    } catch (e) {
      console.log(e.message);
      return {
        name: e.name,
        message: e.message,
      };
    }
  }

  // async getCreditableVatWithheldSubAccounts(params: GetTaxAccountsWithEndDateDto) {
  //   const creditableVatWithheldSubAccounts = await this.accountRepository.sequelize.query(`
  //     select
  //     ac.id as accountid, ac.code as dbcode, ac.number as accountno, ac.name as accountname, ac."taxId",
  //     (case when ty."finDocName"='BALANCE SHEET' THEN 'BS' ELSE (CASE WHEN ty."finDocName"='INCOME STATEMENT' THEN 'IS' ELSE '' END ) END) as report,
  //     gld1.debit, gld1.credit, gld1.endingbalance,ac."DRCRCode" as setas
  //     from types ty
  //     inner join classes cl on cl."typeId"=ty.id
  //     inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
  //     inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
  //     left outer join
  //     (
  //     select
  //     gld.accountid,gld.dbcode,gld.accountno,gld.accountname,
  //     sum(gld.debit) as debit, sum(gld.credit) as credit,
  //     (case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else sum(gld.credit)-sum(gld.debit) end) as endingbalance
  //     from (
  //     SELECT
  //     ac.id as accountid,
  //     ac.code as dbcode,
  //     ac.number as accountno,
  //     ac.name as accountname,
  //     ac."DRCRCode" as "ADRCRCode",
  //     (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
  //     (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
  //     from accounts ac
  //     inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
  //     inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
  //     where t."companyId"=${params.companyId} and ac."accountTypeId"=16
  //     and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
  //     group by ac.id,ac.code, ac.number,ac.name,te."DRCRCode",ac."DRCRCode") as gld
  //     group by gld.accountid,gld.dbcode,gld.accountno,gld.accountname,gld."ADRCRCode"
  //     ) as gld1 on gld1.accountid=ac.id
  //     where ac."companyId"=${params.companyId} and ac."accountTypeId"=16 and ac."parentId" is not null
  //     ORDER BY string_to_array(ac.code, '.', '')::int[];
  //     `);
  //   return creditableVatWithheldSubAccounts[0]
  // }

  async getWithHoldingTaxExpandedSubAccountsEndingBalances(
    params: GetTaxAccountsWithEndDateDto,
  ) {
    const withHoldingTaxExpandedSubAccountsEndingBalances = await this
      .accountRepository.sequelize.query(`
    select
        ac.id as accountid, ac.code as dbcode, ac.number as accountno, ac.name as accountname, ac."taxId",
	(select code from "withHoldingTax" where id=ac."taxId") as taxcode,
	(select tr.rate from "withHoldingTax" wt inner join "taxRate" tr on tr."withHoldingTaxId"=wt.id where wt.id=ac."taxId") as taxrate,
        (case when ty."finDocName"='BALANCE SHEET' THEN 'BS' ELSE (CASE WHEN ty."finDocName"='INCOME STATEMENT' THEN 'IS' ELSE '' END ) END) as report,
        gld1.debit, gld1.credit, gld1.endingbalance,ac."DRCRCode" as setas 
        from types ty
        inner join classes cl on cl."typeId"=ty.id
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
        left outer join
        (
        select
        gld.accountid,gld.dbcode,gld.accountno,gld.accountname,
        sum(gld.debit) as debit, sum(gld.credit) as credit,
        (case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else sum(gld.credit)-sum(gld.debit) end) as endingbalance
        from (
        SELECT
        ac.id as accountid,
        ac.code as dbcode,
        ac.number as accountno,
        ac.name as accountname,
        ac."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        from accounts ac
        inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
        inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
        where t."companyId"=${params.companyId} and ac."accountTypeId"=13
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
        group by ac.id,ac.code, ac.number,ac.name,te."DRCRCode",ac."DRCRCode") as gld
        group by gld.accountid,gld.dbcode,gld.accountno,gld.accountname,gld."ADRCRCode"
        ) as gld1 on gld1.accountid=ac.id
        where ac."companyId"=${params.companyId} and ac."accountTypeId"=13 and ac."parentId" is not null
        --order by ac.code
	ORDER BY CAST(SUBSTRING(ac.code FROM '• (\d+)') AS INTEGER)
      `);
    return withHoldingTaxExpandedSubAccountsEndingBalances[0];
  }

  async getWithHoldingTaxExpandedEndingBalances(
    params: GetTaxAccountsWithEndDateDto,
  ) {
    let withHoldingTaxExpandedEndingBalances = await this.accountRepository
      .sequelize.query(`

    SELECT
        (select code from accounts where "companyId"=${params.companyId} and "accountTypeId"=13 and "parentId" is null) as dbcode,
        (select number from accounts where "companyId"=${params.companyId} and "accountTypeId"=13 and "parentId" is null) as accountno,
        (select name from accounts where "companyId"=${params.companyId} and "accountTypeId"=13 and "parentId" is null) as taxaccounts,
	    (case when gld."ADRCRCode"='DR' then sum(gld.debit) else 0 end) as debit,
		(case when gld."ADRCRCode"='CR' then sum(gld.credit) else 0 end) as credit,
        (case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else sum(gld.credit)-sum(gld.debit) end) as endingbalance
        FROM
        (
        SELECT
        ac."accountTypeId",
        at."accountTypeName",
        ac.id as accountid,
        ac.code as dbcode,
        ac.number as accountno,
        ac.name as accountname,
        ac."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        from types ty
        inner join classes cl on cl."typeId"=ty.id
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
        inner join "accountTypes" at on at."accountTypeID"=ac."accountTypeId"
        left outer join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
        left outer join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
        where t."companyId"=${params.companyId} and ac."accountTypeId"=13
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
        group by ac."accountTypeId",ac.id,ac.code, ac.number,ac.name,te."DRCRCode",ac."DRCRCode",at."accountTypeName") as gld
        group by gld."accountTypeId",gld."accountTypeName",gld."ADRCRCode"
        `);

    if (withHoldingTaxExpandedEndingBalances[0].length === 0) {
      let account = await this.accountRepository.findOne({
        where: {
          companyId: params.companyId,
          accountTypeId: 13,
          parentId: null,
        },
      });

      return [
        {
          accountno: null,
          dbcode: account.code,
          taxaccounts: account.name,
          vpbbalance: 0,
        },
      ];
    } else {
      return withHoldingTaxExpandedEndingBalances[0];
    }
  }

  async getCreditableVatWithheldSubAccounts(
    params: GetTaxAccountsWithEndDateDto,
  ) {
    const creditableVatWithheldSubAccounts = await this.accountRepository
      .sequelize.query(`
      select
        ac.id as accountid, ac.code as dbcode, ac.number as accountno, ac.name as accountname, ac."taxId",
        (select code from "saleTax" where id=ac."taxId") as taxcode,
        (select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId") as taxrate,
        (case when ty."finDocName"='BALANCE SHEET' THEN 'BS' ELSE (CASE WHEN ty."finDocName"='INCOME STATEMENT' THEN 'IS' ELSE '' END ) END) as report,
        gld1.debit, gld1.credit, gld1.endingbalance,ac."DRCRCode" as setas
        from types ty
        inner join classes cl on cl."typeId"=ty.id
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
        left outer join
        (
        select
        gld.accountid,gld.dbcode,gld.accountno,gld.accountname,
        sum(gld.debit) as debit, sum(gld.credit) as credit,
        (case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else sum(gld.credit)-sum(gld.debit) end) as endingbalance
        from (
        SELECT
        ac.id as accountid,
        ac.code as dbcode,
        ac.number as accountno,
        ac.name as accountname,
        ac."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        from accounts ac
        inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
        inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
        where t."companyId"=${params.companyId} and ac."accountTypeId"=16
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
        group by ac.id,ac.code, ac.number,ac.name,te."DRCRCode",ac."DRCRCode") as gld
        group by gld.accountid,gld.dbcode,gld.accountno,gld.accountname,gld."ADRCRCode"
        ) as gld1 on gld1.accountid=ac.id
        where ac."companyId"=${params.companyId} and ac."accountTypeId"=16 and ac."parentId" is not null
        ORDER BY string_to_array(ac.code, '.', '')::int[];
      `);
    return creditableVatWithheldSubAccounts[0];
  }

  async getCreditableVatWithheld(params: GetTaxAccountsWithEndDateDto) {
    let creditableVatWithheld = await this.accountRepository.sequelize.query(`

	  SELECT
          (select code from accounts where "companyId"=${params.companyId} and "accountTypeId"=16 and "parentId" is null) as dbcode,
          (select number from accounts where "companyId"=${params.companyId} and "accountTypeId"=16 and "parentId" is null) as accountno,
          (select name from accounts where "companyId"=${params.companyId} and "accountTypeId"=16 and "parentId" is null) as taxaccounts,
          (case when gld."ADRCRCode"='DR' then sum(gld.debit) else 0 end) as debit,
          (case when gld."ADRCRCode"='CR' then sum(gld.credit) else 0 end) as credit,
          (case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else sum(gld.credit)-sum(gld.debit) end) as endingbalance
          FROM
          (
          SELECT
          ac."accountTypeId",
          at."accountTypeName",
          ac.id as accountid,
          ac.code as dbcode,
          ac.number as accountno,
          ac.name as accountname,
          ac."DRCRCode" as "ADRCRCode",
          (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
          (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit,
          ac."parentId"
          from types ty
          inner join classes cl on cl."typeId"=ty.id
          inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
          inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
          inner join "accountTypes" at on at."accountTypeID"=ac."accountTypeId"
          left outer join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
          left outer join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
          where t."companyId"=${params.companyId} and ac."accountTypeId"=16
          and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
          group by ac."accountTypeId",ac.id,ac.code, ac.number,ac.name,te."DRCRCode",ac."DRCRCode",at."accountTypeName",ac."parentId") as gld
          group by gld."accountTypeId",gld."accountTypeName",gld."ADRCRCode"

        `);

    if (creditableVatWithheld[0].length === 0) {
      let account = await this.accountRepository.findOne({
        where: {
          companyId: params.companyId,
          accountTypeId: 16,
          parentId: null,
        },
      });

      return [
        {
          accountno: null,
          dbcode: account.code,
          taxaccounts: account.name,
          vpbbalance: 0,
        },
      ];
    } else {
      return creditableVatWithheld[0];
    }
  }

  async getInputTax(params: GetTaxAccountsWithEndDateDto) {
    let inputTax = await this.accountRepository.sequelize.query(`

      SELECT
      (select code from accounts where "companyId"=${params.companyId} and "accountTypeId" in (8,22,23) and "parentId" is null) as dbcode,
      (select number from accounts where "companyId"=${params.companyId} and "accountTypeId" in (8,22,23) and "parentId" is null) as accountno,
      (select name from accounts where "companyId"=${params.companyId} and "accountTypeId" in (8,22,23) and "parentId" is null) as taxaccounts,
      (case when gld."ADRCRCode"='DR' then sum(gld.debit) else 0 end) as debit,
      (case when gld."ADRCRCode"='CR' then sum(gld.credit) else 0 end) as credit,
      (case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else sum(gld.credit)-sum(gld.debit) end) as endingbalance
      FROM
      (
      SELECT
      ac."accountTypeId",
      at."accountTypeName",
      ac.id as accountid,
      ac.code as dbcode,
      ac.number as accountno,
      ac.name as accountname,
      ac."DRCRCode" as "ADRCRCode",
      (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
      (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
      from types ty
      inner join classes cl on cl."typeId"=ty.id
      inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
      inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
      inner join "accountTypes" at on at."accountTypeID"=ac."accountTypeId"
      left outer join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
      left outer join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
      where t."companyId"=${params.companyId} and ac."accountTypeId" in (8,22,23)
      and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
      group by ac."accountTypeId",ac.id,ac.code, ac.number,ac.name,te."DRCRCode",ac."DRCRCode",at."accountTypeName") as gld
      group by gld."accountTypeId",gld."accountTypeName",gld."ADRCRCode"

    `);

    if (inputTax[0].length === 0) {
      let account = await this.accountRepository.findOne({
        where: {
          companyId: params.companyId,
          accountTypeId: 8,
          parentId: null,
        },
      });

      return [
        {
          accountno: null,
          dbcode: account.code,
          taxaccounts: account.name,
          vpbbalance: 0,
        },
      ];
    } else {
      return inputTax[0];
    }
  }

  async getInputTaxSubAccounts(params: GetTaxAccountsWithEndDateDto) {
    let inputTaxSubAccounts = await this.accountRepository.sequelize.query(`

      select
      ac.id as accountid, ac.code as dbcode, ac.number as accountno, ac.name as accountname, ac."taxId",
      (select code from "saleTax" where id=ac."taxId") as taxcode,
      (select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId") as taxrate,
      (case when ty."finDocName"='BALANCE SHEET' THEN 'BS' ELSE (CASE WHEN ty."finDocName"='INCOME STATEMENT' THEN 'IS' ELSE '' END ) END) as report,
      gld1.debit, gld1.credit, gld1.endingbalance,ac."DRCRCode" as setas 
      from types ty
      inner join classes cl on cl."typeId"=ty.id
      inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
      inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
      left outer join
      (
      select
      gld.accountid,gld.dbcode,gld.accountno,gld.accountname,
      sum(gld.debit) as debit, sum(gld.credit) as credit,
      (case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else sum(gld.credit)-sum(gld.debit) end) as endingbalance
      from (
      SELECT
      ac.id as accountid,
      ac.code as dbcode,
      ac.number as accountno,
      ac.name as accountname,
      ac."DRCRCode" as "ADRCRCode",
      (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
      (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
      from accounts ac
      inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
      inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
      where t."companyId"=${params.companyId} and ac."accountTypeId" in (8,22,23)
      and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
      group by ac.id,ac.code, ac.number,ac.name,te."DRCRCode",ac."DRCRCode") as gld
      group by gld.accountid,gld.dbcode,gld.accountno,gld.accountname,gld."ADRCRCode"
      ) as gld1 on gld1.accountid=ac.id
      where ac."companyId"=${params.companyId} and ac."accountTypeId" in (8,22,23) and ac."parentId" is not null
      ORDER BY string_to_array(ac.code, '.', '')::int[];


      `);
    return inputTaxSubAccounts[0];
  }

  async getOutputTax(params: GetTaxAccountsWithEndDateDto) {
    let outputTax = await this.accountRepository.sequelize.query(`
	  
	  SELECT
          (select code from accounts where "companyId"=${params.companyId} and "accountTypeId"=11 and "parentId" is null) as dbcode,
          (select number from accounts where "companyId"=${params.companyId} and "accountTypeId"=11 and "parentId" is null) as accountno,
          (select name from accounts where "companyId"=${params.companyId} and "accountTypeId"=11 and "parentId" is null) as taxaccounts,
	  (case when gld."ADRCRCode"='DR' then sum(gld.debit) else 0 end) as debit,
	  (case when gld."ADRCRCode"='CR' then sum(gld.credit) else 0 end) as credit,
          (case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else sum(gld.credit)-sum(gld.debit) end) as endingbalance
          FROM
          (
          SELECT
          ac."accountTypeId",
          at."accountTypeName",
          ac.id as accountid,
          ac.code as dbcode,
          ac.number as accountno,
          ac.name as accountname,
          ac."DRCRCode" as "ADRCRCode",
          (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
          (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit,
          ac."parentId"
          from types ty
          inner join classes cl on cl."typeId"=ty.id
          inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
          inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
          inner join "accountTypes" at on at."accountTypeID"=ac."accountTypeId"
          left outer join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
          left outer join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
          where t."companyId"=${params.companyId} and ac."accountTypeId"=11
          and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
          group by ac."accountTypeId",ac.id,ac.code, ac.number,ac.name,te."DRCRCode",ac."DRCRCode",at."accountTypeName",ac."parentId") as gld
          group by gld."accountTypeId",gld."accountTypeName",gld."ADRCRCode"

        `);

    if (outputTax[0].length === 0) {
      let account = await this.accountRepository.findOne({
        where: {
          companyId: params.companyId,
          accountTypeId: 11,
          parentId: null,
        },
      });

      return [
        {
          accountno: null,
          dbcode: account.code,
          taxaccounts: account.name,
          vpbbalance: 0,
        },
      ];
    } else {
      return outputTax[0];
    }
  }

  async getOutputTaxSubAccounts(params: GetTaxAccountsWithEndDateDto) {
    let outputTaxSubAccounts = await this.accountRepository.sequelize.query(`

      select
      ac.id as accountid, ac.code as dbcode, ac.number as accountno, ac.name as accountname, ac."taxId",
      (select code from "saleTax" where id=ac."taxId") as taxcode,
      (select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId") as taxrate,
      (case when ty."finDocName"='BALANCE SHEET' THEN 'BS' ELSE (CASE WHEN ty."finDocName"='INCOME STATEMENT' THEN 'IS' ELSE '' END ) END) as report,
      gld1.debit, gld1.credit, gld1.endingbalance,ac."DRCRCode" as setas 
      from types ty
      inner join classes cl on cl."typeId"=ty.id
      inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
      inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
      left outer join
      (
      select
      gld.accountid,gld.dbcode,gld.accountno,gld.accountname,
      sum(gld.debit) as debit, sum(gld.credit) as credit,
      (case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else sum(gld.credit)-sum(gld.debit) end) as endingbalance
      from (
      SELECT
      ac.id as accountid,
      ac.code as dbcode,
      ac.number as accountno,
      ac.name as accountname,
      ac."DRCRCode" as "ADRCRCode",
      (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
      (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
      from accounts ac
      inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
      inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
      where t."companyId"=${params.companyId} and ac."accountTypeId"=11
      and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
      group by ac.id,ac.code, ac.number,ac.name,te."DRCRCode",ac."DRCRCode") as gld
      group by gld.accountid,gld.dbcode,gld.accountno,gld.accountname,gld."ADRCRCode"
      ) as gld1 on gld1.accountid=ac.id
      where ac."companyId"=${params.companyId} and ac."accountTypeId"=11 and ac."parentId" is not null
      ORDER BY string_to_array(ac.code, '.', '')::int[];



      `);

    return outputTaxSubAccounts[0];
  }

  async getSalesTaxPayableBalance(params: GetTaxAccountsWithEndDateDto) {
    let getSalesTaxPayableBalance: any = await this.accountRepository.sequelize
      .query(`
                     SELECT
          (select code from accounts where "companyId"=${params.companyId} and "accountTypeId"=17 and "parentId" is null) as dbcode,
          (select number from accounts where "companyId"=${params.companyId} and "accountTypeId"=17 and "parentId" is null) as accountno,
          (select concat(name,' ','(Reported)') from accounts where "companyId"=${params.companyId} and "accountTypeId"=17 and "parentId" is null) as taxaccounts,
		  (case when gld."ADRCRCode"='DR' then sum(gld.debit) else 0 end) as debit,
          (case when gld."ADRCRCode"='CR' then sum(gld.credit) else 0 end) as credit,
          (case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else sum(gld.credit)-sum(gld.debit) end) as endingbalance
          FROM
          (
          SELECT
          ac."accountTypeId",
          at."accountTypeName",
          ac.id as accountid,
          ac.code as dbcode,
          ac.number as accountno,
          ac.name as accountname,
          ac."DRCRCode" as "ADRCRCode",
          (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
          (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit,
          ac."parentId"
          from types ty
          inner join classes cl on cl."typeId"=ty.id
          inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
          inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
          inner join "accountTypes" at on at."accountTypeID"=ac."accountTypeId"
          left outer join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
          left outer join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
          where t."companyId"=${params.companyId} and ac."accountTypeId"=17
          and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
          group by ac."accountTypeId",ac.id,ac.code, ac.number,ac.name,te."DRCRCode",ac."DRCRCode",at."accountTypeName",ac."parentId") as gld
          group by gld."accountTypeId",gld."accountTypeName",gld."ADRCRCode"

    `);

    if (getSalesTaxPayableBalance[0].length === 0) {
      let account = await this.accountRepository.findOne({
        where: {
          companyId: params.companyId,
          accountTypeId: 17,
          parentId: null,
        },
      });

      return [
        {
          accountno: null,
          dbcode: account.code,
          taxaccounts: account.name,
          vpbbalance: 0,
        },
      ];
    } else {
      return getSalesTaxPayableBalance[0];
    }
  }

  async getSalesTaxOwing(params: GetTaxAccountsWithEndDateDto) {
    let getSalesTaxOwing: any = await this.accountRepository.sequelize.query(`
                select
        '' as dbcode,
        '' as accountno,
        'Sales Tax Owing Current Period'
        as taxaccounts,
        sum((case when vpb.key=1 then vpb.endingbalance else (case when vpb.key in (2,3) then vpb.endingbalance*-1 else vpb.endingbalance end) end)) as vpbbalance
        from (
        select gld.key, gld."accountTypeID", gld."accountTypeName",gld."ADRCRCode",
        (case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else sum(gld.credit)-sum(gld.debit) end) as endingbalance
        from (
        select
        at."accountTypeID", at."accountTypeName",ac.id,ac.name,
        ac."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit,
        (case when at."accountTypeName" in ('Output Sales Tax') then 1 else (case when at."accountTypeName" in ('Input Sales Tax','Other Input Tax','Other Ded Input Tax') then 2 else (case when at."accountTypeName"='Creditable VAT Withheld' then 3 else 4 end) end) end) as key
        from accounts ac
        inner join "accountTypes" at on at."accountTypeID"=ac."accountTypeId"
        left outer join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
        left outer join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
        where ac."companyId"=${params.companyId} and at."accountTypeID" in (8,22,23,11,16)
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
        group by at."accountTypeID", at."accountTypeName",ac.id,ac.name,te."DRCRCode",ac."DRCRCode") as gld
        group by gld.key,gld."accountTypeID", gld."accountTypeName",gld."ADRCRCode") as vpb


    `);

    return getSalesTaxOwing[0];
  }

  async getTaxAccountResultClients(params: GetTaxAccountsWithEndDateDto) {
    try {
      const result = await this.accountRepository.sequelize.query(`
        SELECT
        cl.clientId, cl.TIN, cl.endingbalance, cl.Date, cl.ID, cl.EntryType, cl.Description, cl.CreatedBy,
        (case when cl.GrossAmount=0 then 0 else (case when cl."taxAssignAccountId"=30 then (cl.GrossAmount*-1) else cl.GrossAmount end) end) as GrossAmount,
        (case when cl.TaxAmount=0 then 0 else (case when cl."taxAssignAccountId"=30 then (cl.TaxAmount*-1) else cl.TaxAmount end) end) as TaxAmount,
        --cl.GrossAmount,
        --cl.TaxAmount,
        cl.taxcode,cl.viewTaxcode, cl."sourceReference", cl.clientStatus,
        cl.report, cl.reported, cl.tid as "transactionid", cl.teid--,cl."taxAssignAccountId"
        FROM
        (
        select
        te."clientId" as clientId,
        '' as TIN,
        0 as EndingBalance,
        TO_CHAR(t."transactionDate", 'DD Mon YY') AS Date,
        --to_char(t."transactionDate", 'dd Mon YYYY') as Date,
        t."transactionNo" as ID,
        t."transactionType" as EntryType,
        t."transactionDescription" as Description,
        t."createdBy" as CreatedBy,
        t.id as tid,
        --te."accountId",
        --(select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as "taxAssignAccountId",
        --(select amount from "transactionEntry" where "accountId"=cast((select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as int) and "transactionId"=t.id) as GrossAmount,
        -- (case when
        -- (select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode") is null
        -- then
        -- (te.amount/
        -- ((select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00))
        -- else
        -- (select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
        -- end)
        (select amount from "transactionEntry" where "transactionId"=t.id and "accountId"=cast(te."taxAssignAccountId" as int) and te."trTaxCode"="trAccountCode")
        as GrossAmount,
        
        te.amount as TaxAmount,
        (select code from "saleTax" where id=ac."taxId") as taxcode,
        (select "viewCode" from "saleTax" where id=ac."taxId") as viewTaxcode,
        (case when t."sourceReference" is null then 'False' else 'True' end) as "sourceReference",
        
        (case when t."isPosted"='true' then 'Added' else
        (case when t."checkedBy" is not null then 'Checked' else
        (case when t."isSendToAcc"='true' then 'Send to Accountant' else
        (case when t."recorderBy" is not null then 'Recorded' else '' end)end)end)end) as clientStatus,
        
        (case when te."VatRCheked" is null then 'False' else te."VatRCheked" end) as report,
        (case when te."VatRCleared" is null then 'False' else te."VatRCleared" end) as reported,
        
        (select "accountTypeId" from accounts where id=cast(te."taxAssignAccountId" as int )
         )
        as "taxAssignAccountId",
        
        te.id as teid
        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts ac on ac.id=te."accountId" and ac."companyId"=te."companyId"
        where t."companyId"=${params.companyId}
        and te."clientId" is not NULL
        and te."vendorId" IS NULL and te."employeeId" IS NULL and te."isAllocated"='ALLOCATED'
        and t."isPosted"='true' and t."isVoid"='false' and t."isDeleted"='false'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
        and ac."accountTypeId"=11) AS cl
        order by cl.clientId, cl.tid, cl.taxcode, cl.teid-- cl."taxAssignAccountId"`);
      return result[0];
    } catch (e) {
      throw new HttpException(`Error: ${e}`, 500);
    }
  }

  // async getTaxAccountResultClients(params: GetTaxAccountsWithEndDateDto) {
  //   try {
  //     const result = await this.accountRepository.sequelize.query(`select
  //       cl1.clientId,cl1.TIN, cl1.endingbalance, cl1.Date, cl1.ID, cl1.EntryType, cl1.Description, cl1.CreatedBy,
  //       sum(cl1.GrossAmount) as GrossAmount, sum(cl1.TaxAmount) as TaxAmount,
  //       cl1.taxcode,cl1.viewTaxcode, cl1."sourceReference", cl1.clientStatus,
  //       cl1.report, cl1.reported,
  //       cl1."transactionid"
  //       from
  //       (
  //       SELECT
  //       cl.clientId, cl.TIN, cl.endingbalance, cl.Date, cl.ID, cl.EntryType, cl.Description, cl.CreatedBy,
  //       (case when cl.GrossAmount=0 then 0 else (case when cl."taxAssignAccountId"=30 then (cl.GrossAmount*-1) else cl.GrossAmount end) end) as GrossAmount,
  //       (case when cl.TaxAmount=0 then 0 else (case when cl."taxAssignAccountId"=30 then (cl.TaxAmount*-1) else cl.TaxAmount end) end) as TaxAmount,
  //       --cl.GrossAmount,
  //       --cl.TaxAmount,
  //       cl.taxcode,cl.viewTaxcode, cl."sourceReference", cl.clientStatus,
  //       cl.report, cl.reported, cl.tid as "transactionid"--, cl.teid,cl."taxAssignAccountId"
  //       FROM
  //       (
  //       select
  //       te."clientId" as clientId,
  //       '' as TIN,
  //       0 as EndingBalance,
  //       to_char(t."transactionDate", 'mm/dd/yyyy') as Date,
  //       --to_char(t."transactionDate", 'dd Mon YYYY') as Date,
  //       t."transactionNo" as ID,
  //       t."transactionType" as EntryType,
  //       t."transactionDescription" as Description,
  //       t."createdBy" as CreatedBy,
  //       t.id as tid,
  //       --te."accountId",
  //       --(select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as "taxAssignAccountId",
  //       --(select amount from "transactionEntry" where "accountId"=cast((select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as int) and "transactionId"=t.id) as GrossAmount,

  //       (case when
  //       (select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode") is null
  //       then
  //       (te.amount/
  //       ((select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00))
  //       else
  //       (select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
  //       end) as GrossAmount,

  //       te.amount as TaxAmount,
  //       (select code from "saleTax" where id=ac."taxId") as taxcode,
  //       (select "viewCode" from "saleTax" where id=ac."taxId") as viewTaxcode,
  //       (case when t."sourceReference" is null then 'False' else 'True' end) as "sourceReference",

  //       (case when t."isPosted"='true' then 'Added' else
  //       (case when t."checkedBy" is not null then 'Checked' else
  //       (case when t."isSendToAcc"='true' then 'Send to Accountant' else
  //       (case when t."recorderBy" is not null then 'Recorded' else '' end)end)end)end) as clientStatus,

  //       (case when te."VatRCheked" is null then 'False' else te."VatRCheked" end) as report,
  //       (case when te."VatRCleared" is null then 'False' else te."VatRCleared" end) as reported,

  //       (select "accountTypeId" from accounts where id=(select "accountId" from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode"))

  //       as "taxAssignAccountId",
  //       te.id as teid
  //       FROM transaction t
  //       inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
  //       inner join accounts ac on ac.id=te."accountId" and ac."companyId"=te."companyId"
  //       where t."companyId"=${params.companyId}
  //       and te."clientId" is not NULL
  //       and te."vendorId" IS NULL and te."employeeId" IS NULL and te."isAllocated"='ALLOCATED'
  //       and t."isPosted"='true' and t."isVoid"='false' and t."isDeleted"='false'
  //       and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
  //       and ac."accountTypeId"=11) AS cl
  //       order by cl.clientId, cl.tid, cl.teid-- cl."taxAssignAccountId"
  //       ) as cl1
  //       group by cl1.clientId, cl1."transactionid",cl1.TIN, cl1.endingbalance, cl1.Date, cl1.ID, cl1.EntryType, cl1.Description, cl1.CreatedBy,
  //       cl1.taxcode,cl1.viewTaxcode, cl1."sourceReference", cl1.clientStatus, cl1.report, cl1.reported`);
  //     return result[0];
  //   } catch (e) {
  //     throw new HttpException(`Error: ${e}`, 500)
  //   }
  // }

  async getWtaxExpandedAccountsResultVendors(
    params: GetTaxAccountsWithEndDateDto,
  ) {
    try {
      const result = await this.accountRepository.sequelize.query(`
      SELECT
      vd.vendorId, vd.TIN, vd.endingbalance, vd.Date, vd.ID, vd.EntryType, vd.Description, vd.CreatedBy,
      (case when vd.GrossAmount=0 then 0 else (case when vd."taxAssignAccountId"=30 then (vd.GrossAmount*-1) else vd.GrossAmount end) end) as GrossAmount,
      (case when vd.TaxAmount=0 then 0 else (case when vd."taxAssignAccountId"=30 then (vd.TaxAmount*-1) else vd.TaxAmount end) end) as TaxAmount,

      vd.taxcode, vd.viewTaxcode, vd."sourceReference", vd.vendorStatus,
      vd.report, vd.reported, vd.tid as "transactionid", vd.taxrate, vd.teid
      FROM
      (
      select
      te."vendorId" as vendorId,
      '' as TIN,
      0 as EndingBalance,
      --to_char(t."transactionDate", 'mm/dd/yyyy') as Date,
      TO_CHAR(t."transactionDate", 'DD Mon YY') AS Date,
      t."transactionNo" as ID,
      t."transactionType" as EntryType,
      t."transactionDescription" as Description,
      t."createdBy" as CreatedBy,
      t.id as tid,
      --te."accountId",
      --(select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as "taxAssignAccountId",
      --(select amount from "transactionEntry" where "accountId"=cast((select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as int) and "transactionId"=t.id) as GrossAmount,

      (case when
      (select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode") is null
      then
      (te.amount/
      ((select tr.rate from "withHoldingTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00))
      else
      (select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
      end) as GrossAmount,

      te.amount as TaxAmount,

      (select code from "withHoldingTax" where id=ac."taxId") as taxcode,
      (select tr.rate from "withHoldingTax" wt inner join "taxRate" tr on tr."withHoldingTaxId"=wt.id where wt.id=ac."taxId") as taxrate,
      (select "viewCode" from "withHoldingTax" where id=ac."taxId") as viewTaxcode,

      (case when t."sourceReference" is null then 'False' else 'True' end) as "sourceReference",

      (case when t."isPosted"='true' then 'Added' else
      (case when t."checkedBy" is not null then 'Checked' else
      (case when t."isSendToAcc"='true' then 'Send to Accountant' else
      (case when t."recorderBy" is not null then 'Recorded' else '' end)end)end)end) as vendorStatus,

      (case when te."VatRCheked" is null then 'False' else te."VatRCheked" end) as report,
      (case when te."VatRCleared" is null then 'False' else te."VatRCleared" end) as reported,

      (select "accountTypeId" from accounts where id=
      (select "accountId" from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
      )
      as "taxAssignAccountId",
      te.id as teid


      FROM transaction t
      inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
      inner join accounts ac on ac.id=te."accountId" and ac."companyId"=te."companyId"

      where t."companyId"=${params.companyId}
      and te."vendorId" is not NULL
      and te."clientId" IS NULL and te."employeeId" IS NULL and te."isAllocated"='ALLOCATED'
      and t."isPosted"='true' and t."isVoid"='false' and t."isDeleted"='false'
      and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
      and ac."accountTypeId"=13
      ) as vd
      order by vd.vendorId, vd.tid, vd.taxcode, vd.teid`);
      return result[0];
    } catch (e) {
      throw new HttpException(`Error: ${e}`, 500);
    }
  }

  async getTaxAccountResultVendors(params: GetTaxAccountsWithEndDateDto) {
    try {
      const result = await this.accountRepository.sequelize.query(`
        SELECT
        vd.vendorId, vd.TIN, vd.endingbalance, vd.Date, vd.ID, vd.EntryType, vd.Description, vd.CreatedBy,
        (case when vd.GrossAmount=0 then 0 else (case when vd."taxAssignAccountId"=30 then (vd.GrossAmount*-1) else vd.GrossAmount end) end) as GrossAmount,
        (case when vd.TaxAmount=0 then 0 else (case when vd."taxAssignAccountId"=30 then (vd.TaxAmount*-1) else vd.TaxAmount end) end) as TaxAmount,

        vd.taxcode, vd.viewTaxcode, vd."sourceReference", vd.vendorStatus,
        vd.report, vd.reported, vd.tid as "transactionid", vd.teid
        FROM
        (
        select
        te."vendorId" as vendorId,
        '' as TIN,
        0 as EndingBalance,
        TO_CHAR(t."transactionDate", 'DD Mon YY') AS Date,
        --to_char(t."transactionDate", 'dd Mon YYYY') as Date,
        t."transactionNo" as ID,
        t."transactionType" as EntryType,
        t."transactionDescription" as Description,
        t."createdBy" as CreatedBy,
        t.id as tid,
        --te."accountId",
        --(select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as "taxAssignAccountId",
        --(select amount from "transactionEntry" where "accountId"=cast((select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as int) and "transactionId"=t.id) as GrossAmount,

        (case when
        (select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode") is null
        then
        (te.amount/
        ((select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00))
        else
        (select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
        end) as GrossAmount,

        te.amount as TaxAmount,

        (select code from "saleTax" where id=ac."taxId") as taxcode,
        (select "viewCode" from "saleTax" where id=ac."taxId") as viewTaxcode,
        (case when t."sourceReference" is null then 'False' else 'True' end) as "sourceReference",

        (case when t."isPosted"='true' then 'Added' else
        (case when t."checkedBy" is not null then 'Checked' else
        (case when t."isSendToAcc"='true' then 'Send to Accountant' else
        (case when t."recorderBy" is not null then 'Recorded' else '' end)end)end)end) as vendorStatus,
        (case when te."VatRCheked" is null then 'False' else te."VatRCheked" end) as report,
        (case when te."VatRCleared" is null then 'False' else te."VatRCleared" end) as reported,

        (select "accountTypeId" from accounts where id=
        (select "accountId" from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
        )
        as "taxAssignAccountId",
        te.id as teid

        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts ac on ac.id=te."accountId" and ac."companyId"=te."companyId"

        where t."companyId"=${params.companyId}
        and te."vendorId" is not NULL
        and te."clientId" IS NULL and te."employeeId" IS NULL and te."isAllocated"='ALLOCATED'
        and t."isPosted"='true' and t."isVoid"='false' and t."isDeleted"='false'
        and ac."taxId" not in (select id from "saleTax" where code='IGOCG')
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
        and ac."accountTypeId" in (8,22,23)) as vd
        order by vd.vendorId, vd.tid, vd.taxcode, vd.teid`);
      return result[0];
    } catch (e) {
      throw new HttpException(`Error: ${e}`, 500);
    }
  }

  async getCreditableVATSummary(params: GetTaxAccountsWithEndDateDto) {
    try {
      const result = await this.accountRepository.sequelize.query(`
        SELECT
    cl.clientId, cl.TIN, cl.endingbalance, cl.Date, cl.ID, cl.EntryType, cl.Description, cl.CreatedBy,
    cl.GrossAmount, cl.TaxAmount, cl.taxcode, cl.viewTaxcode, cl."sourceReference", cl.clientStatus,
    cl.report, cl.reported, cl.tid AS "transactionid", cl.teid
FROM
(
    SELECT
        te."clientId" AS clientId,
        '' AS TIN,
        0 AS EndingBalance,
        TO_CHAR(t."transactionDate", 'DD Mon YY') AS Date,
        t."transactionNo" AS ID,
        t."transactionType" AS EntryType,
        t."transactionDescription" AS Description,
        t."createdBy" AS CreatedBy,
        t.id AS tid,
        te.id as teid,

        (CASE
            WHEN (SELECT amount FROM "transactionEntry" WHERE "transactionId" = t.id AND "trAccountCode" = te."trTaxCode") IS NULL
            THEN
                -- Добавляем проверку на ноль, чтобы избежать деления
                (CASE
                    WHEN (SELECT tr.rate FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId" = st.id WHERE st.id = ac."taxId") = 0
                    THEN 0
                    ELSE te.amount / ((SELECT tr.rate FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId" = st.id WHERE st.id = ac."taxId") / 100.00)
                END)
            ELSE
                (SELECT amount FROM "transactionEntry" WHERE "transactionId" = t.id AND "trAccountCode" = te."trTaxCode")
        END) AS GrossAmount,

        te.amount AS TaxAmount,
        (SELECT code FROM "saleTax" WHERE id = ac."taxId") AS taxcode,
        (SELECT "viewCode" FROM "saleTax" WHERE id = ac."taxId") AS viewTaxcode,
        (CASE WHEN t."sourceReference" IS NULL THEN 'False' ELSE 'True' END) AS "sourceReference",

        (CASE
            WHEN t."isPosted" = 'true' THEN 'Added'
            WHEN t."checkedBy" IS NOT NULL THEN 'Checked'
            WHEN t."isSendToAcc" = 'true' THEN 'Send to Accountant'
            WHEN t."recorderBy" IS NOT NULL THEN 'Recorded'
            ELSE ''
        END) AS clientStatus,

        (CASE WHEN te."VatRCheked" IS NULL THEN 'False' ELSE te."VatRCheked" END) AS report,
        (CASE WHEN te."VatRCleared" IS NULL THEN 'False' ELSE te."VatRCleared" END) AS reported
    FROM transaction t
    INNER JOIN "transactionEntry" te ON te."transactionId" = t.id AND te."companyId" = t."companyId"
    INNER JOIN accounts ac ON ac.id = te."accountId" AND ac."companyId" = te."companyId"
    WHERE t."companyId" = ${params.companyId}
      AND te."clientId" IS NOT NULL
      AND te."vendorId" IS NULL
      AND te."employeeId" IS NULL
      AND te."isAllocated" = 'ALLOCATED'
      AND t."isPosted" = 'true'
      AND t."isVoid" = 'false'
      AND t."isDeleted" = 'false'
      AND CAST(TO_CHAR(t."transactionDate", 'mm/dd/yyyy') AS date) <= CAST('${params.endDate}' AS date)
      AND ac."accountTypeId" = 16
) AS cl
ORDER BY cl.clientId, cl.tid, cl.taxcode, cl.teid`);
      return result[0];
    } catch (e) {
      throw new HttpException(`Error: ${e}`, 500);
    }
  }

  // async getCreditableVATSummary(params: GetTaxAccountsWithEndDateDto) {
  //   try {
  //     const result = await this.accountRepository.sequelize.query(`SELECT
  //       cl.clientId, cl.TIN, cl.endingbalance, cl.Date, cl.ID, cl.EntryType, cl.Description, cl.CreatedBy,
  //       cl.GrossAmount,cl.TaxAmount, cl.taxcode, cl.viewTaxcode, cl."sourceReference", cl.clientStatus,
  //       cl.report, cl.reported, cl.tid as "transactionid"
  //       FROM
  //       (
  //       select
  //       te."clientId" as clientId,
  //       '' as TIN,
  //       0 as EndingBalance,
  //       to_char(t."transactionDate", 'mm/dd/yyyy') as Date,
  //       --to_char(t."transactionDate", 'dd Mon YYYY') as Date,
  //       t."transactionNo" as ID,
  //       t."transactionType" as EntryType,
  //       t."transactionDescription" as Description,
  //       t."createdBy" as CreatedBy,
  //       t.id as tid,
  //       --te."accountId",
  //       --(select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as "taxAssignAccountId",
  //       --(select amount from "transactionEntry" where "accountId"=cast((select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as int) and "transactionId"=t.id) as GrossAmount,

  //       (case when
  //       (select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode") is null
  //       then
  //       (te.amount/((select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00)
  //       )
  //       else
  //       (select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
  //       end) as GrossAmount,

  //       te.amount as TaxAmount,
  //       (select code from "saleTax" where id=ac."taxId") as taxcode,
  //       (select "viewCode" from "saleTax" where id=ac."taxId") as viewTaxcode,
  //       (case when t."sourceReference" is null then 'False' else 'True' end) as "sourceReference",

  //       (case when t."isPosted"='true' then 'Added' else
  //       (case when t."checkedBy" is not null then 'Checked' else
  //       (case when t."isSendToAcc"='true' then 'Send to Accountant' else
  //       (case when t."recorderBy" is not null then 'Recorded' else '' end)end)end)end) as clientStatus,

  //       (case when te."VatRCheked" is null then 'False' else te."VatRCheked" end) as report,
  //       (case when te."VatRCleared" is null then 'False' else te."VatRCleared" end) as reported
  //       FROM transaction t
  //       inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
  //       inner join accounts ac on ac.id=te."accountId" and ac."companyId"=te."companyId"
  //       where t."companyId"=${params.companyId}
  //       and te."clientId" is not NULL
  //       and te."vendorId" IS NULL and te."employeeId" IS NULL and te."isAllocated"='ALLOCATED'
  //       and t."isPosted"='true' and t."isVoid"='false' and t."isDeleted"='false'
  //       and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
  //       and ac."accountTypeId"=16) AS cl
  //       order by cl.clientId, cl.tid`);
  //     return result[0];
  //   } catch (e) {
  //     throw new HttpException(`Error: ${e}`, 500)
  //   }
  // }

  async getSummaryListOfSales(params) {
    let option;
    if (params.startDate === 'null' || params.startDate === null) {
      option = `and t."isPosted"='true' and t."isVoid"='false' and t."isDeleted"='false'`;
    } else {
      option = `and t."isPosted"='true' and t."isVoid"='false' and t."isDeleted"='false'
          and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${params.startDate}' as date)--startdate
          and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)--enddate`;
    }
    try {
      const result = await this.accountRepository.sequelize.query(`select 
          te."clientId" as clientId,
          to_char(t."transactionDate", 'mm/dd/yyyy') as taxableMonth,--Taxable Month
          '' as TIN,--Tax Identification Number
          '' as registeredName,--client registered name
          '' as customerName,--name of the customer (Last Name, First Name, Middle Name)
          '' as customerAddress, --customer's address
          te.amount+(te.amount/
          case when ((select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00)=0 then 1 else
          ((select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00) end
          ) as GrossAmount,--Amount of Gross Sales
          0 as exemptSales,--Amount of Exempt Sales
          0 as zeroRatedSales,--Amount of Zero Rated Sales
          0 as taxableSales,--Amount of Taxable Sales
          te.amount as OutputAmount,--Amount of Output Tax
          (te.amount+(te.amount/
          case when ((select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00)=0 then 1 else
          ((select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00) end
          ))+te.amount as grossTaxableSales,--Amount of Gross Taxable Sales
          (case when te."VatRCleared" is null then 'False' else te."VatRCleared" end) as reported
          FROM transaction t
          inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
          inner join accounts ac on ac.id=te."accountId" and ac."companyId"=te."companyId"
          where t."companyId"=${params.companyId}
          and te."clientId" is not NULL
          and te."vendorId" IS NULL and te."employeeId" IS NULL and te."isAllocated"='ALLOCATED'
          and t."isPosted"='true' and t."isVoid"='false' and t."isDeleted"='false'
          ${option}
          and ac."accountTypeId"=11 and  te."VatRCheked"='False'`);
      return result[0];
    } catch (e) {
      throw new HttpException(`Error: ${e}`, 500);
    }
  }

  async getTaxAccountResult(params: GetTaxAccountsWithEndDateDto) {
    try {
      let creditableVatWithheldSubAccounts =
        await this.getCreditableVatWithheldSubAccounts(params);
      let creditableVatWithheld = await this.getCreditableVatWithheld(params);
      let inputTax = await this.getInputTax(params);
      let inputTaxSubAccounts = await this.getInputTaxSubAccounts(params);
      let outputTax = await this.getOutputTax(params);
      let outputTaxSubAccounts = await this.getOutputTaxSubAccounts(params);
      let getSalesTaxPayableBalance = await this.getSalesTaxPayableBalance(
        params,
      );
      let getSalesTaxOwing = await this.getSalesTaxOwing(params);

      return {
        creditableVatWithheldSubAccounts,
        creditableVatWithheld,
        inputTax,
        inputTaxSubAccounts,
        outputTax,
        outputTaxSubAccounts,
        getSalesTaxPayableBalance,
        getSalesTaxOwing,
      };
    } catch (e) {
      throw new HttpException(`Error: ${e}`, 500);
    }
  }

  async getTaxAccountResultWh(params: GetTaxAccountsWithEndDateDto) {
    try {
      let withHoldingTaxExpandedEndingBalances =
        await this.getWithHoldingTaxExpandedEndingBalances(params);
      let withHoldingTaxExpandedSubAccountsEndingBalances =
        await this.getWithHoldingTaxExpandedSubAccountsEndingBalances(params);

      return {
        withHoldingTaxExpandedEndingBalances,
        withHoldingTaxExpandedSubAccountsEndingBalances,
      };
    } catch (e) {
      throw new HttpException(`Error: ${e}`, 500);
    }
  }

  async getCreditableWithHoldingTaxEndingBalances(
    params: GetTaxAccountsWithEndDateDto,
  ) {
    let getCreditableWithHoldingTaxEndingBalances = await this.accountRepository
      .sequelize.query(`SELECT
        (select code from accounts where "companyId"=${params.companyId} and "accountTypeId"=12 and "parentId" is null) as dbcode,
        (select number from accounts where "companyId"=${params.companyId} and "accountTypeId"=12 and "parentId" is null) as accountno,
        (select name from accounts where "companyId"=${params.companyId} and "accountTypeId"=12 and "parentId" is null) as taxaccounts,
        (case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else sum(gld.credit)-sum(gld.debit) end) as endingbalance
        FROM
        (
        SELECT
        ac."accountTypeId",
        at."accountTypeName",
        ac.id as accountid,
        ac.code as dbcode,
        ac.number as accountno,
        ac.name as accountname,
        ac."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        from types ty
        inner join classes cl on cl."typeId"=ty.id
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
        inner join "accountTypes" at on at."accountTypeID"=ac."accountTypeId"
        left outer join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
        left outer join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
        where t."companyId"=${params.companyId} and ac."accountTypeId"=12 and ac."parentId" is not null
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
        group by ac."accountTypeId",ac.id,ac.code, ac.number,ac.name,te."DRCRCode",ac."DRCRCode",at."accountTypeName") as gld
        group by gld."accountTypeId",gld."accountTypeName",gld."ADRCRCode"`);

    if (getCreditableWithHoldingTaxEndingBalances[0].length === 0) {
      let account = await this.accountRepository.findOne({
        where: {
          companyId: params.companyId,
          accountTypeId: 12,
          parentId: null,
        },
      });

      return [
        {
          accountno: null,
          dbcode: account.code,
          taxaccounts: account.name,
          vpbbalance: 0,
        },
      ];
    } else {
      return getCreditableWithHoldingTaxEndingBalances[0];
    }
  }

  async getCreditableWithHoldingTaxSubAccountsEndingBalances(
    params: GetTaxAccountsWithEndDateDto,
  ) {
    let getCreditableWithHoldingTaxSubAccountsEndingBalances = await this
      .accountRepository.sequelize.query(`

        select
        ac.id as accountid, ac.code as dbcode, ac.number as accountno, ac.name as accountname, ac."taxId",
	(select code from "withHoldingTax" where id=ac."taxId") as taxcode,
	(select tr.rate from "withHoldingTax" wt inner join "taxRate" tr on tr."withHoldingTaxId"=wt.id where wt.id=ac."taxId") as taxrate,
        (case when ty."finDocName"='BALANCE SHEET' THEN 'BS' ELSE (CASE WHEN ty."finDocName"='INCOME STATEMENT' THEN 'IS' ELSE '' END ) END) as report,
        gld1.debit, gld1.credit, gld1.endingbalance,ac."DRCRCode" as setas 
        from types ty
        inner join classes cl on cl."typeId"=ty.id
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
        left outer join
        (
        select
        gld.accountid,gld.dbcode,gld.accountno,gld.accountname,
        sum(gld.debit) as debit, sum(gld.credit) as credit,
        (case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else sum(gld.credit)-sum(gld.debit) end) as endingbalance
        from (
        SELECT
        ac.id as accountid,
        ac.code as dbcode,
        ac.number as accountno,
        ac.name as accountname,
        ac."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        from accounts ac
        inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
        inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
        where t."companyId"=${params.companyId} and ac."accountTypeId"=12
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
        group by ac.id,ac.code, ac.number,ac.name,te."DRCRCode",ac."DRCRCode") as gld
        group by gld.accountid,gld.dbcode,gld.accountno,gld.accountname,gld."ADRCRCode"
        ) as gld1 on gld1.accountid=ac.id
        where ac."companyId"=${params.companyId} and ac."accountTypeId"=12 and ac."parentId" is not null
        --order by ac.code
	ORDER BY CAST(SUBSTRING(ac.code FROM '• (\d+)') AS INTEGER)

`);

    return getCreditableWithHoldingTaxSubAccountsEndingBalances[0];
  }

  async getWithHoldingTaxEndingBalances(params: GetTaxAccountsWithEndDateDto) {
    let getWithHoldingTaxEndingBalances = await this.accountRepository.sequelize
      .query(`SELECT
        (select code from accounts where "companyId"=${params.companyId} and "accountTypeId"=13 and "parentId" is null) as dbcode,
        (select number from accounts where "companyId"=${params.companyId} and "accountTypeId"=13 and "parentId" is null) as accountno,
        (select name from accounts where "companyId"=${params.companyId} and "accountTypeId"=13 and "parentId" is null) as taxaccounts,
        (case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else sum(gld.credit)-sum(gld.debit) end) as endingbalance
        FROM
        (
        SELECT
        ac."accountTypeId",
        at."accountTypeName",
        ac.id as accountid,
        ac.code as dbcode,
        ac.number as accountno,
        ac.name as accountname,
        ac."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        from types ty
        inner join classes cl on cl."typeId"=ty.id
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
        inner join "accountTypes" at on at."accountTypeID"=ac."accountTypeId"
        left outer join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
        left outer join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
        where t."companyId"=${params.companyId} and ac."accountTypeId"=13 and ac."parentId" is not null
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
        group by ac."accountTypeId",ac.id,ac.code, ac.number,ac.name,te."DRCRCode",ac."DRCRCode",at."accountTypeName") as gld
        group by gld."accountTypeId",gld."accountTypeName",gld."ADRCRCode"`);

    if (getWithHoldingTaxEndingBalances[0].length === 0) {
      let account = await this.accountRepository.findOne({
        where: {
          companyId: params.companyId,
          accountTypeId: 13,
          parentId: null,
        },
      });

      return [
        {
          accountno: null,
          dbcode: account.code,
          taxaccounts: account.name,
          vpbbalance: 0,
        },
      ];
    } else {
      return getWithHoldingTaxEndingBalances[0];
    }
  }

  async getWithholdingTaxSubAccountsEndingBalances(
    params: GetTaxAccountsWithEndDateDto,
  ) {
    let getWithholdingTaxSubAccountsEndingBalances = await this
      .accountRepository.sequelize.query(`

        select
        ac.id as accountid, ac.code as dbcode, ac.number as accountno, ac.name as accountname, ac."taxId",
	(select code from "withHoldingTax" where id=ac."taxId") as taxcode,
	(select tr.rate from "withHoldingTax" wt inner join "taxRate" tr on tr."withHoldingTaxId"=wt.id where wt.id=ac."taxId") as taxrate,
        (case when ty."finDocName"='BALANCE SHEET' THEN 'BS' ELSE (CASE WHEN ty."finDocName"='INCOME STATEMENT' THEN 'IS' ELSE '' END ) END) as report,
        gld1.debit, gld1.credit, gld1.endingbalance,ac."DRCRCode" as setas 
        from types ty
        inner join classes cl on cl."typeId"=ty.id
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
        left outer join
        (
        select
        gld.accountid,gld.dbcode,gld.accountno,gld.accountname,
        sum(gld.debit) as debit, sum(gld.credit) as credit,
        (case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else sum(gld.credit)-sum(gld.debit) end) as endingbalance
        from (
        SELECT
        ac.id as accountid,
        ac.code as dbcode,
        ac.number as accountno,
        ac.name as accountname,
        ac."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        from accounts ac
        inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
        inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
        where t."companyId"=${params.companyId} and ac."accountTypeId"=13
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
        group by ac.id,ac.code, ac.number,ac.name,te."DRCRCode",ac."DRCRCode") as gld
        group by gld.accountid,gld.dbcode,gld.accountno,gld.accountname,gld."ADRCRCode"
        ) as gld1 on gld1.accountid=ac.id
        where ac."companyId"=${params.companyId} and ac."accountTypeId"=13 and ac."parentId" is not null
        --order by ac.code
	ORDER BY CAST(SUBSTRING(ac.code FROM '• (\d+)') AS INTEGER)

`);

    return getWithholdingTaxSubAccountsEndingBalances[0];
  }

  async getWithholdingTaxOnCompensationEndingBalances(
    params: GetTaxAccountsWithEndDateDto,
  ) {
    let getWithholdingTaxOnCompensationEndingBalances = await this
      .accountRepository.sequelize.query(`SELECT
        (select code from accounts where "companyId"=${params.companyId} and "accountTypeId"=19 and "parentId" is null) as dbcode,
        (select number from accounts where "companyId"=${params.companyId} and "accountTypeId"=19 and "parentId" is null) as accountno,
        (select name from accounts where "companyId"=${params.companyId} and "accountTypeId"=19 and "parentId" is null) as taxaccounts,
        (case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else sum(gld.credit)-sum(gld.debit) end) as endingbalance
        FROM
        (
        SELECT
        ac."accountTypeId",
        at."accountTypeName",
        ac.id as accountid,
        ac.code as dbcode,
        ac.number as accountno,
        ac.name as accountname,
        ac."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        from types ty
        inner join classes cl on cl."typeId"=ty.id
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
        inner join "accountTypes" at on at."accountTypeID"=ac."accountTypeId"
        left outer join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
        left outer join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
        where t."companyId"=${params.companyId} and ac."accountTypeId"=19 and ac."parentId" is not null
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <=cast('${params.endDate}' as date)
        group by ac."accountTypeId",ac.id,ac.code, ac.number,ac.name,te."DRCRCode",ac."DRCRCode",at."accountTypeName") as gld
        group by gld."accountTypeId",gld."accountTypeName",gld."ADRCRCode"`);

    if (getWithholdingTaxOnCompensationEndingBalances[0].length === 0) {
      let account = await this.accountRepository.findOne({
        where: {
          companyId: params.companyId,
          accountTypeId: 19,
          parentId: null,
        },
      });

      return [
        {
          accountno: null,
          dbcode: account.code,
          taxaccounts: account.name,
          vpbbalance: 0,
        },
      ];
    } else {
      return getWithholdingTaxOnCompensationEndingBalances[0];
    }
  }

  async getWithholdingTaxOnCompensationSubAccountsEndingBalances(
    params: GetTaxAccountsWithEndDateDto,
  ) {
    let getWithholdingTaxOnCompensationSubAccountsEndingBalances = await this
      .accountRepository.sequelize.query(`

        select
        ac.id as accountid, ac.code as dbcode, ac.number as accountno, ac.name as accountname, ac."taxId",
	(select code from "withHoldingTax" where id=ac."taxId") as taxcode,
	(select tr.rate from "withHoldingTax" wt inner join "taxRate" tr on tr."withHoldingTaxId"=wt.id where wt.id=ac."taxId") as taxrate,
        (case when ty."finDocName"='BALANCE SHEET' THEN 'BS' ELSE (CASE WHEN ty."finDocName"='INCOME STATEMENT' THEN 'IS' ELSE '' END ) END) as report,
        gld1.debit, gld1.credit, gld1.endingbalance,ac."DRCRCode" as setas 
        from types ty
        inner join classes cl on cl."typeId"=ty.id
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
        left outer join
        (
        select
        gld.accountid,gld.dbcode,gld.accountno,gld.accountname,
        sum(gld.debit) as debit, sum(gld.credit) as credit,
        (case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else sum(gld.credit)-sum(gld.debit) end) as endingbalance
        from (
        SELECT
        ac.id as accountid,
        ac.code as dbcode,
        ac.number as accountno,
        ac.name as accountname,
        ac."DRCRCode" as "ADRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        from accounts ac
        inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
        inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
        where t."companyId"=${params.companyId} and ac."accountTypeId"=19
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
        group by ac.id,ac.code, ac.number,ac.name,te."DRCRCode",ac."DRCRCode") as gld
        group by gld.accountid,gld.dbcode,gld.accountno,gld.accountname,gld."ADRCRCode"
        ) as gld1 on gld1.accountid=ac.id
        where ac."companyId"=${params.companyId} and ac."accountTypeId"=19 and ac."parentId" is not null
        --order by ac.code
	ORDER BY CAST(SUBSTRING(ac.code FROM '• (\d+)') AS INTEGER)
`);

    return getWithholdingTaxOnCompensationSubAccountsEndingBalances[0];
  }

  async getWithHoldingTaxAccountResult(params: GetTaxAccountsWithEndDateDto) {
    try {
      let сreditableWithHoldingTax =
        await this.getCreditableWithHoldingTaxEndingBalances(params);
      let сreditableWithHoldingTaxSub =
        await this.getCreditableWithHoldingTaxSubAccountsEndingBalances(params);
      let withholdingTaxExpanded = await this.getWithHoldingTaxEndingBalances(
        params,
      );
      let withholdingTaxExpandedSub =
        await this.getWithholdingTaxSubAccountsEndingBalances(params);
      let withholdingTaxOnCompensation =
        await this.getWithholdingTaxOnCompensationEndingBalances(params);
      let withholdingTaxOnCompensationSub =
        await this.getWithholdingTaxOnCompensationSubAccountsEndingBalances(
          params,
        );

      return {
        сreditableWithHoldingTax,
        сreditableWithHoldingTaxSub,
        withholdingTaxExpanded,
        withholdingTaxExpandedSub,
        withholdingTaxOnCompensation,
        withholdingTaxOnCompensationSub,
      };
    } catch (e) {
      throw new HttpException(`Error: ${e}`, 500);
    }
  }

  async getAccountByCompanyIdAndAccountTypeId(data: {
    companyId: number;
    accountTypeId: Array<number>;
  }) {
    return this.accountRepository.findOne({
      where: {
        ...data,
        taxId: null,
        taxTypeId: null,
      },
    });
  }

  async getAllCompanyAccountsByTaxId(
    companyId: number,
    taxId: Array<number>,
    taxTypeId: number,
  ) {
    return this.accountRepository.findAll({
      where: {
        companyId,
        taxId,
        taxTypeId,
      },
    });
  }

  async getCompanyAccountByTaxIdAndTaxTypeId(
    companyId: number,
    taxId: number,
    taxTypeId: number,
  ) {
    return this.accountRepository.findOne({
      where: {
        companyId,
        taxId,
        taxTypeId,
      },
    });
  }

  async create(data, transaction = null) {
    if (transaction === null) {
      return await this.accountRepository.create(data);
    } else {
      return await this.accountRepository.create(data, { transaction });
    }
  }

  async getChildAccountsCount(parentAccountId: number) {
    return await this.accountRepository.count({
      where: {
        parentId: parentAccountId,
      },
    });
  }

  async changeAccountStatusByCode(data: {
    companyId: number;
    activateList: Array<string>;
    deactivateList: Array<string>;
  }) {
    if (data.activateList.length > 0) {
      await this.accountRepository.update(
        { active: true },
        {
          where: {
            companyId: data.companyId,
            [Op.or]: data.activateList.map((code) => ({
              code: { [Op.like]: `${code}%` },
            })),
          },
        },
      );
    }

    if (data.deactivateList.length > 0) {
      await this.accountRepository.update(
        {
          active: false,
        },
        {
          where: {
            companyId: data.companyId,
            [Op.or]: data.deactivateList.map((code) => ({
              code: { [Op.like]: `${code}%` },
            })),
          },
        },
      );
    }
  }

  async getAccountByCode(code: string | Array<string>) {
    return await this.accountRepository.findAll({
      where: {
        code,
      },
    });
  }

  async getAccountByDefaultId(defaultId: number, companyId: number) {
    return await this.accountRepository.findOne({
      where: {
        defaultId,
        companyId,
      },
    });
  }

  async getNoTaxAccount(companyId: number, countryId: number, typeId: number) {
    let query = await this.accountRepository.sequelize
      .query(`SELECT id, code, name
      FROM "public"."accounts"
      WHERE "companyId" = ${companyId}
        AND "taxId" = (
          SELECT "id"
          FROM "public"."saleTax"
          WHERE "countryId" = ${countryId}
            AND "typeId" = ${typeId}
            AND "taxTypeId" = '5'
          LIMIT 1 OFFSET 0
        )
        AND "taxTypeId" = '1'
      LIMIT 1;`);

    return query[0];
  }

  async getAccountByParentId(parentId: number | Array<number>) {
    return await this.accountRepository.findAll({
      where: {
        parentId,
      },
    });
  }

  async getChildAccountByParentAccountCode(
    companyId: number,
    code: string | Array<string>,
  ) {
    let parentAccount = await this.accountRepository.findAll({
      where: {
        code,
        companyId,
      },
      attributes: ['id'],
    });

    let parentAccountId: any = parentAccount.map((item) => {
      return item.id;
    });

    if (parentAccountId.length > 0) {
      return await this.accountRepository.findAll({
        where: {
          parentId: parentAccountId,
        },
      });
    } else {
      return [];
    }
  }

  async findById(id: number | Array<number>) {
    let res = await this.accountRepository.findAll({
      where: {
        id,
        close: false,
      },
    });

    return res.length > 0 ? res : [];
  }

  async getCompanyAccountsByAccountTypeId(data: {
    companyId: number;
    accountTypeId: number | Array<number>;
  }) {
    return await this.accountRepository.findAll({
      where: {
        companyId: data.companyId,
        accountTypeId: data.accountTypeId,
        taxId: {
          [Op.not]: null,
        },
      },
      attributes: [
        'id',
        'companyId',
        'code',
        'name',
        'accountTypeId',
        'taxId',
        'taxTypeId',
      ],
    });
  }

  async getWithholdingTaxExpandedAccountsResultVendors(
    params: GetTaxAccountsWithEndDateDto,
  ) {
    const result = await this.accountRepository.sequelize.query(`
      select
      vd1.vendorId as "vendorId",
      vd1.TIN,
      vd1."transactionid" as "transactionId",
      vd1.endingbalance as "endingBalance",
      vd1.Date,
      vd1.ID,
      vd1.EntryType as "entryType",
      vd1.Description,
      vd1.CreatedBy as "createdBy",
      sum(vd1.GrossAmount) as "grossAmount",
      vd1.taxrate as "taxRate",
      sum(vd1.TaxAmount) as "taxAmount",
      vd1.taxcode as "taxCode",
      vd1.viewTaxcode as "viewTaxCode",
      vd1."sourceReference",
      vd1.vendorStatus as "vendorStatus",
      vd1.report,
      vd1.reported
      from
      (
      SELECT
      vd.vendorId, vd.TIN, vd.endingbalance, vd.Date, vd.ID, vd.EntryType, vd.Description, vd.CreatedBy,
      (case when vd.GrossAmount=0 then 0 else (case when vd."taxAssignAccountId"=30 then (vd.GrossAmount*-1) else vd.GrossAmount end) end) as GrossAmount,
      (case when vd.TaxAmount=0 then 0 else (case when vd."taxAssignAccountId"=30 then (vd.TaxAmount*-1) else vd.TaxAmount end) end) as TaxAmount,
      
      vd.taxcode, vd.viewTaxcode, vd."sourceReference", vd.vendorStatus,
      vd.report, vd.reported, vd.tid as "transactionid", vd.taxrate
      FROM
      (
      select
      te."vendorId" as vendorId,
      '' as TIN,
      0 as EndingBalance,
      to_char(t."transactionDate", 'mm/dd/yyyy') as Date,
      --to_char(t."transactionDate", 'dd Mon YYYY') as Date,
      t."transactionNo" as ID,
      t."transactionType" as EntryType,
      t."transactionDescription" as Description,
      t."createdBy" as CreatedBy,
      t.id as tid,
      --te."accountId",
      --(select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as "taxAssignAccountId",
      --(select amount from "transactionEntry" where "accountId"=cast((select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as int) and "transactionId"=t.id) as GrossAmount,
      
      (case when
      (select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode") is null
      then
      (te.amount/
      ((select tr.rate from "withHoldingTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00))
      else
      (select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
      end) as GrossAmount,
      
      te.amount as TaxAmount,
      
      (select code from "withHoldingTax" where id=ac."taxId") as taxcode,
      (select tr.rate from "withHoldingTax" wt inner join "taxRate" tr on tr."withHoldingTaxId"=wt.id where wt.id=ac."taxId") as taxrate,
      (select "viewCode" from "withHoldingTax" where id=ac."taxId") as viewTaxcode,
      
      (case when t."sourceReference" is null then 'False' else 'True' end) as "sourceReference",
      
      (case when t."isPosted"='true' then 'Added' else 
      (case when t."checkedBy" is not null then 'Checked' else
      (case when t."isSendToAcc"='true' then 'Send to Accountant' else
      (case when t."recorderBy" is not null then 'Recorded' else '' end)end)end)end) as vendorStatus,\t
      
      (case when te."VatRCheked" is null then 'False' else te."VatRCheked" end) as report,
      (case when te."VatRCleared" is null then 'False' else te."VatRCleared" end) as reported,
      
      (select "accountTypeId" from accounts where id=
      (select "accountId" from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
      )
      as "taxAssignAccountId",
      te.id as teid
      
      
      FROM transaction t
      inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
      inner join accounts ac on ac.id=te."accountId" and ac."companyId"=te."companyId"
      
      where t."companyId"=${params.companyId}
      and te."vendorId" is not NULL
      and te."clientId" IS NULL and te."employeeId" IS NULL and te."isAllocated"='ALLOCATED'
      and t."isPosted"='true' and t."isVoid"='false' and t."isDeleted"='false'
      and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
      and ac."accountTypeId"=13
      ) as vd
      order by vd.vendorId, vd.tid, vd.teid
      ) as vd1
      group by vd1.vendorId, vd1."transactionid",vd1.TIN, vd1.endingbalance, vd1.Date, vd1.ID, vd1.EntryType, vd1.Description, vd1.CreatedBy,
      vd1.taxrate,vd1.taxcode,vd1.viewTaxcode, vd1."sourceReference", vd1.vendorStatus, vd1.report, vd1.reported`);
  }

  async getAccountsCodeLike(companyId: number, code: string) {
    let query = [];
    console.log(code.endsWith('.'));
    if (!code.endsWith('.')) {
      if ((code.match(/\./g) || []).length === 2)
        query = await this.accountRepository.sequelize.query(`SELECT *
          FROM groups
          WHERE code = '${code}'
          and "companyId"=${companyId}`);
      else
        query = await this.accountRepository.sequelize.query(`SELECT *
          FROM accounts
          WHERE code = '${code}'
          and "companyId"=${companyId}`);
    } else {
      const regexPattern = `^${code.replace(/\./g, '\\.')}\\d+$`;
      query = await this.accountRepository.sequelize.query(`SELECT *
        FROM accounts
        WHERE code ~ '${regexPattern}'
        and "companyId"=${companyId}`);
    }
    return query[0];
  }

  async generateNameAccount(
    cashAccountTypeId: number,
    companyId: number,
  ): Promise<string> {
    const prefixMap: Record<number, string> = {
      1: 'BNK',
      2: 'RVF',
      3: 'PCF',
      4: 'CAE',
    };

    const type = prefixMap[cashAccountTypeId];
    const lastAccount = await this.accountRepository.findOne({
      where: {
        companyId,
      },
      include: [
        {
          model: UserAccount,
          where: {
            cashAccountTypeId,
          },
        },
      ],
      order: [['id', 'DESC']],
    }); // метод, схожий на getLastTransaction

    if (!lastAccount) return `${type} - 00001`;

    // Витягуємо число з останнього номера
    const lastNumber = parseInt(lastAccount.name.split(' - ')[1]);
    const newNumber = (lastNumber + 1).toString().padStart(5, '0');

    return `${type} - ${newNumber}`;
  }

  async createForCash(dto: CreateAccountDto) {
    // const checkIsName = await this.accountRepository.findOne({
    //   where: {
    //     companyId: dto.companyId,
    //     name: dto.name,
    //   },
    // });
    // if (checkIsName) throw new HttpException('This name is used', 400);
    const noTax: any = await this.getNoTaxAccount(
      dto.companyId,
      dto.countryId,
      2,
    );
    if (!dto.isBankAccount)
      dto.name = await this.generateNameAccount(
        dto.cashAccountTypeId,
        dto.companyId,
      );
    let show = false;
    if (dto.isBankAccount)
      show = true;
    const newAccount = await this.createAccount({ ...dto, show });
    if (newAccount.id === dto.parentId)
      throw new HttpException('This parent account has transaction, please use other!', 400);
    const userAccount = await this.userAccountRepository.create({
      userId: dto.userId,
      companyId: dto.companyId,
      cashAccountTypeId: dto.cashAccountTypeId,
      accountId: newAccount.id,
    });
    if (noTax.length > 0)
      await this.assignAccountToTaxAccount(newAccount.id, noTax[0].id);
    return userAccount;
  }

  async createForCashMain(dto: CreateAccountDto) {
    const checkIsName = await this.accountRepository.findOne({
      where: {
        companyId: dto.companyId,
        name: dto.name,
      },
    });
    if (checkIsName) throw new HttpException('This name is used', 400);
    const noTax: any = await this.getNoTaxAccount(
      dto.companyId,
      dto.countryId,
      2,
    );
    const newAccount = await this.createAccount({ ...dto, show: true });
    if (noTax.length > 0)
      await this.assignAccountToTaxAccount(newAccount.id, noTax[0].id);
    return newAccount;
  }

  async listCashAccountByUserId(userId, companyId, typeId) {
    const userAccountList = await this.accountRepository.findAll({
      include: [
        {
          model: UserAccount,
          where: {
            ...(Number(userId) !== 0 && {
              userId,
            }),
            companyId,
            cashAccountTypeId: typeId,
          },
        },
        {
          model: Account,
          as: 'parentAccount',
          attributes: [['name', 'parentName']],
        },
      ],
      attributes: ['id', 'name', ['active', 'status'], 'accountCurrencyId'],
    });
    return userAccountList;
  }
  async listCashAccountTotal(userId, companyId, typeId) {
    const userAccountList = await this.accountRepository.findAll({
      include: [
        {
          model: UserAccount,
          where: {
            ...(Number(userId) !== 0 && {
              userId,
            }),
            companyId,
            cashAccountTypeId: typeId,
          },
          attributes: ['id', 'userId'],
          include: [
            {
              model: ExpendituresQueue,
              as: 'expendituresQueue',
              attributes: [
                'id',
                'vatableAmount',
                ['totalAmount', 'amount'],
                'statusId',
                'statusText',
                'requestDate',
                'approveDate',
                'rejectDate',
                'liquidateDate',
              ],
            },
            {
              model: RequestsQueue,
              as: 'requestsQueue',
              attributes: [
                'id',
                'amount',
                'statusId',
                'statusText',
                'requestDate',
                'approveDate',
                'rejectDate',
                'issueDate',
              ],
            },
          ],
        },
      ],
      attributes: ['id', 'name', 'accountCurrencyId', 'active'],
    });
    return userAccountList;
  }

  async listCashAccountTotalAllByDate(companyId, startDate, endDate) {
    let requestDate = {
      [Op.gte]: startDate, // Больше или равно (включая startDate)
      [Op.lte]: endDate,
    };
    if (endDate == null || endDate == 'Null' || endDate == 'null')
      requestDate = startDate;
    const userAccountList = await this.accountRepository.findAll({
      include: [
        {
          model: UserAccount,
          where: {
            companyId,
          },
          attributes: ['id', 'userId', 'cashAccountTypeId'],
          include: [
            {
              model: ExpendituresQueue,
              where: { requestDate },
              as: 'expendituresQueue',
              required: false,
              attributes: [
                'id',
                'vatableAmount',
                ['totalAmount', 'amount'],
                'statusId',
                'statusText',
                'requestDate',
                'approveDate',
                'rejectDate',
                'liquidateDate',
              ],
            },
            {
              model: RequestsQueue,
              where: { requestDate },
              required: false,
              as: 'requestsQueue',
              attributes: [
                'id',
                'amount',
                'statusId',
                'statusText',
                'requestDate',
                'approveDate',
                'rejectDate',
                'issueDate',
              ],
            },
          ],
        },
      ],
      attributes: ['id', 'name', 'accountCurrencyId'],
    });
    return userAccountList;
  }

  async listTotalbyUserAccountId(id, startDate, endDate) {
    let requestDate = {
      [Op.gte]: startDate, // Больше или равно (включая startDate)
      [Op.lte]: endDate,
    };
    if (endDate == null || endDate == 'Null' || endDate == 'null')
      requestDate = startDate;
    if (startDate == null || startDate == 'Null' || startDate == 'null')
      delete requestDate[Op.gte];
    const userAccountList = await this.userAccountRepository.findOne({
      where: {
        id,
      },
      include: [
        {
          model: Account,
          attributes: ['id', 'name', 'accountCurrencyId'],
        },
        {
          model: RequestsQueue,
          where: { requestDate },
          required: false,
          as: 'requestsQueue',
          attributes: [
            'id',
            'amount',
            'statusId',
            'statusText',
            'requestDate',
            'purposeReject',
            'approveDate',
            'rejectDate',
            'issueDate',
          ],
        },
        {
          model: ExpendituresQueue,
          where: { requestDate },
          required: false,
          as: 'expendituresQueue',
          attributes: [
            'id',
            'vatableAmount',
            ['totalAmount', 'amount'],
            'statusId',
            'statusText',
            'requestDate',
            'approveDate',
            'rejectDate',
            'liquidateDate',
            'purposeReject',
            'vendorName',
            'vendorTin',
            'vendorContactAddress',
            'vendorPhone',
            'transactionDate',
            'transactionArunumber',
            'transactionRcptnumber',
            'vatableAmount',
            'vatableAmountInclusive',
            'vatableAmountExclusive',
            'vatableAmountWithoutTax',
            'serviceCharge',
            'amountTendered',
            'paymentMethod',
            'chargeGiven',
            'tips',
          ],
        },
      ],
      attributes: ['id', 'userId', 'accountId'],
    });
    console.log(userAccountList);
    return userAccountList;
  }
}
