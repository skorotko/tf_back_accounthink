import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateCategoriesDto } from './dto/create.dto';
import { UpdateCategoriesDto } from './dto/update.dto';
import { ItemsCategories } from './items-categories.model';

@Injectable()
export class ItemsCategoriesService {
	constructor(@InjectModel(ItemsCategories) private readonly repository: typeof ItemsCategories) { }

	async create(data: CreateCategoriesDto) {
		return await this.repository.create(data)
	}

	async update(id: number, data: UpdateCategoriesDto) {
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
		return await this.repository.findByPk(id)
	}

	async getListByCompanyId(companyId: number, groupId: number) {
		return await this.repository.findAll({
			where: {
				companyId,
				groupId,
				parentId: null
			}, 
			include: [
				{
					model: ItemsCategories
				}
			]
		})
	}
}
