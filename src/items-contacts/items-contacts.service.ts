import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateItemsContactsDto } from './dto/create.dto';
import { UpdateItemsContactsDto } from './dto/update.dto';
import { ItemsContacts } from './items-contacts.model';

@Injectable()
export class ItemsContactsService {
	constructor(@InjectModel(ItemsContacts) private readonly repository: typeof ItemsContacts) { }

	async create(data: CreateItemsContactsDto) {
		return await this.repository.create(data)
	}

	async update(id: number, data: UpdateItemsContactsDto) {
		return await this.repository.update({
			...data
		}, {
			where: {
				id
			}
		})
	}

	async delete(id: number) {
		return await this.repository.destroy({
			where: {
				id
			}
		})
	}

	async getById(id: number) {
		return await this.repository.findOne({
			where: {
				id
			}
		})
	}

	async getListByCompanyId(companyId: number) {
		return await this.repository.findAll({
			where: {
				companyId
			}
		})
	}
}
