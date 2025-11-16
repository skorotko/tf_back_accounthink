import { HttpException, Injectable, Inject, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Transaction } from "./transaction.model";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { TransactionEntryService } from "../transaction-entry/transaction-entry.service";
import { AccountService } from "../account/account.service";
import { TransactionEntry } from 'src/transaction-entry/transaction-entry.model';
import { CreateOpenBalanceTransactionDto } from './dto/create-open-balance-transaction.dto';
import { GroupService } from "../group/group.service";
import { CreateOpenBalanceAllocationTransactionDto } from './dto/create-open-balance-allocation-transaction.dto';
import { Account } from "../account/account.model";
import {CreateJournalEntriesTransactionDto } from './dto/create-journal-entries-transaction.dto';
import * as moment from 'moment'
import { Op } from "sequelize";
import { UpdateOpenBalanceTransactionDto } from './dto/update-open-balance-transaction.dto';
import { CronService, entityTypeId } from 'src/cron/cron.service';
import { InlineChangeNameTemplateTransactionDto } from './dto/inline-change-name-template-transaction.dto';

@Injectable()
export class TransactionService {
  transactionType = {
    1: 'Opening Balance',
    2: 'Allocations',
    3: 'Adjusting',
    4: 'Transferring',
    5: 'Correcting',
    6: 'Credit Purchase & Sales of Assets',
    7: 'Other',
  };

  constructor(
    @InjectModel(Transaction) private transactionRepository: typeof Transaction,
    @Inject(forwardRef(() => CronService))
    private readonly cronService: CronService,
    private transactionEntryService: TransactionEntryService,
  ) {}

  async createTransaction(
    dto: CreateTransactionDto,
    id?: number,
  ): Promise<Transaction> {
    if (id) return this.transactionRepository.create({ ...dto, id });
    else return this.transactionRepository.create(dto);
  }

  async changeIdTransaction(idOld: number, idNew: number) {
    return this.transactionRepository.update(
      { id: idNew },
      { where: { id: idOld }, individualHooks: true },
    );
  }

  async getCountByAccountId(accountId) {
    return this.transactionRepository.count({
      where: {
        accountId,
      },
    });
  }
  async createOpenBalanceTransaction(dto: CreateOpenBalanceTransactionDto) {
    try {
      let account = await AccountService.getById(dto.accountId);

      let accountOpenBalance = await AccountService.getByNameAndCompanyId(
        'Opening Balance Equity',
        dto.companyId,
      );

      let transactionCode = await GroupService.getGroupTransactionCodeById(
        account.groupId,
      );

      let maxTransactionNumber = await this.transactionRepository.count({
        where: {
          transactionCode,
          companyId: dto.companyId,
          transactionNo: {
            [Op.notLike]: '%-%',
          },
        },
      });
      // console.log(moment(dto.transactionDate).format('x'));

      let newTransaction = await this.transactionRepository.create({
        transactionId: dto.transactionId,
        transactionCode,
        reference: null,
        transactionType: 'OPENING',
        transactionNo: `${
          transactionCode == 'SALES'
            ? 'SJ'
            : transactionCode == 'PURCHASE'
            ? 'PJ'
            : 'GJ'
        }${maxTransactionNumber + 1}`,
        transactionDate: Number(moment(dto.transactionDate).format('x')),
        transactionCurrency: dto.transactionCurrency,
        foreignCurrency: dto.foreignCurrency,
        transactionDescription: dto.transactionDescription,
        isPosted: dto.status === 'post' ? true : false,
        postedDate: Date.now(),
        createdBy: dto.userId,
        createdDate: Date.now(),
        recorderBy: dto.userId,
        recorderDate: null,
        companyId: dto.companyId,
        accountId: dto.accountId,
        amount: dto.amount,
        foreignAmount: dto.foreignAmount,
        exchangeRate: (dto.foreignAmount / dto.amount).toFixed(8),
        taxTypeId: 1,
      });

      if (dto.status === 'post') {
        await newTransaction.update({
          recorderDate: Date.now(),
          checkedDate: Date.now(),
        });
      }

      await TransactionEntryService.openBalance({
        transactionId: newTransaction.id,
        companyId: dto.companyId,
        accountId: dto.accountId,
        DRCRCode: account.DRCRCode,
        userId: dto.userId,
        transactionOpeningBalance: dto.amount,
        foreignAmount: dto.foreignAmount,
      });

      await TransactionEntryService.openBalance({
        transactionId: newTransaction.id,
        companyId: dto.companyId,
        accountId: accountOpenBalance.id,
        DRCRCode: account.DRCRCode === 'DR' ? 'CR' : 'DR',
        userId: dto.userId,
        transactionOpeningBalance: dto.amount,
        foreignAmount: dto.foreignAmount,
      });

      return newTransaction;
    } catch (error) {
      console.log(error);
    }
  }

