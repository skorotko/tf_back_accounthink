import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateCategoryGroupDto } from './dto/create.dto';
import { UpdateCategoryGroupDto } from './dto/update.dto';
import { ItemsCategoryGroup } from './items-category-group.model';

@Injectable()
export class ItemsCategoryGroupService {
	constructor(@InjectModel(ItemsCategoryGroup) private readonly repository: typeof ItemsCategoryGroup) { }

	async create(data: CreateCategoryGroupDto) {
		return await this.repository.create(data)
	}

	async update(id: number, data: UpdateCategoryGroupDto) {
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

	async getListByCompanyId(companyId: number) {
		return await this.repository.findAll({
			where: {
				companyId
			}
		})
	}
}
