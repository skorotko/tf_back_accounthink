import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/sequelize";
import { Types } from "./types.model";
import { TaxTopLevelCategory, TaxType } from "../tax-type/tax-type.model";
import { Account } from "../account/account.model";

@Injectable()
export class TypesService {

  constructor(@InjectModel(Types) private typeRepository: typeof Types) {}

  async getAllTypes() {
    return await this.typeRepository.findAll({raw: true });
  }

  async getTypesWithTaxTypes(taxType: TaxTopLevelCategory) {
    return await this.typeRepository.findAll({
      include: {
        model: TaxType,
        where: {
          topType: taxType
        },
        include: [
          Account
        ]
      },
      order: [
        ['id', 'ASC'],
        ['taxType', 'id', 'ASC']
      ]
    });
  }

  static async getTypeDRCRCodeById(id) {
    let type = await Types.findByPk(id);
    return type.DRCRCode
  }
}
