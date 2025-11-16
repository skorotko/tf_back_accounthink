import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Classes } from "./classes.model";
import { CreateClassDto } from "./dto/create-class.dto";
import { UpdateClassDto } from "./dto/update-class.dto";
import { TypesService } from "../types/types.service";
import { GroupService } from "../group/group.service";
import { ExceptionHandler } from "@nestjs/core/errors/exception-handler";
import { Op } from "sequelize";

@Injectable()
export class ClassesService {

  constructor(@InjectModel(Classes) private classesRepository: typeof Classes) {}

  async createClass(dto: CreateClassDto) {
    let parentDRCRCode = await TypesService.getTypeDRCRCodeById(dto.typeId);

    let maxClassNumber = await this.classesRepository.count({
      where: {
        typeId: dto.typeId,
        companyId: dto.companyId
      }
    });

    let newClass = await this.classesRepository.create({
      companyId: dto.companyId,
      typeId: dto.typeId,
      name: dto.name,
      number: dto.number,
      filePath: '',
      DRCRCode: parentDRCRCode,
      code: `${dto.typeId}.${maxClassNumber + 1}`,
      contra: dto.contra,
      createdBy: dto.userId,
      createdDate: Date.now(),
      defaultId: maxClassNumber + 1,
    });
    await newClass.update({filePath: `[${dto.filePath},${newClass.id}]`});
    return newClass;
  }

  async getAllClasses() {
    return await this.classesRepository.findAll()
  }

  async getClassItem(id) {
    return await this.classesRepository.findByPk(id)
  }

  static async getClassCodesById(id) {
    let _class = await Classes.findByPk(id);
    if (_class === null) {
      throw new Error('class not found')
    }
    return {
      code: _class.code,
      DRCRCode: _class.DRCRCode
    }
  }

  async getClassByCompanyId(companyId) {
    return await this.classesRepository.findAll({
      where: {
        companyId
      },
      order: [['code', 'ASC']],
      raw: true
    })
  }

  async getList(objWhere = {}, include = [], order = [['id', 'ASC']]) {
    return await this.classesRepository.findAll({
      where: objWhere,
      include: include,
      // order
    })
  }

  async updateClass(id, updateClassDto: UpdateClassDto) {
    return await this.classesRepository.update({
      name: updateClassDto.name,
      number: updateClassDto.number,
      updatedBy: updateClassDto.userId,
      updatedDate: Date.now()
    }, {
      where: { id }
    })
  }

  async deleteClass(id) {
    let _class = await this.classesRepository.findByPk(id);
    let childGroupsCount = await GroupService.groupsCountByClass(id, _class.companyId);
    if (childGroupsCount > 0) {
      throw new HttpException('Class have child groups', 400)
    }
    return await _class.destroy()
  }

  async createDefaultClassesForCompany(data) {
    // console.log(`create classes default tree: ${data}`);
    return await this.classesRepository.bulkCreate(data)
  }

  async updateNewCompanyClassesFilePath(companyId) {
    return await this.classesRepository.sequelize.query(`
    UPDATE classes
      SET "filePath"=CONCAT('[', classes."typeId", ',', classes.id, ']')
      WHERE "companyId"=${companyId} AND indelible=true`);
  }

  async checkCompanyClasses(companyId) {
    return await this.classesRepository.count({
      where: { companyId }
    })
  }

  async clearClassesByCompanyId (companyId: number) {
    await this.classesRepository.destroy({
      where: {
        companyId
      }
    })
  }
}
