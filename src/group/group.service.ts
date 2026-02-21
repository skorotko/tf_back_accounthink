import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Group } from "./group.model";
import { CreateGroupDto } from "./dto/create-group.dto";
import { ClassesService } from "../classes/classes.service";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { AccountService } from "../account/account.service";

@Injectable()
export class GroupService {

    constructor(@InjectModel(Group) private groupRepository: typeof Group) {}

    async createGroup(dto: CreateGroupDto) {
        try {
            let parentCodes = await ClassesService.getClassCodesById(dto.classId);

            let maxGroupNumber = await this.groupRepository.count({
                where: {
                    classId: dto.classId,
                    companyId: dto.companyId
                }
            });

            let newGroup = await this.groupRepository.create({
              companyId: dto.companyId,
              classId: dto.classId,
              clashflowId: dto.clashflowId,
              name: dto.name,
              number: dto.number,
              filePath: '',
              code: `${parentCodes.code.split(',').join('.')}.${
                maxGroupNumber + 1
              }`,
              DRCRCode: dto.contra ? dto.DRCRCode : parentCodes.DRCRCode,
              contra: dto.contra,
              active: dto.active,
              createdBy: dto.userId,
              createdDate: Date.now(),
              defaultId: null,
            });

            await newGroup.update({filePath: `[${dto.filePath},${newGroup.id}]`});
            return newGroup;
        } catch (e) {
            return {
                error: e,
                errorMessage: e.message,
                status: 404
            }
        }
    }

    async getAllGroups() {
        return await this.groupRepository.findAll();
    }

    async getAllGroupsByCompanyId(companyId) {
        return await this.groupRepository.findAll({
            where: {
                companyId
            },
            order: [['code', 'ASC']],
            raw: true
        });
    }

    async getList(objWhere = {}, include = [], order = [['id', 'ASC']]) {
        return await this.groupRepository.findAll({
            where: objWhere,
            include: include,
            // order
        })
    }

    static async getAllGroupsByCompanyId(companyId) {
        return await Group.findAll({
            where: {
                companyId
            },
            raw: true
        });
    }

    static async getGroupCodesById(id) {
        let group = await Group.findByPk(id);
        if (group === null)
            throw new HttpException('Group not found', 404);
        return {
            code: group.code,
            DRCRCode: group.DRCRCode
        }
    }

    static async getCompanyGroupByDefaultId(companyId: number, id: number) {
        return await Group.findOne({
            where: {
                companyId,
                defaultId: id
            }
        })
    }

    static async getGroupTransactionCodeById(id) {
        let group = await Group.findByPk(id);
        if (group === null)
            throw new HttpException('Group not found', 404);
        return group.transactionCode;
    }

    async getById(id) {
        return await this.groupRepository.findByPk(id);
    }

    async updateGroup(id, updateGroupDto: UpdateGroupDto) {
        let group = await this.groupRepository.findByPk(id);
        if (group.DRCRCode != updateGroupDto.DRCRCode) {
            await AccountService.updateAccountDRCRCodeByGroup(id, group.companyId, updateGroupDto.DRCRCode)
        }

        return this.groupRepository.update({
            name: updateGroupDto.name,
            number: updateGroupDto.number,
            DRCRCode: updateGroupDto.DRCRCode,
            contra: updateGroupDto.contra,
            active: updateGroupDto.active,
        }, {
            where: { id }
        })
    }

    static async groupsCountByClass(classId, companyId) {
        return await Group.count({
            where: {
                classId,
                companyId
            }
        })
    }

    async deleteGroup(id) {
        try {
            let group = await this.groupRepository.findByPk(id);
            let childAccountsCount = await AccountService.getAccountsCountByGroup(id, group.companyId);
            if (group.indelible)
                throw new HttpException('This group indelible', 400);
            if (childAccountsCount > 0)
                throw new HttpException('Group have child accounts', 400);
            return await group.destroy()
        } catch (e) {
            throw new HttpException(e.response, e.status)
        }
    }

    async createDefaultGroupsForCompany(data) {
        // console.log(`create group default tree: ${data}`);
        return await this.groupRepository.bulkCreate(data)
    }

    async updateNewCompanyGroups(companyId) {
        return await this.groupRepository.sequelize.query(`
          UPDATE groups
            SET "classId"=classes.id
            FROM classes
            WHERE groups."defaultClassId" = classes."defaultId" AND groups."companyId"=${companyId} AND classes."companyId"=${companyId};
            
          UPDATE groups
            SET "filePath"=CONCAT('[', classes."typeId", ',', classes.id, ',', groups.id, ']')
            FROM classes
            WHERE groups."classId" = classes.id AND groups."companyId"=${companyId} AND classes."companyId"=${companyId}`);
    }

    async clearGroupsByCompanyId (companyId: number) {
        await this.groupRepository.destroy({
            where: {
                companyId
            }
        })
    }
}
