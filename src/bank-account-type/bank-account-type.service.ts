import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BankAccountType } from "./bank-account-type.model";
import { CreateBankAccountTypeDto } from './dto/create-bank-account-type.dto';
import { UpdateBankAccountTypeDto } from './dto/update-bank-account-type.dto';

@Injectable()
export class BankAccountTypeService {
	constructor(@InjectModel(BankAccountType) private bankAccountTypeRepository: typeof BankAccountType) { }
	
	async create(companyId: number, dto: CreateBankAccountTypeDto) {
		try {
			return await this.bankAccountTypeRepository.create({
				name: dto.name,
				code: dto.code,
				companyId
			})
		} catch (e) {
			console.log(e);
			throw new HttpException(e, 500)
		}
	}

	async update(id: number, dto: UpdateBankAccountTypeDto) {
		try {
			return await this.bankAccountTypeRepository.update({
				name: dto.name,
				code: dto.code
			}, {where: {id}});
		} catch (e) {
			console.log(e);
			throw new HttpException(e, 500)
		}
	}

	async getList(companyId: number) {
		try {
			let result: any = await this.bankAccountTypeRepository.findAll({ where: { companyId }, order: [['name', 'ASC']] });
			result = result.map(x => {
				x.dataValues.createdDate = Date.now();
				return x;
			}); 
			return result;
		} catch (e) {
			console.log(e);
			throw new HttpException(e, 500)
		}
	}

	async getItem(id: number) {
		try {
			return await this.bankAccountTypeRepository.findOne({ where: { id } });
		} catch (e) {
			console.log(e);
			throw new HttpException(e, 500)
		}
	}

	async delete(id: number) {
		try {
			await this.bankAccountTypeRepository.destroy({ where: { id } });
		} catch (e) {
			console.log(e);
			throw new HttpException(e, 500)
		}
	}
}
