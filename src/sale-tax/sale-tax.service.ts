import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { SaleTax } from "./sale-tax.model";
import { TaxRateService } from "../tax-rate/tax-rate.service";
import { CreateSaleTaxDto } from "./dto/CreateSaleTax";
import { CreateTaxRateDto } from "../tax-rate/dto/CreateTaxRateDto";
import { UpdateSaleTaxDto } from "./dto/UpdateSaleTaxDto";
import { TaxRate } from "../tax-rate/tax-rate.model";
import { TaxTopLevelCategory, TaxType } from "../tax-type/tax-type.model";
import { ZeroTaxTypeService } from "../zero-tax-type/zero-tax-type.service";
import { ZeroTaxType } from "../zero-tax-type/zero-tax-type.model";
import { BulkCreateSaleTaxDto } from "./dto/bulk-create-sale-tax.dto";
import { Op } from "sequelize";

@Injectable()
export class SaleTaxService {
    constructor (
        @InjectModel(SaleTax) private readonly saleTaxRepository: typeof SaleTax,
        private readonly taxRateService: TaxRateService,
        private readonly zeroTaxTypeService: ZeroTaxTypeService
    ) {}

    async create (taxData: CreateSaleTaxDto, taxRateData: CreateTaxRateDto) {
        const defaultZeroTaxType = await this.zeroTaxTypeService.getOneByName('Default');
        if (defaultZeroTaxType.id !== taxData.taxTypeId) {
            const tax = await this.saleTaxRepository.findOne({
                where: {
                    countryId: taxData.countryId,
                    typeId: taxData.typeId,
                    taxTypeId: taxData.taxTypeId
                }
            });
            if (tax !== null) {
                throw new Error(`Tax with with this type and sub type already exists`);
            }
        }

        const transaction = await this.saleTaxRepository.sequelize.transaction();

        let newTax;

        try {
            newTax = await this.saleTaxRepository.create(
              taxData,
              { transaction }
            );

            newTax.setDataValue('rate', [
                await this.taxRateService.create({
                    saleTaxId: newTax.id,
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
    }

    async bulkCreate (taxData: BulkCreateSaleTaxDto[]) {
        const taxRecords: any[] = [];
        const taxRateRecords: any[] = [];

        for (const tax of taxData) {
            const taxRecord: any = {
                countryId: tax.countryId,
                taxTypeId: tax.taxTypeId,
                typeId: tax.typeId,
                name: tax.name,
                code: tax.code,
                viewCode: tax.viewCode,
                description: tax.description
            };
            taxRecords.push(taxRecord);

            const taxRateRecord: any = {
                saleTaxId: null,
                withHoldingTaxId: null,
                rate: tax.rate,
                financeYear: tax.financeYear
            };
            taxRateRecords.push(taxRateRecord);
        }

        const transaction = await this.saleTaxRepository.sequelize.transaction();

        await this.taxRateService.delete({
            saleTaxId: {
                [Op.not]: null
            }
        }, transaction);

        await this.saleTaxRepository.destroy({
            where: {},
            transaction
        });

        try {
            const createdTaxes = await this.saleTaxRepository.bulkCreate(
              taxRecords,
              {
                  returning: true,
                  transaction
              });

            for (let i = 0; i < createdTaxes.length; i++) {
                taxRateRecords[i].saleTaxId = createdTaxes[i].id;
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
      data: UpdateSaleTaxDto,
      rate: number
    ) {
        await this.saleTaxRepository.update({
            ...data
        }, {
            where: {
                id
            }
        });

        await this.taxRateService.updateByTaxIdAndTaxType({
            taxId: id,
            taxType: TaxTopLevelCategory.sale,
            rate
        });

        return await this.getOne(id)
    }

    async delete (id: number) {
        return await this.saleTaxRepository.destroy({
            where: {
                id
            }
        })
    }

    async getOne (id: number) {
        return await this.saleTaxRepository.findOne({
            where: {
                id
            },
            include: [
                TaxType,
                TaxRate
            ]
        })
    }

    async getAll() {
        return await this.saleTaxRepository.findAll({
            include: [
                TaxType,
                TaxRate
            ]
        })
    }

    async getAllByCountryId (countryId: number) {
        return await this.saleTaxRepository.findAll({
            where: {
                countryId
            },
            include: [
                TaxType,
                TaxRate,
                ZeroTaxType
            ],
            order: [['typeId', 'ASC'], [{ model: TaxRate, as: 'rate' }, 'rate', 'ASC'], ['code', 'ASC']]
        })
    }

    async changeActiveStatus (id: number, status: boolean) {
        return await this.saleTaxRepository.update({
            active: status
        }, {
            where: {
                id
            }
        })
    }

    async getAllByTypeId (typeId: Array<number>) {
        return await this.saleTaxRepository.findAll({
            where: {
                typeId
            },
            include: [
              TaxType
            ]
        })
    }

    async getAllByIdList (idList: number | Array<number>, includeArr: Array<Object> = []) {
        return await this.saleTaxRepository.findAll({
            where: {
                id: idList
            },
            include: includeArr
        })
    }
}
