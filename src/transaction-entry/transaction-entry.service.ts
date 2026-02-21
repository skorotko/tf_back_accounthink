import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { TransactionEntry } from "./transaction-entry.model";
import { CreateOpeningBalanceTransactionEntryDto } from "./dto/create-opening-balance-transaction-entry.dto";
import { AccountService } from "../account/account.service";
import { CreateJournalEntriesTransactionEntryDto } from './dto/create-journal-entries-transaction-entry.dto';
import { Account } from 'src/account/account.model';
import { Op } from "sequelize";
import { CreateTransactionEntryDto } from './dto/create-transaction-entry.dto';
import { v4 as uuidv4 } from 'uuid';
import { TransactionEntryDetails } from './transaction-entry-details.model';

@Injectable()
export class TransactionEntryService {
  constructor(
    @InjectModel(TransactionEntry)
    private transactionEntryRepository: typeof TransactionEntry,
    @InjectModel(TransactionEntryDetails)
    private transactionEntryDetailsRepository: typeof TransactionEntryDetails,
  ) {}

  async createTransactionEntry(
    dto: CreateTransactionEntryDto,
  ): Promise<TransactionEntry> {
    return this.transactionEntryRepository.create(dto);
  }

  async bulkCreateTransactionEntry(
    dto: CreateTransactionEntryDto[],
  ): Promise<TransactionEntry[]> {
    return this.transactionEntryRepository.bulkCreate(dto);
  }

  async findAllWhereTransactionEntry(
    where: object,
  ): Promise<TransactionEntry[]> {
    return this.transactionEntryRepository.findAll(where);
  }

  async findOneWhere(where: object): Promise<TransactionEntry> {
    return this.transactionEntryRepository.findOne(where);
  }

  static async totalAmount(list) {
    let totalAmount = 0;
    for (let item of list) {
      totalAmount += item.amount;
    }
    return totalAmount;
  }

  static async recalEndBalance(companyId, accountId) {
    try {
      return await TransactionEntry.sequelize.query(`SELECT
      teid,
      (case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (order by gld.tid))  end) as endbalance
      FROM
      (
      SELECT
      ac.id as accountid,
      t."transactionDate",
      t."transactionNo",
      te.id as teid,
      t.id as tid,
      ac."DRCRCode" as "ADRCRCode",
      (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
      (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
      from accounts ac
      inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
      inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
      where t."companyId"=${companyId} and ac.id=${accountId}
      group by ac.id,t."transactionDate",t."transactionNo",te.id,t.id,te."DRCRCode",ac."DRCRCode") as gld
      group by gld.accountid,gld."transactionDate",gld."transactionNo",gld.tid,gld."ADRCRCode",gld.teid`);
    } catch (error) {
      console.log(error);
    }
  }

  static async openBalance(dto: CreateOpeningBalanceTransactionEntryDto) {
    let account = await AccountService.getById(dto.accountId);

    let newTransactionEntry = {
      transactionId: dto.transactionId,
      companyId: dto.companyId,
      userId: dto.userId,
      accountId: dto.accountId,
      DRCRCode: dto.DRCRCode,
      amount: dto.transactionOpeningBalance,
      endBalance: dto.transactionOpeningBalance,
      foreignAmount: dto.foreignAmount,
      description: `Opening balance for ${account.name}`,
      entityTypeId: null,
      entityId: null,
      taskId: null,
      exchangeRate: (dto.foreignAmount / dto.transactionOpeningBalance).toFixed(
        8,
      ),
      isTax: false,
      taxAssignAccountId: null,
      trAccountCode: null,
      trTaxCode: null,
      createdBy: dto.userId,
      createdDate: Date.now(),
      VatRCheked: null,
      itemId: null,
      VatRCheckedDate: null,
      VatRCheckedBy: null,
      VatRApplicableMonth: null,
    };
    try {
      let te = await TransactionEntry.create(newTransactionEntry);
      return te;
    } catch (e) {
      throw new HttpException(`Error: ${e}`, 500);
    }
  }

