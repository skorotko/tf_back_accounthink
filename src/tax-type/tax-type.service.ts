import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/sequelize";
import { TaxTopLevelCategory, TaxType } from "./tax-type.model";
import { TypesService } from "../types/types.service";

@Injectable()
export class TaxTypeService {
    constructor (
        @InjectModel(TaxType) private readonly taxTypeRepository: typeof TaxType,
        private readonly typeService: TypesService
    ) {}

    async getAllByType (type: TaxTopLevelCategory) {
        return this.taxTypeRepository.findAll({
            where: {
                topType: type
            }
        })
    }

    async getTypesWithTaxTypes () {
        let sale = await this.typeService.getTypesWithTaxTypes(TaxTopLevelCategory.sale);
        let withholding = await this.typeService.getTypesWithTaxTypes(TaxTopLevelCategory.withholding);
        return {
            sale,
            withholding
        }
    }

    async getAll () {
        return await this.taxTypeRepository.findAll()
    }

    async getById (id) {
        return await this.taxTypeRepository.findAll({
            where: {
                id
            }
        })
    }
}
