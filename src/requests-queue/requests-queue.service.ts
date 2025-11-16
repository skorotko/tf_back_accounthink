import { HttpException, Injectable } from '@nestjs/common';
import { RequestsQueue, RequestStatus } from './requests-queue.model';
import { InjectModel } from '@nestjs/sequelize';
import { UserAccount } from 'src/account/user-account.model';
import { CreateRequestDto } from './dto/CreateRequestDto.dto';
import { Op } from 'sequelize';
import { Account } from 'src/account/account.model';
import { AccountService } from 'src/account/account.service';
import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class RequestsQueueService {
    constructor(
        @InjectModel(RequestsQueue)
        private requestsQueueRepository: typeof RequestsQueue,
        @InjectModel(UserAccount) private userAccountRepository: typeof UserAccount,
        private accountService: AccountService,
        private transactionService: TransactionService,
    ) {}

    async create(dto: CreateRequestDto) {
        const userAccount = await this.userAccountRepository.findOne({
        where: {
            companyId: dto.companyId,
            userId: dto.userId,
            accountId: dto.accountId,
        },
        });

        if (!userAccount) throw new HttpException('Not Found!', 400);

        return await this.requestsQueueRepository.create({
        ...dto,
        requestByUserId: dto.userId,
        userAccountId: userAccount.id,
        });
    }

    async list(accountId, userId, companyId, startDate, endDate, requestsQueueStatusId) {
        let requestDate = {
            [Op.gte]: startDate, // Больше или равно (включая startDate)
            [Op.lte]: endDate,
        }
        if (endDate == null)
            requestDate = startDate;
        return await this.requestsQueueRepository.findAll({
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
          ],
        });
    }
    
    async approve(id, dto) {
        const requestsQueue = await this.requestsQueueRepository.findOne({ where: { id } });

        if (!requestsQueue) throw new HttpException('Not Found!', 400);
        
        await requestsQueue.update({approveDate: dto.date, statusId: RequestStatus.APPROVED})
    }
        
    async reject(id, dto) {
        const requestsQueue = await this.requestsQueueRepository.findOne({ where: { id } });

        if (!requestsQueue) throw new HttpException('Not Found!', 400);
        
        await requestsQueue.update({ rejectDate: dto.date, purposeReject: dto.purposeReject, statusId: RequestStatus.REJECTED });
    }
    
    async issue(id, dto) {
        const requestsQueue = await this.requestsQueueRepository.findOne({
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

        if (!requestsQueue) throw new HttpException('Not Found!', 400);
        await this.createJournal(requestsQueue, dto);
        await requestsQueue.update({issueDate: dto.date, statusId: RequestStatus.ISSUED})
    }

    async createJournal(requestsQueue, dto) {
        const bankAccount = await this.accountService.getById(dto.bankAccountId);
        if (!bankAccount) throw new HttpException('Not Found!', 400);
        const journalDate = new Date()
          .toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
          })
          .replace(/\//g, '-');
        const journalObj = {
          entryTypeName: 'CASHADVANCE',
          companyId: requestsQueue.userAccount.companyId,
          userId: dto.userId,
          journalDate,
          transactionCurrency: dto.transactionCurrency,
          foreignCurrency: dto.foreignCurrency,
          exchangeRate: 1,
          documentDate: null,
          sourceRef: null,
          referenceTag: null,
          taxTypeId: 1,
          transactionDescription: '',
          journalList: [
            {
              id: requestsQueue.userAccount.accountId,
              code: requestsQueue.userAccount.account.code,
              name: requestsQueue.userAccount.account.name,
              debit: requestsQueue.amount,
              credit: 0,
              taxRate: requestsQueue.userAccount.account.assignToTaxAccountId,
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
              id: bankAccount.id,
              code: bankAccount.code,
              name: bankAccount.name,
              debit: 0,
              credit: requestsQueue.amount,
              taxRate: requestsQueue.userAccount.account.assignToTaxAccountId,
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
          ],
          transactionCode: 'SALES',
        };
        await this.transactionService.createJournalEntriesTransaction(journalObj);
    }
}