  static async updateOpenBalance(transactionId, data) {
    try {
      let te = await TransactionEntry.update(data, {
        where: { transactionId },
        individualHooks: true,
      });
      return te;
    } catch (e) {
      throw new HttpException(`Error: ${e}`, 500);
    }
  }

  static async openBalanceAllocation(
    dto: CreateOpeningBalanceTransactionEntryDto,
    list,
  ) {
    let account = await AccountService.getById(dto.accountId);

    let code = uuidv4();

    let newTransactionEntry = {
      transactionId: dto.transactionId,
      companyId: dto.companyId,
      userId: dto.userId,
      accountId: dto.accountId,
      DRCRCode: dto.DRCRCode,
      amount: dto.transactionOpeningBalance,
      endBalance: 0,
      foreignAmount: dto.foreignAmount,
      description: `Sum allocation for ${account.name}`,
      entityTypeId: null,
      entityId: null,
      taskId: null,
      exchangeRate: null,
      isTax: false,
      trTaxCode: null,
      createdBy: dto.userId,
      createdDate: Date.now(),
    };
    try {
      let data = [];
      if (Array.isArray(list)) {
        for (let item of list) {
          data.push({
            ...newTransactionEntry,
            amount: item.amount,
            description: item.transactionDescription,
            entityTypeId: item.entityTypeId,
            entityId: item.parentId ? item.parentId : item.buId,
            taskId: item.taskId,
            isAllocated: 'ALLOCATED',
            clientId: item.clientId,
            vendorId: item.vendorId,
            employeeId: item.userId,
            buId: item.buId,
            foreignAmount: item.foreignAmount,
          });
        }
      }
      data.push({
        ...newTransactionEntry,
        DRCRCode: dto.DRCRCode === 'DR' ? 'CR' : 'DR',
      });
      await TransactionEntry.bulkCreate(data);
    } catch (e) {
      console.log('error');
      console.log(e);
      throw new HttpException(`Error: ${e}`, 500);
    }
  }

  static async journalEntriesCreate(
    dto: CreateJournalEntriesTransactionEntryDto,
    list,
    transaction = null
  ) {
    let newTransactionEntry = {
      transactionId: dto.transactionId,
      companyId: dto.companyId,
      userId: dto.userId,
      exchangeRate: dto.exchangeRate,
      isTax: false,
    };
    try {
      let data = [];
      if (Array.isArray(list)) {
        for (let item of list) {
          let amount = item.debit > 0 ? item.debit : item.credit;

          if (dto.taxTypeId === 3 && item.taxRate) {
            amount = amount - item.taxAmount;
          }
          let lastOperation = await TransactionEntry.findAll({
            where: { accountId: item.id },
            limit: 1,
            order: [['id', 'DESC']],
          });
          let endBalance = 0;
          if (lastOperation.length > 0) {
            endBalance = lastOperation[0].endBalance;
          }
          let intPart = Math.trunc(amount * dto.exchangeRate);
          let fractionalPart = amount * dto.exchangeRate - intPart;
          let code = uuidv4();
          let itemData = {
            ...newTransactionEntry,
            amount: amount * dto.exchangeRate,
            fractionalPart: fractionalPart,
            foreignAmount: amount,
            description: item.description,
            accountId: item.id,
            isAllocated: 'ALLOCATED',
            DRCRCode: item.debit > 0 ? 'DR' : 'CR',
            endBalance:
              item.debit > 0 ? endBalance + intPart : endBalance - intPart,
            entityTypeId: item.entityTypeId,
            entityId: item.parentId ? item.parentId : item.buId,
            taskId: item.taskId,
            employeeId: item.userId,
            clientId: item.clientId,
            vendorId: item.vendorId,
            buId: item.buId,
            taxAssignAccountId: null,
            trAccountCode: code,
            trTaxCode: null,
            createdBy: dto.userId,
            createdDate: Date.now(),
          };
          if (dto.taxTypeId !== 1 && item.taxRate) {
            let taxAmount = item.taxAmount * dto.exchangeRate;
            data.push({
              ...itemData,
              accountId: item.taxRate,
              amount: item.taxAmount,
              endBalance:
                item.debit > 0
                  ? endBalance + taxAmount
                  : endBalance - taxAmount,
              foreignAmount: item.taxAmount,
              //DRCRCode: await AccountService.getAccountDRCRCodeById(item.taxRate),
              isTax: true,
              VatRCheked: true,
              taxAssignAccountId: item.id,
              trAccountCode: null,
              trTaxCode: code,
            });
          }
          data.push(itemData);
        }
      }
      if (!transaction) {
        await TransactionEntry.bulkCreate(data);
      } else {
        await TransactionEntry.bulkCreate(data, { transaction });
      }
    } catch (e) {
      console.log('error');
      console.log(e);
      throw new HttpException(`Error: ${e}`, 500);
    }
  }

