import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/sequelize";
import { Warehouse } from "./warehouse.model";
import { WarehouseDataDto } from "./dto/warehouse-data.dto";
import { Items } from "../items/models/items.model";
import { ItemsType } from "../items/models/items-type.model";
import { ItemsUnits } from "../items-units/items-units.model";
import { ItemsTransaction } from "../items/models/items-transaction.model";
import { Op } from "sequelize";

@Injectable()
export class WarehouseService {
  constructor(@InjectModel(Warehouse) private warehouseRepository: typeof Warehouse) {}

  async getById(id: number) {
    return await this.warehouseRepository.findOne({
      where: {
        id
      }
    })
  }

  async getListByCompanyId(companyId: number) {
    return await this.warehouseRepository.findAll({
      where: {
        companyId
      }
    })
  }

  async getListByBusinessUnitId(buId: number) {
    return await this.warehouseRepository.findAll({
      where: {
        buId
      },
      order: [['warehouseName', 'ASC']]
    })
  }

  async getListByCompanyIdWithItems(companyId: number, id: number | null) {
    let objWhere: any = {
      companyId
    };
    if (id !== null) {
      objWhere.id = id
    }
    return await this.warehouseRepository.findAll({
      where: objWhere,
      include: [
        {
          model: Items,
          include: [
            ItemsType,
            ItemsUnits,
            ItemsTransaction
          ]
        }
      ],
      order: [['warehouseName', 'ASC']]
    })
  }

  async create(data: WarehouseDataDto) {
    return await this.warehouseRepository.create(data);
  }

  async update(id: number, newData: WarehouseDataDto) {
    await this.warehouseRepository.update({
      ...newData
    }, {
      where: {
        id
      }
    });

    return await this.getById(id)
  }

  async delete(id: number) {
    let warehouse = await this.warehouseRepository.findByPk(id);
    if (warehouse.system) {
      return {
        data: null,
        err: "This is default system warehouse"
      }
    } else {
      return await this.warehouseRepository.destroy({
        where: {
          id
        }
      })
    }
  }

  async deleteAllForCompany(companyId: number) {
    return await this.warehouseRepository.destroy({
      where: {
        companyId,
        system: {
          [Op.not]: true
        }
      }
    })
  }
}
