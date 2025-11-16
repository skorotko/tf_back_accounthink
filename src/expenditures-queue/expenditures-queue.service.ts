import { HttpException, Injectable } from '@nestjs/common';
import {
  ExpendituresQueue,
  ExpenditureStatus,
} from './expenditures-queue.model';
import { InjectModel } from '@nestjs/sequelize';
import { UserAccount } from 'src/account/user-account.model';
import { AccountService } from 'src/account/account.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { CreateExpenditureDto } from './dto/CreateExpenditureDto';
import { Account } from 'src/account/account.model';
import { Op } from 'sequelize';
import { UpdateExpenditureDto } from './dto/UpdateExpenditureDto';

@Injectable()
export class ExpendituresQueueService {
  constructor(
    @InjectModel(ExpendituresQueue)
    private expendituresQueueRepository: typeof ExpendituresQueue,
    @InjectModel(UserAccount) private userAccountRepository: typeof UserAccount,
    private accountService: AccountService,
    private transactionService: TransactionService,
  ) {}

  async create(dto: CreateExpenditureDto) {
    const userAccount = await this.userAccountRepository.findOne({
      where: {
        companyId: dto.companyId,
        userId: dto.userId,
        accountId: dto.accountId,
      },
    });

    if (!userAccount) throw new HttpException('Not Found User Account!', 400);

    return await this.expendituresQueueRepository.create({
      ...dto,
      requestByUserId: dto.userId,
      userAccountId: userAccount.id,
    });
  }

  async update(id, dto: UpdateExpenditureDto) {
    const expendituresQueue = await this.expendituresQueueRepository.findOne({
      where: {
        id,
      },
    });

    if (!expendituresQueue) throw new HttpException('Not Found!', 400);

    return await expendituresQueue.update(dto);
  }

  async list(
    accountId,
    userId,
    companyId,
    startDate,
    endDate,
    requestsQueueStatusId,
  ) {
    let requestDate = {
      [Op.gte]: startDate, // Больше или равно (включая startDate)
      [Op.lte]: endDate,
    };
    if (endDate == null) requestDate = startDate;
    return await this.expendituresQueueRepository.findAll({
      where: {
        ...(Number(requestsQueueStatusId) !== 0 && {
          statusId: requestsQueueStatusId,
        }),
        requestDate,
      },
      include: [
        {
          model: UserAccount,
          as: 'userAccount',
          where: {
            ...(Number(accountId) !== 0 && { accountId }),
            ...(Number(userId) !== 0 && { userId }),
            ...(Number(companyId) !== 0 && { companyId }),
          },
          attributes: ['id', 'cashAccountTypeId'],
          required: true, // INNER JOIN
          include: [
            {
              model: Account,
              as: 'account',
              required: false,
              attributes: ['id', 'name', 'accountCurrencyId'],
            },
          ],
        },
        {
          model: Account,
          as: 'expenseAccount',
          required: false,
          attributes: [
            'id',
            'name',
            'accountCurrencyId',
            'assignToTaxAccountId',
          ],
        },
      ],
    });
  }

  async approve(id, dto) {
    const expendituresQueue = await this.expendituresQueueRepository.findOne({
      where: { id },
    });

    if (!expendituresQueue) throw new HttpException('Not Found!', 400);

    await expendituresQueue.update({
      approveDate: dto.date,
      statusId: ExpenditureStatus.APPROVED,
    });
  }

  async reject(id, dto) {
    const expendituresQueue = await this.expendituresQueueRepository.findOne({
      where: { id },
    });

    if (!expendituresQueue) throw new HttpException('Not Found!', 400);

    await expendituresQueue.update({
      rejectDate: dto.date,
      purposeReject: dto.purposeReject,
      statusId: ExpenditureStatus.REJECTED,
    });
  }

  async liquidate(id, dto) {
    const expendituresQueue = await this.expendituresQueueRepository.findOne({
      where: { id },
      include: [
        {
          model: UserAccount,
          as: 'userAccount',
          attributes: ['id', 'cashAccountTypeId', 'companyId', 'accountId'],
          include: [
            {
              model: Account,
              as: 'account',
              attributes: ['id', 'name', 'code', 'assignToTaxAccountId'],
            },
          ],
        },
      ],
    });

    if (!expendituresQueue) throw new HttpException('Not Found!', 400);
    let journal = await this.createJournal(expendituresQueue, dto);
    await expendituresQueue.update({
      liquidateDate: dto.date,
      statusId: ExpenditureStatus.LIQUIDATED,
    });
    return journal;
  }

