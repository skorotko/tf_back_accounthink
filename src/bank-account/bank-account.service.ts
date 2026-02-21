import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { BankAccount } from "./bank-account.model";
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { Account } from "src/account/account.model";
import { Group } from 'src/group/group.model';
import { BankAccountType } from 'src/bank-account-type/bank-account-type.model';

@Injectable()
export class BankAccountService {
  constructor(
    @InjectModel(BankAccount) private bankAccountRepository: typeof BankAccount,
  ) {}

  static async getBankAccount() {
    return await BankAccount.findAll({});
  }

  async getTransactionBankAccount(params) {
    try {
      return await this.bankAccountRepository.sequelize.query(`SELECT
        --gld."dbCode",gld."accountName",
        gld."transactionDate" as date, gld."transactionNo" as num,
        (case when gld."vendorId"=0 then gld."clientId" else gld."vendorId" end) as name,
        --gld."transactionType",gld."createdBy",gld."ADRCRCode",
        sum(gld.debit) as debit,
        sum(gld.credit) as credit,
        (case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (order by gld.tid))  end) as endbalance,
        --gld."BRID" as BankReconID, gld."BRCheked" as BankReconChecked, 
        gld."BRCleared" as BankReconCleared,
        gld."transactionCode",
        gld."transactionId",
        gld."transactionDescription",
        (case when gld."transactionCode"='CASHRECEIPT' then gld.crChequeNo else gld.cdChequeNo end) as chequeNo
        --gld.crChequeNo,
        --gld.cdChequeNo
        FROM
        (
        SELECT
        ac.code as "dbCode",ac.name as "accountName",
        t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t.id as "transactionId", t."transactionType", t."transactionDescription",t."createdBy", t."transactionCode", ac."DRCRCode" as "ADRCRCode",
        te."BRID", te."BRCheked", te."BRCleared", coalesce(te."vendorId",0) as "vendorId", coalesce(te."clientId",0) as "clientId",  
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit,
        crq.crChequeNo,cdq.cdChequeNo
        from types ty
        inner join classes cl on cl."typeId"=ty.id
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
        inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
        inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
        left outer join
        (
        select cr."tranId", crp."chequeRefNo" as crChequeNo from "cashReceiptHeader" cr
        inner join "cashReceiptPayment" crp on crp."cashReceiptHeaderId"=cr.id and crp."companyId"=cr."companyId"
        where cr."companyId"=${params.companyId}
        ) as crq on crq."tranId"=t.id
        left outer join
        (
        select cd."tranId", cdp."chequeRefNo" as cdChequeNo from "cashDisbursementHeader" cd
        inner join "cashDisbursementPayment" cdp on cdp."cashDisbursementHeaderId"=cd.id and cdp."companyId"=cd."companyId"
        where cd."companyId"=${params.companyId}
        ) as cdq on cdq."tranId"=t.id
        where t."companyId"=${params.companyId} and ac.id=${params.accountId}
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${params.startDate}' as date)
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
        group by ac.code,ac.name,t.id, t."transactionDate", t."transactionNo", t."transactionId", t."transactionType", t."transactionDescription",t."createdBy",te."DRCRCode",ac."DRCRCode",t."createdBy", t."transactionCode", te."BRID", te."BRCheked", te."BRCleared", te."vendorId", te."clientId",crq.crChequeNo,cdq.cdChequeNo) as gld
        group by gld."dbCode",gld."accountName",gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionId", gld."transactionType", gld."transactionDescription",gld."ADRCRCode",gld."createdBy", gld."BRID", gld."BRCheked", gld."BRCleared", gld."vendorId", gld."clientId", gld."transactionCode",gld.crChequeNo,gld.cdChequeNo
      `);
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async getAllTransactionBankAccount(params) {
    try {
      return await this.bankAccountRepository.sequelize.query(`SELECT
        --gld."dbCode",gld."accountName",
        gld."transactionDate" as date,
        gld."accountName" as bankaccount,
        gld."transactionNo" as num,
        (case when gld."vendorId"=0 then gld."clientId" else gld."vendorId" end) as name,
        --gld."transactionType",gld."createdBy",gld."ADRCRCode",
        sum(gld.debit) as debit,
        sum(gld.credit) as credit,
        gld."transactionDescription",
        --gld."transactionCode",gld.crChequeNo,gld.cdChequeNo,
		    (case when gld."transactionCode"='CASHRECEIPT' then gld.crChequeNo else gld.cdChequeNo end) as chequeNo
        --(case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (order by gld.tid))  end) as endbalance,
        --gld."BRID" as BankReconID, gld."BRCheked" as BankReconChecked, 
        --gld."BRCleared" as BankReconCleared
        FROM
        (
        SELECT
        ac.code as "dbCode",ac.name as "accountName",
        t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",ac."DRCRCode" as "ADRCRCode",
        te."BRID", te."BRCheked", te."BRCleared", coalesce(te."vendorId",0) as "vendorId", coalesce(te."clientId",0) as "clientId",  
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit,
        t."transactionCode",
		    crq.crChequeNo,cdq.cdChequeNo
        from types ty
        inner join classes cl on cl."typeId"=ty.id
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
        inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
        inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
        left outer join
        (
        select cr."tranId", crp."chequeRefNo" as crChequeNo from "cashReceiptHeader" cr
        inner join "cashReceiptPayment" crp on crp."cashReceiptHeaderId"=cr.id and crp."companyId"=cr."companyId"
        where cr."companyId"=${params.companyId}
        ) as crq on crq."tranId"=t.id
        left outer join
        (
        select cd."tranId", cdp."chequeRefNo" as cdChequeNo from "cashDisbursementHeader" cd
        inner join "cashDisbursementPayment" cdp on cdp."cashDisbursementHeaderId"=cd.id and cdp."companyId"=cd."companyId"
        where cd."companyId"=${params.companyId}
        ) as cdq on cdq."tranId"=t.id
        where t."companyId"=${params.companyId} and ac."accountTypeId"=1
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${params.startDate}' as date)
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
        group by ac.code,ac.name,t.id, t."transactionDate", t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",te."DRCRCode",ac."DRCRCode",t."createdBy",te."BRID", te."BRCheked", te."BRCleared", te."vendorId", te."clientId",t."transactionCode",crq.crChequeNo,cdq.cdChequeNo) as gld
        group by gld."dbCode",gld."accountName",gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."ADRCRCode",gld."createdBy", gld."BRID", gld."BRCheked", gld."BRCleared", gld."vendorId", gld."clientId",gld."transactionCode",gld.crChequeNo,gld.cdChequeNo
      `);
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  static async createBankAccount(accountId, userId) {
    try {
      let data = {
        accountId,
        createdBy: userId,
        createdDate: Date.now(),
      };
      await BankAccount.create(data);
    } catch (e) {
      console.log(e);
      //throw new HttpException(e.response, e.status)
    }
  }

  async updateBankAccount(accountId, dto: UpdateBankAccountDto) {
    try {
      let active = true;
      if (dto.inactive === true) active = false;
      await Account.update(
        { active, close: dto.close },
        { where: { id: accountId } },
      );
      return await this.bankAccountRepository.update(
        {
          currentBalance: dto.currentBalance,
          overDraftLimit: dto.overdraftLimit,
          IBAN: dto.IBAN,
          reconciliationDays: dto.reconciliationDays,
          reconciliationStartDate: dto.reconciliationStartDate,
          allowBalancingTransaction: dto.allowBalancingTransaction,
          financialInstitution: dto.financialInstitution,
          website: dto.website,
          bankSwiftCode: dto.bankSwiftCode,
          bankCode: dto.bankCode,
          accountNumber: dto.accountNumber,
          bankManagerName: dto.bankManagerName,
          bankManagerEmail: dto.bankManagerEmail,
          bankManagerPhone: dto.bankManagerPhone,
          BankManagerFax: dto.BankManagerFax,
          buId: dto.buId,
          buUserId: dto.buUserId,
          taxCodeId: dto.taxCodeId,
          updatedBy: dto.userId,
          updatedDate: Date.now(),
          bankAccountTypeID: dto.bankAccountTypeID,
        },
        {
          where: { accountId },
        },
      );
    } catch (e) {
      console.log(e);
      throw new HttpException(e, 500);
    }
  }

  async itemBankAccount(accountId) {
    //return await BankAccountService.getBankAccount();

    return await Account.findOne({
      where: {
        id: accountId,
        //entityType: 'account'
      },
      include: [
        {
          model: Group,
        },
        {
          model: BankAccount,
        },
        {
          model: BankAccountType,
        },
      ],
    });
  }
}
