import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { ZeroTaxType } from "./zero-tax-type.model";


@Injectable()
export class ZeroTaxTypeService {
  constructor(
    @InjectModel(ZeroTaxType) private readonly zeroTaxTypeRepository: typeof ZeroTaxType
  ) {}

  async getAllByObjects() {
    const transaction = await this.zeroTaxTypeRepository.sequelize.transaction();
    try {
      const byDefault = await this.zeroTaxTypeRepository.findOne({
        where: {
          name: 'Default'
        },
        transaction
      });
      const noTax = await this.zeroTaxTypeRepository.findOne({
        where: {
          name: 'No Tax'
        },
        transaction
      });
      const noTaxSP = await this.zeroTaxTypeRepository.findOne({
        where: {
          name: 'No Tax S/P'
        },
        transaction
      });
      const zeroTax = await this.zeroTaxTypeRepository.findOne({
        where: {
          name: 'Zero Tax'
        },
        transaction
      });
      const taxExempt = await this.zeroTaxTypeRepository.findOne({
        where: {
          name: 'Tax Exempt'
        },
        transaction
      });
      await transaction.commit();
      return {
        byDefault,
        noTax,
        noTaxSP,
        zeroTax,
        taxExempt
      };
    } catch (e) {
      await transaction.rollback();
      throw new Error(`Failed to execute zeroTaxTypeService.getAllByObjects: ${e}`);
    }
  }

  async getOneByName (name) {
    return await this.zeroTaxTypeRepository.findOne({
      where: {
        name
      }
    })
  }

  async getAll() {
    return await this.zeroTaxTypeRepository.findAll()
  }
}
