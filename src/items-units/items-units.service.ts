import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/sequelize";
import { ItemsUnits } from "./items-units.model";
import { CreateItemsUnitDto } from "./dto/create.dto";
import { UpdateItemsUnitDto } from "./dto/update.dto";

@Injectable()
export class ItemsUnitsService {
  constructor ( @InjectModel(ItemsUnits) private readonly repository: typeof ItemsUnits ) {}

  async create(data: CreateItemsUnitDto) {
    return await this.repository.create(data)
  }

  async update(id: number, data: UpdateItemsUnitDto) {
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

  async getListByCompanyIdWithSortByName(companyId: number) {
    return await this.repository.findAll({
      where: {
        companyId
      },
      order: [['name', 'ASC']]
    })
  }
}