  async getTransactionEntryItemByTransactionId(transactionId) {
    return await this.transactionEntryRepository.findAll({
      where: {
        transactionId,
      },
      include: {
        model: Account,
      },
    });
  }

  async changeStatus(transactionIdArr) {
    return await this.transactionEntryRepository.update(
      {
        VatRCheked: false,
        VatRCleared: true,
      },
      {
        where: {
          transactionId: transactionIdArr,
          VatRCheked: true,
        },
        individualHooks: true,
      },
    );
  }

  async changeReportedStatus(transactionIdArr: Array<number>, status: boolean) {
    return await this.transactionEntryRepository.update(
      {
        VatRCleared: status,
      },
      {
        where: {
          id: transactionIdArr,
          isTax: true,
          VatRCheked: true,
        },
        individualHooks: true,
      },
    );
  }

  static async getTransactionEntryItemByCompanyId(companyId) {
    return await TransactionEntry.findAll({
      where: {
        companyId,
      },
      include: {
        model: Account,
      },
    });
  }

  static async deleteTransactionEntry(transactionId) {
    await TransactionEntry.destroy({
      where: { transactionId },
      individualHooks: true,
    });
  }

  async reverseTransactionEntry(oldIdTransaction, newIdTransaction) {
    const transactionEntryArr: any = await this.findAllWhereTransactionEntry({
      where: { transactionId: oldIdTransaction },
    });
    let newTransactionEntry = [];
    transactionEntryArr.forEach((el) => {
      let tre = el.get();
      if (tre.DRCRCode == 'DR') tre.DRCRCode = 'CR';
      else tre.DRCRCode = 'DR';
      tre.createdDate = Date.now();
      tre.transactionId = newIdTransaction;
      delete tre.id;
      delete tre.endBalanceObj;
      delete tre.amountObj;
      delete tre.foreignAmountObj;
      newTransactionEntry.push(tre);
    });
    await this.bulkCreateTransactionEntry(newTransactionEntry);
  }

  static async deleteTransactionEntryArr(idArr) {
    await TransactionEntry.destroy({
      where: { transactionId: idArr },
      individualHooks: true,
    });
  }

  static async clearTransactionEntryByCompanyId(companyId: number) {
    await TransactionEntry.destroy({
      where: {
        companyId,
      },
      individualHooks: true,
    });
  }

  static async getTransactionEntryByDate(
    companyId: number,
    startDate,
    endDate,
  ) {
    return await TransactionEntry.findAll({
      where: {
        companyId,
        createdDate: {
          [Op.between]: [startDate, endDate],
        },
      },
    });
  }

  blocked(blockedParams) {
    this.transactionEntryRepository.update(
      { isBlock: true },
      {
        where: {
          companyId: blockedParams.companyId,
          createdDate: { [Op.lte]: blockedParams.lockAccountingPeriodTo },
        },
        individualHooks: true,
      },
    );
    this.transactionEntryDetailsRepository.update(
      { isBlock: true },
      {
        where: {
          companyId: blockedParams.companyId,
          createdDate: { [Op.lte]: blockedParams.lockAccountingPeriodTo },
        },
      },
    );
  }

  blockedTranIdArr(tranIdArr) {
    this.transactionEntryRepository.update(
      { isBlock: true },
      {
        where: {
          transactionId: tranIdArr
        },
        individualHooks: true,
      },
    );
  }
}