  async updateOpenBalanceTransaction(id, dto: UpdateOpenBalanceTransactionDto) {
    try {
      await this.transactionRepository.update(
        {
          transactionDate: Number(moment(dto.transactionDate).format('x')),
          transactionCurrency: dto.transactionCurrency,
          foreignCurrency: dto.foreignCurrency,
          transactionDescription: dto.transactionDescription,
          amount: dto.amount,
          foreignAmount: dto.foreignAmount,
          //exchangeRate: (dto.foreignAmount / dto.amount).toFixed(8)
        },
        { where: { id }, individualHooks: true },
      );

      await TransactionEntryService.updateOpenBalance(id, {
        amount: dto.amount,
        foreignAmount: dto.foreignAmount,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async postOpenBalanceTransaction(id) {
    try {
      await this.transactionRepository.update(
        {
          isPosted: true,
        },
        { where: { id }, individualHooks: true },
      );
    } catch (error) {
      console.log(error);
    }
  }

  async createOpenBalanceAllocationTransaction(
    dto: CreateOpenBalanceAllocationTransactionDto,
  ) {
    let parentTransaction = await this.transactionRepository.findOne({
      where: {
        id: dto.parentTransactionId,
      },
    });

    let maxTransactionNumber = await this.transactionRepository.count({
      where: {
        companyId: dto.companyId,
        transactionNo: {
          [Op.like]: `${parentTransaction.transactionNo}%`,
        },
      },
    });

    let account = await AccountService.getById(dto.accountId);

    let transactionCode = await GroupService.getGroupTransactionCodeById(
      account.groupId,
    );

    let openBalance = await this.transactionRepository.findOne({
      where: { accountId: dto.accountId, transactionType: 'OPENING' },
    });

    let newTransaction = await this.transactionRepository.create({
      transactionId: dto.transactionId,
      transactionCode,
      reference: null,
      transactionType: 'OPENING',
      transactionNo: `${parentTransaction.transactionNo}-${maxTransactionNumber}`,
      transactionDate: openBalance.transactionDate,
      transactionCurrency: dto.transactionCurrency,
      foreignCurrency: dto.foreignCurrency,
      transactionDescription: dto.transactionDescription,
      isPosted: true,
      postedDate: Date.now(),
      createdBy: dto.userId,
      createdDate: Date.now(),
      recorderBy: dto.userId,
      recorderDate: null,
      companyId: dto.companyId,
      accountId: dto.accountId,
      amount: dto.amount,
      foreignAmount: dto.foreignAmount,
      exchangeRate: null,
      taxTypeId: 1,
    });

    await TransactionEntryService.openBalanceAllocation(
      {
        transactionId: newTransaction.id,
        companyId: dto.companyId,
        accountId: dto.accountId,
        DRCRCode: account.DRCRCode,
        userId: dto.userId,
        transactionOpeningBalance: dto.amount,
        foreignAmount: dto.foreignAmount,
      },
      dto.transactionArray,
    );

    return newTransaction;
  }

  async createJournalEntriesTransaction(
    dto: CreateJournalEntriesTransactionDto,
  ) {
    let maxTransactionNumber = await this.transactionRepository.count({
      where: {
        companyId: dto.companyId,
        transactionCode: 'GENERAL',
        transactionNo: {
          [Op.notLike]: '%-%',
        },
      },
    });

    try {
      let newTransaction = await this.transactionRepository.create({
        transactionId: 3,
        transactionCode: 'GENERAL',
        reference: dto.referenceTag == 'null' ? null : dto.referenceTag,
        transactionType: dto.entryTypeName,
        transactionNo: `GJ${maxTransactionNumber + 1}`,
        transactionDate: Number(moment(dto.journalDate).format('x')),
        transactionCurrency: dto.transactionCurrency,
        foreignCurrency: dto.foreignCurrency,
        transactionDescription: dto.transactionDescription,
        isPosted: true,
        postedDate: Date.now(),
        createdBy: dto.userId,
        createdDate: Date.now(),
        recorderBy: null,
        recorderDate: null,
        companyId: dto.companyId,
        accountId: null,
        amount: null,
        foreignAmount: null,
        exchangeRate: dto.exchangeRate,
        taxTypeId: dto.taxTypeId,
      });

      await TransactionEntryService.journalEntriesCreate(
        {
          transactionId: newTransaction.id,
          companyId: dto.companyId,
          userId: dto.userId,
          exchangeRate: dto.exchangeRate,
          taxTypeId: dto.taxTypeId,
        },
        dto.journalList,
      );

      return newTransaction;
    } catch (error) {
      console.log(error);
    }
  }

  async createMultipleJournalEntries(dtoList: CreateJournalEntriesTransactionDto[]) {
    const sequelize = this.transactionRepository.sequelize;
    const transaction = await sequelize.transaction();

    try {
      let results = [];

      for (const dto of dtoList) {
        let maxTransactionNumber = await this.transactionRepository.count({
          where: {
            companyId: dto.companyId,
            transactionCode: 'GENERAL',
            transactionNo: {
              [Op.notLike]: '%-%',
            },
          },
          transaction
        });

        let newTransaction = await this.transactionRepository.create({
          transactionId: 3,
          transactionCode: 'GENERAL',
          reference: dto.referenceTag == 'null' ? null : dto.referenceTag,
          transactionType: dto.entryTypeName,
          transactionNo: `GJ${maxTransactionNumber + 1}`,
          transactionDate: Number(moment(dto.journalDate).format('x')),
          transactionCurrency: dto.transactionCurrency,
          foreignCurrency: dto.foreignCurrency,
          transactionDescription: dto.transactionDescription,
          isPosted: true,
          postedDate: Date.now(),
          createdBy: dto.userId,
          createdDate: Date.now(),
          recorderBy: null,
          recorderDate: null,
          companyId: dto.companyId,
          accountId: null,
          amount: null,
          foreignAmount: null,
          exchangeRate: dto.exchangeRate,
          taxTypeId: dto.taxTypeId,
        }, { transaction });

        await TransactionEntryService.journalEntriesCreate(
          {
            transactionId: newTransaction.id,
            companyId: dto.companyId,
            userId: dto.userId,
            exchangeRate: dto.exchangeRate,
            taxTypeId: dto.taxTypeId,
          },
          dto.journalList,
          transaction
        );

        results.push(newTransaction);
      }

      await transaction.commit();
      return results;
    } catch (error) {
      await transaction.rollback();
      console.error('Transaction failed:', error);
      throw new HttpException('Transaction failed', 500);
    }
  }

  async updateJournalEntriesTransaction(
    dto: CreateJournalEntriesTransactionDto,
    transactionId,
  ) {
    try {
      let getTransaction = await this.getTransactionItemById(transactionId);

      await getTransaction.update({
        transactionType: dto.entryTypeName,
        transactionDate: dto.journalDate,
        transactionCurrency: dto.transactionCurrency,
        foreignCurrency: dto.foreignCurrency,
        reference: dto.referenceTag == 'null' ? null : dto.referenceTag,
        transactionDescription: dto.transactionDescription,
        updatedDate: Date.now(),
        updatedBy: dto.userId,
        companyId: dto.companyId,
        exchangeRate: dto.exchangeRate,
        taxTypeId: dto.taxTypeId,
        checkedDate: null,
        checkedBy: null,
        recorderDate: null,
        recorderBy: null,
      });

      await TransactionEntryService.deleteTransactionEntry(transactionId);

      await TransactionEntryService.journalEntriesCreate(
        {
          transactionId: getTransaction.id,
          companyId: dto.companyId,
          userId: dto.userId,
          exchangeRate: dto.exchangeRate,
          taxTypeId: dto.taxTypeId,
        },
        dto.journalList,
      );
    } catch (error) {
      console.log(error);
    }
  }

  async inlineChangeNameTemplateTransaction(
    dto: InlineChangeNameTemplateTransactionDto,
    transactionId,
  ) {
    // console.log('is');

    try {
      let getTransaction = await this.getTransactionItemById(transactionId);

      await getTransaction.update({
        reference: dto.name,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async checkTransaction(transactionId, userId) {
    try {
      let getTransaction = await this.getTransactionItemById(transactionId);
      if (!getTransaction) return false;

      await getTransaction.update({
        checkedBy: userId,
        checkedDate: Date.now(),
      });
    } catch (error) {
      console.log(error);
    }

    return true;
  }

  async recordTransaction(transactionId, userId) {
    try {
      let getTransaction = await this.getTransactionItemById(transactionId);
      if (!getTransaction) return false;

      await getTransaction.update({
        recorderBy: userId,
        recorderDate: Date.now(),
      });
    } catch (error) {
      console.log(error);
    }

    return true;
  }

  async getJournalEntriesTransactionRefTag(companyId) {
    try {
      return await this.transactionRepository.findAll({
        where: {
          companyId,
          reference: {
            [Op.not]: null,
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async recorderJournalEntriesTransaction(transactionId, userId) {
    try {
      let getTransaction = await this.getTransactionItemById(transactionId);

      await getTransaction.update({
        recorderBy: userId,
        recorderDate: Date.now(),
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getTransactionItemByAccountId(accountId) {
    let item = await this.transactionRepository.findAll({
      where: {
        accountId,
      },
      order: [['id', 'ASC']],
      raw: true,
    });
    return item;
  }

  async getTransactionItemById(id) {
    let transactionById = await this.transactionRepository.findOne({
      where: {
        id,
      },
    });
    return transactionById;
    // return (await this.transactionRepository.findAll({
    //   where: {
    //     id
    //   }
    // }));
  }

  async getTransactionListByIdList(companyId, transactionId) {
    let objWhere: any = {};
    if (transactionId == null || transactionId == 'null') {
      objWhere.companyId = companyId;
    } else {
      objWhere.id = transactionId;
    }
    let transactionList: any = await this.transactionRepository.findAll({
      where: objWhere,
      include: [
        {
          model: TransactionEntry,
        },
        {
          model: Account,
        },
      ],
    });
    return transactionList;
  }

  async deleteTransaction(id) {
    await TransactionEntryService.deleteTransactionEntry(id);
    await this.transactionRepository.destroy({
      where: { id },
      individualHooks: true,
    });
  }

  async isDeleteTransaction(id) {
    await TransactionEntryService.deleteTransactionEntry(id);
    await this.transactionRepository.update(
      { isDeleted: true },
      { where: { id }, individualHooks: true },
    );
  }

  async setSendToAccountant(id) {
    await this.transactionRepository.update(
      { isSendToAcc: true, sendToAccDate: Date.now() },
      { where: { id }, individualHooks: true },
    );
    return true;
  }

  async deleteTransactionRecord(id) {
    let oldTransaction: any = await this.transactionRepository.findOne({
      where: { id },
    });
    await oldTransaction.update({ isVoid: true });
    oldTransaction.isVoid = true;
    oldTransaction.transactionNo = oldTransaction.transactionNo + '-V';
    oldTransaction.postedDate = Date.now();
    oldTransaction.createdDate = Date.now();
    let newDataTransaction = oldTransaction.dataValues;
    delete newDataTransaction.id;
    let newTransaction: any = await this.transactionRepository.create(
      newDataTransaction,
    );
    this.transactionEntryService.reverseTransactionEntry(id, newTransaction.id);
    return newTransaction;
  }

  async reverseTransaction(id) {
    let oldTransaction: any = await this.transactionRepository.findOne({
      where: { id },
    });
    await oldTransaction.update({ isReverse: true });
    oldTransaction.isReverse = true;
    oldTransaction.transactionNo = oldTransaction.transactionNo + '-R';
    let newDataTransaction = oldTransaction.dataValues;
    delete newDataTransaction.id;
    let newTransaction: any = await this.transactionRepository.create(
      newDataTransaction,
    );
    this.transactionEntryService.reverseTransactionEntry(id, newTransaction.id);
    return newTransaction;
  }

  async reverseTransactionCron(id: number, cronDate) {
    let oldTransaction: any = await this.transactionRepository.findOne({
      where: { id },
    });
    let fixCronDate = new Date(Number(cronDate));
    await oldTransaction.update({
      isReverse: true,
      isReverseCronDate: fixCronDate,
    });
    await this.cronService.create({
      entityId: id,
      entityTypeId: entityTypeId.trensactionRecord,
      description: 'Create cron for reverse transaction',
      cronDate: fixCronDate.toLocaleDateString(),
    });
  }

  async deleteTransactionOpenBalance(accountId) {
    let idArr = await (
      await this.transactionRepository.findAll({
        where: { accountId, transactionType: 'OPENING' },
      })
    ).map((x) => x.id);
    await TransactionEntryService.deleteTransactionEntryArr(idArr);
    await this.transactionRepository.destroy({
      where: { id: idArr },
      individualHooks: true,
    });
  }

  async getTransactionJournalDirectories(companyId) {
    let entryTypes = ['GENERAL', 'ADJUSTING'];

    let transactionList = await this.transactionRepository.findAll({
      where: {
        companyId,
      },
      include: {
        model: Account,
      },
    });

    let list = {};

    entryTypes.map((x) => {
      list[x] = transactionList.filter(
        (transaction) => transaction.transactionType === x,
      );
    });

    return {
      entryTypes,
      list,
    };
  }

  static async clearTransactionByCompanyId(companyId: number) {
    await Transaction.destroy({
      where: {
        companyId,
      },
      individualHooks: true,
    });
  }

  static async getTransactionByDate(companyId: number, startDate, endDate) {
    return await Transaction.findAll({
      where: {
        companyId,
        createdDate: {
          //[Op.gte]: startDate,                             // >= 6
          //[Op.lte]: endDate,
          [Op.between]: [startDate, endDate],
        },
      },
    });
  }

  async checkAccount(companyId: number, accountId: number) {
    let count = await this.transactionRepository.count({
      where: {
        companyId,
        accountId,
      },
    });

    return count > 0;
  }

  async getTransactionCount(objWhere) {
    return this.transactionRepository.count({
      where: objWhere,
    });
  }

  async getLastTransaction(objWhere) {
    return this.transactionRepository.findOne({
      where: objWhere,
      order: [['id', 'DESC']],
      raw: true,
    });
  }

  blocked(blockedParams) {
    this.transactionRepository.update(
      { isBlock: true },
      {
        where: {
          companyId: blockedParams.companyId,
          createdDate: { [Op.lte]: blockedParams.lockAccountingPeriodTo },
        },
        individualHooks: true,
      },
    );
    this.transactionEntryService.blocked(blockedParams);
    return true;
  }

  async blockedTranIdArr(tranIdArr) {
    this.transactionRepository.update(
      { isBlock: true },
      {
        where: {
          id: tranIdArr
        },
        individualHooks: true,
      },
    );
    this.transactionEntryService.blockedTranIdArr(tranIdArr);
    return true;
  }
}