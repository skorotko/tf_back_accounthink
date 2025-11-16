import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/sequelize";
import { WithHoldingTaxRemark } from "./with-holding-tax-remark";

@Injectable()
export class WithHoldingTaxRemarkService {
    constructor(@InjectModel(WithHoldingTaxRemark) private readonly withHoldingTaxRemarkRepository: typeof WithHoldingTaxRemark) {
    }

    async getAll () {
        return await this.withHoldingTaxRemarkRepository.findAll({
            order: [['name', 'ASC']]
        })
    }
}
