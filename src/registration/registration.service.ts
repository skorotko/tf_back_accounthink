import { HttpException, Injectable } from "@nestjs/common";
import { AccountService } from "../account/account.service";
import { ClassesService } from "../classes/classes.service";
import { GroupService } from "../group/group.service";
import { CreateAllDto } from "./dto/create-all.dto"
import { TransactionEntryService } from "../transaction-entry/transaction-entry.service";
import { TransactionService } from "../transaction/transaction.service";
import { Op } from "sequelize";
import { CashReceiptService } from 'src/cash-receipt/cash-receipt.service';
import { ItemsService } from "../items/items.service";

@Injectable()
export class RegistrationService {

  constructor(
    private accountService: AccountService,
    private classesService: ClassesService,
    private groupService: GroupService,
    private cashReceiptService: CashReceiptService,
    private itemsService: ItemsService
  ) {}

  async create (
    companyId: number,
    currencyId: number,
    whereObj: object,
  ) {
    const classes = await this.classesService.getList(whereObj);
    const groups = await this.groupService.getList(whereObj);
    const accounts = await this.accountService.getList(whereObj);

    const newClasses = classes.map(x => {
      return {
        code: x.code,
        name: x.name,
        number: x.number,
        DRCRCode: x.DRCRCode,
        typeId: x.typeId,
        indelible: true,
        companyId: companyId,
        clashflowId: x.clashflowId,
        contra: x.contra,
        defaultId: x.id,
        createdDate: new Date()
      }
    });

    await this.classesService.createDefaultClassesForCompany(newClasses);
    await this.classesService.updateNewCompanyClassesFilePath(companyId);

    const newGroups = groups.map(x => {
      return {
        code: x.code,
        name: x.name,
        DRCRCode: x.DRCRCode,
        classId: x.classId,
        clashflowId: x.clashflowId,
        contra: x.contra,
        indelible: true,
        companyId: companyId,
        defaultId: x.id,
        defaultClassId: x.classId,
        remarks: x.remarks,
        transactionCode: x.transactionCode,
        createdDate: new Date()
      }
    });

    await this.groupService.createDefaultGroupsForCompany(newGroups);
    await this.groupService.updateNewCompanyGroups(companyId);

    const newAccounts = accounts.map(x => {
      return {
        code: x.code,
        name: x.name,
        companyId: companyId,
        currencyId: currencyId,
        indelible: true,
        DRCRCode: x.DRCRCode,
        groupId: x.groupId,
        parentId: x.parentId,
        active: true,
        defaultId: x.id,
        defaultGroupId: x.groupId,
        clashflowId: x.clashflowId,
        accountTypeId: x.accountTypeId,
        createdDate: new Date(),
        entityType: x.entityType
      }
    });

    await this.accountService.createDefaultAccountsForCompany(newAccounts);
    await this.accountService.updateNewCompanyAccounts(companyId);
  }

  async registerCompany(dto: CreateAllDto) {
    try {
      const companyClassCount = await this.classesService.checkCompanyClasses(dto.companyId);
      if (companyClassCount == 0) {

        let whereObj = {
          companyId: 0,
          code: {
            [Op.notIn]: dto.dbCodeArr
          }
        };

        await this.create(
          dto.companyId,
          dto.currencyId,
          whereObj
        )

      } else {
        throw new HttpException(`Account tree with this companyId already exist`, 400)
      }
    } catch (e) {
      // @TODO('Нормально обработать ошибки с базы')
      console.error(`\nERROR: \n${e}\n`);
      throw new HttpException(e.message, e.code)
    }
  }

  async clearAccountTree (companyId: number) {
    await TransactionEntryService.clearTransactionEntryByCompanyId(companyId);
    await TransactionService.clearTransactionByCompanyId(companyId);
    await this.accountService.clearAccountsByCompanyId(companyId);
    await this.groupService.clearGroupsByCompanyId(companyId);
    await this.classesService.clearClassesByCompanyId(companyId);
    await this.cashReceiptService.destroy(companyId);
  }

  async resetToDefaultAccountTree (data: CreateAllDto) {
    await this.clearAccountTree(data.companyId);
    await this.registerCompany(data);
  }

  async clearTransactionByCompanyId (companyId: number) {
    await TransactionEntryService.clearTransactionEntryByCompanyId(companyId);
    await TransactionService.clearTransactionByCompanyId(companyId);
    await this.itemsService.clearCompanyItemsTransactions(companyId);
  }

  async addToCompanyCOA (
    data: {
      companyId: number,
      currencyId: number,
      dbCodeArr: Array<string>,
      notLikeArr: Array<string>
    }
  ) {
    try {
      let checkAccount = await this.accountService.getList({
        companyId: data.companyId,
        code: {
          [Op.in]: data.dbCodeArr,
          [Op.notIn]: data.notLikeArr
        }
      });

      if (checkAccount.length === 0) {
        await this.create(
          data.companyId,
          data.currencyId,
          {
            companyId: 0,
            code: {
              [Op.in]: data.dbCodeArr,
              [Op.notIn]: data.notLikeArr
            }
          }
        )
      }
    } catch (e) {
      console.log(`\nERROR: \n${e}\n`);
      console.error(`\nERROR: \n${e}\n`);
      throw new HttpException(e, e.code)
    }
  }
}
