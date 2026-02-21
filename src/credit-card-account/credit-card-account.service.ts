import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CreditCardAccount } from "./credit-card-account.model";
import { UpdateCreditCardAccountDto } from './dto/update-credit-card-account.dto';

@Injectable()
export class CreditCardAccountService {

  constructor(@InjectModel(CreditCardAccount) private creditCardAccountRepository: typeof CreditCardAccount) {}

  static async createCreditCardAccount(accountId, userId) {
    try {
      let data = {
        accountId,
        createdBy: userId,
        createdDate: Date.now(),
      }
      await CreditCardAccount.create(data);
    } catch (e) {
      console.log(e);
      //throw new HttpException(e.response, e.status)
    }
  }

  async updateCreditCardAccount(accountId, dto: UpdateCreditCardAccountDto) {
    try {
      return await this.creditCardAccountRepository.update({
        reconciliationDays: dto.reconciliationDays,
        reconciliationStartDate: dto.reconciliationStartDate,
        financialInstitution: dto.financialInstitution,
        creditLimit: dto.creditLimit,
        website: dto.website,
        cardNumber: dto.cardNumber,
        bankManagerName: dto.bankManagerName,
        bankManagerEmail: dto.bankManagerEmail,
        bankManagerPhone: dto.bankManagerPhone,
        BankManagerFax: dto.BankManagerFax,
        updatedBy: dto.userId,
        updatedDate: Date.now()
      }, {
        where: { accountId }
      })
    } catch (e) {
      console.log(e);
      throw new HttpException(e, 500)
    }
  }

}