  async createJournal(expendituresQueue, dto) {
    const expenditureAccount = await this.accountService.getById(
      dto.expenditureAccountId,
    );
    if (!expenditureAccount) throw new HttpException('Not Found!', 400);
    const accountOnlyTax = await this.accountService.getAccountOnlyTax(
      expendituresQueue.userAccount.companyId,
    );
    console.log(accountOnlyTax[0].codeTax);
    const ntp = accountOnlyTax.find((el) => el.dataValues.codeTax === 'NTP-0%');
    const zrp = accountOnlyTax.find((el) => el.dataValues.codeTax === 'ZRP-0%');
    const etp = accountOnlyTax.find((el) => el.dataValues.codeTax === 'ETP-0%');
    console.log(ntp);
    const expenditureAccountTax = accountOnlyTax.find((el) => el.dataValues.id === expenditureAccount.assignToTaxAccountId);
    const journalDate = new Date()
      .toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
      .replace(/\//g, '-');
    const journalList = [
      {
        id: expenditureAccount.id,
        code: expenditureAccount.code,
        name: expenditureAccount.name,
        debit: expendituresQueue.totalAmount,
        credit: 0,
        taxRate: ntp.id,
        taxAmount: 0,
        description: '',
        entityTypeId: 2,
        buId: null,
        parentId: null,
        taskId: null,
        userId: null,
        vendorClientTypeId: null,
        vendorId: null,
        clientId: null,
        vendorList: [],
        clientList: [],
      },
      {
        id: expendituresQueue.userAccount.accountId,
        code: expendituresQueue.userAccount.account.code,
        name: expendituresQueue.userAccount.account.name,
        debit: 0,
        credit: expendituresQueue.vatableAmount,
        taxRate: expenditureAccountTax.id,
        taxAmount: expendituresQueue.vatableAmountWithoutTax,
        description: '',
        entityTypeId: 2,
        buId: null,
        parentId: null,
        taskId: null,
        userId: null,
        vendorClientTypeId: null,
        vendorId: null,
        clientId: null,
        vendorList: [],
        clientList: [],
      },
    ];
    if(expendituresQueue.vatableAmountInclusive > 0){
        journalList.push({
          id: expendituresQueue.userAccount.accountId,
          code: expendituresQueue.userAccount.account.code,
          name: expendituresQueue.userAccount.account.name,
          debit: 0,
          credit: expendituresQueue.vatableAmountInclusive,
          taxRate: etp.id,
          taxAmount: 0,
          description: '',
          entityTypeId: 2,
          buId: null,
          parentId: null,
          taskId: null,
          userId: null,
          vendorClientTypeId: null,
          vendorId: null,
          clientId: null,
          vendorList: [],
          clientList: [],
        });
    }
    if (expendituresQueue.vatableAmountExclusive > 0) {
      journalList.push({
        id: expendituresQueue.userAccount.accountId,
        code: expendituresQueue.userAccount.account.code,
        name: expendituresQueue.userAccount.account.name,
        debit: 0,
        credit: expendituresQueue.vatableAmountExclusive,
        taxRate: zrp.id,
        taxAmount: 0,
        description: '',
        entityTypeId: 2,
        buId: null,
        parentId: null,
        taskId: null,
        userId: null,
        vendorClientTypeId: null,
        vendorId: null,
        clientId: null,
        vendorList: [],
        clientList: [],
      });
    }
    const journalObj = {
      entryTypeName: 'EXPENDITURE',
      companyId: expendituresQueue.userAccount.companyId,
      userId: dto.userId,
      journalDate,
      transactionCurrency: dto.transactionCurrency,
      foreignCurrency: dto.foreignCurrency,
      exchangeRate: 1,
      documentDate: null,
      sourceRef: null,
      referenceTag: null,
      taxTypeId: 2,
      transactionDescription: '',
      journalList,
      transactionCode: 'EXPENSE',
    };
    return await this.transactionService.createJournalEntriesTransaction(journalObj);
  }
}
