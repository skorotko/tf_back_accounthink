import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from "@nestjs/sequelize";
import { WithHoldingTax } from "./with-holding-tax.model";
import { TaxRateService } from "../tax-rate/tax-rate.service";
import { CreateWithHoldingTaxDto } from "./dto/create-with-holding-tax.dto";
import { CreateTaxRateDto } from "../tax-rate/dto/CreateTaxRateDto";
import { UpdateWithHoldingTaxDto } from "./dto/update-with-holding-tax.dto";
import { TaxRate } from "../tax-rate/tax-rate.model";
import { TaxTopLevelCategory, TaxType } from "../tax-type/tax-type.model";
import { WithHoldingTaxRemark } from "../with-holding-tax-remark/with-holding-tax-remark";
import { BulkCreateWithHoldingTaxDto } from "./dto/bulk-create-withholding-tax.dto";
import { Op } from "sequelize";

@Injectable()
export class WithHoldingTaxService {
    constructor(
        @InjectModel(WithHoldingTax) private readonly withHoldingTaxRepository: typeof WithHoldingTax,
        private readonly taxRateService: TaxRateService
    ) {}

    async create(taxData: CreateWithHoldingTaxDto, taxRateData: CreateTaxRateDto) {
        const transaction = await this.withHoldingTaxRepository.sequelize.transaction();

        let newTax;

        try {
            newTax = await this.withHoldingTaxRepository.create(
              taxData,
              { transaction }
            );

            newTax.setDataValue('rate', [
                await this.taxRateService.create({
                    withHoldingTaxId: newTax.id,
                    ...taxRateData
                }, transaction)
            ]);

            await transaction.commit();
        } catch (err) {
            console.log(err);
            await transaction.rollback();
            throw new InternalServerErrorException(`Failed to create tax data: ${err.message}`);
        }

        return await this.getOne(newTax.id)
    };

    async bulkCreate (taxData: BulkCreateWithHoldingTaxDto[]) {
        const taxRecords: any[] = [];
        const taxRateRecords: any[] = [];

        for (const tax of taxData) {
            const taxRecord: any = {
                countryId: tax.countryId,
                typeId: tax.typeId,
                name: tax.name,
                code: tax.code,
                remarkId: tax.remarkId,
                description: tax.description
            };
            taxRecords.push(taxRecord);

            const taxRateRecord: any = {
                withHoldingTaxId: null,
                saleTaxId: null,
                rate: tax.rate,
                financeYear: tax.financeYear
            };
            taxRateRecords.push(taxRateRecord);
        }

        const transaction = await this.withHoldingTaxRepository.sequelize.transaction();

        await this.taxRateService.delete({
            withHoldingTaxId: {
                [Op.not]: null
            }
        }, transaction);

        await this.withHoldingTaxRepository.destroy({
            where: {},
            transaction
        });

        try {
            const createdTaxes = await this.withHoldingTaxRepository.bulkCreate(
              taxRecords,
              {
                  returning: true,
                  transaction
              });

            for (let i = 0; i < createdTaxes.length; i++) {
                taxRateRecords[i].withHoldingTaxId = createdTaxes[i].id;
            }

            await this.taxRateService.bulkCreate(
              taxRateRecords,
              transaction
            );

            await transaction.commit();
        } catch (err) {
            console.log(err);
            await transaction.rollback();
            throw new InternalServerErrorException(`Failed to create tax data: ${err.message}`);
        }
    }

    async update (
      id: number,
      data: UpdateWithHoldingTaxDto,
      rate: number
    ) {
        await this.withHoldingTaxRepository.update({
            ...data
        }, {
            where: {
                id
            }
        });

        await this.taxRateService.updateByTaxIdAndTaxType({
            taxId: id,
            taxType: TaxTopLevelCategory.withholding,
            rate
        });

        return await this.getOne(id)
    }

    async delete (id: number) {
        return await this.withHoldingTaxRepository.destroy({
            where: {
                id
            }
        })
    }

    async getOne (id: number) {
        return await this.withHoldingTaxRepository.findOne({
            where: {
                id
            },
            include: [
                TaxRate,
                TaxType,
                WithHoldingTaxRemark
            ]
        })
    }
    

    async getAllByCountryId (countryId: number, remarkId: number | null = null, typeId: number | null = null) {
        let whereObj: any = {
            countryId
        };
        if (remarkId) {
            whereObj.remarkId = remarkId
        }
        if (typeId) {
            whereObj.typeId = typeId
        }
        return await this.withHoldingTaxRepository.findAll({
            where: whereObj,
            include: [
                TaxType,
                TaxRate,
                WithHoldingTaxRemark
            ],
            order: [['typeId', 'ASC'], [{ model: TaxRate, as: 'rate' }, 'rate', 'ASC'], ['code', 'ASC']]
        })
    }

    async getAll() {
        return await this.withHoldingTaxRepository.findAll({
            include: [
                TaxType,
                TaxRate,
                WithHoldingTaxRemark
            ]
        })
    }

    async changeActiveStatus (id: number, status: boolean) {
        return await this.withHoldingTaxRepository.update({
            active: status
        }, {
            where: {
                id
            }
        })
    }

    async getAllByTypeId (typeId: Array<number>) {
        return await this.withHoldingTaxRepository.findAll({
            where: {
                typeId
            },
            include: [
                TaxType
            ]
        })
    }

    async getAllByIdList (idList: number | Array<number>, includeArr: Array<Object> = []) {
        return await this.withHoldingTaxRepository.findAll({
            where: {
                id: idList
            },
            include: includeArr
        })
    }
}
