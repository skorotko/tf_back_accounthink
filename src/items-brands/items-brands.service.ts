import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/sequelize";
import { ItemsBrands } from "./items-brands.model";
import { CreateItemsBrandDto } from "./dto/create.dto";
import { UpdateItemsBrandDto } from "./dto/update.dto";

@Injectable()
export class ItemsBrandsService {
  constructor ( @InjectModel(ItemsBrands) private readonly brandsRepository: typeof ItemsBrands ) {}

  async create(data: CreateItemsBrandDto) {
    return await this.brandsRepository.create(data)
  }

  async update(id: number, data: UpdateItemsBrandDto) {
    return await this.brandsRepository.update({
      ...data
    }, {
      where: {
        id
      }
    })
  }

  async delete(id: number) {
    return await this.brandsRepository.destroy({
      where: {
        id
      }
    })
  }

  async getById(id: number) {
    return await this.brandsRepository.findOne({
      where: {
        id
      }
    })
  }

  async getListByCompanyId(companyId: number) {
    return await this.brandsRepository.findAll({
      where: {
        companyId
      }
    })
  }
}
