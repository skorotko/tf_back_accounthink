import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/sequelize";
import { CreateTaxRateDto } from "./dto/CreateTaxRateDto";
import { TaxRate } from "./tax-rate.model"
import { TaxTopLevelCategory } from "../tax-type/tax-type.model";

@Injectable()
export class TaxRateService {
    constructor(@InjectModel(TaxRate) private readonly taxRateRepository: typeof TaxRate) {}

    async create (data: CreateTaxRateDto, transaction) {
        return await this.taxRateRepository.create(
          data,
          { transaction }
        )
    }

    async bulkCreate(data: CreateTaxRateDto[], transaction) {
        return await this.taxRateRepository.bulkCreate(
          data,
          { transaction }
        )
    }

    async updateByTaxIdAndTaxType (data: {
        taxId: number,
        taxType: TaxTopLevelCategory,
        rate: number
    }) {
        if (data.taxType == TaxTopLevelCategory.sale) {
            return this.taxRateRepository.update({
                rate: data.rate
            }, {
                where: {
                    saleTaxId: data.taxId
                }
            })
        } else {
            return this.taxRateRepository.update({
                rate: data.rate
            }, {
                where: {
                    withHoldingTaxId: data.taxId
                }
            })
        }
    }

    async delete (condition, transaction) {
        return await this.taxRateRepository.destroy({
            where: condition,
            transaction
        })
    }
}
