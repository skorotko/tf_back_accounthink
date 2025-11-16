import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {PaymentMethod} from "./payment-method.model";
import {PaymentMethodDto} from "./dto/payment-method.dto";
import {AccountService} from "../account/account.service";

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectModel(PaymentMethod) private readonly paymentMethodRepository: typeof PaymentMethod,
    private readonly accountService: AccountService
  ) {}

    async create (data: PaymentMethodDto) {
      const newPaymentMethod = await this.paymentMethodRepository.create({
        ...data
      });

      return await this.getOne(newPaymentMethod.id)
    }

    async update (id: number, data: PaymentMethodDto) {
      return await this.paymentMethodRepository.update({
        ...data
      }, {
        where: {
          id
        }
      })
    }

    async delete (id: number) {
      return await this.paymentMethodRepository.destroy({
        where: {
          id
        }
      })
    }

  async deleteByCompanyId (companyId: number) {
    return await this.paymentMethodRepository.destroy({
      where: {
        companyId
      }
    })
  }

    async getOne (id: number) {
      const paymentMethod = await this.paymentMethodRepository.findOne({ where: { id } });

      if (paymentMethod && paymentMethod.accountId.length > 0) {
        paymentMethod.setDataValue('accounts', await this.accountService.findById(paymentMethod.accountId));
      }

      return paymentMethod
    }

    async getAllByCompanyId (companyId: number) {
      const paymentMethodList = await this.paymentMethodRepository.findAll({
        where: {
          companyId
        }
      });
      const paymentMethodListNew = Promise.all(paymentMethodList.map(async pm => {
        if (pm && pm.accountId.length > 0) {
          pm.setDataValue('accounts', await this.accountService.findById(pm.accountId));
        }
        return pm;
      }));
      // console.log(await paymentMethodListNew);
      return await paymentMethodListNew;
    }
}
