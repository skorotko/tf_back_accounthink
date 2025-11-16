import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { CreateGroupDto } from "./dto/create-group.dto";
import { GroupService } from "./group.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Group } from "./group.model";
import { UpdateGroupDto } from "./dto/update-group.dto";

@ApiTags('Groups')
@Controller('groups')
export class GroupController {

  constructor(private groupService: GroupService) {}

  @ApiOperation({summary: 'Create group method'})
  @ApiResponse({status: 200, type: Group})
  @Post()
  create(@Body() groupDto: CreateGroupDto) {
    return this.groupService.createGroup(groupDto);
  }

  @ApiOperation({summary: 'Get all group method'})
  @ApiResponse({status: 200, type: [Group]})
  @Get()
  getAll() {
    return this.groupService.getAllGroups()
  }

  @ApiOperation({summary: 'Get one group by id'})
  @ApiResponse({status: 200, type: Group})
  @Get('/:id')
  getById(@Param('id') id: number) {
    return this.groupService.getById(id)
  }

  @ApiOperation({ summary: 'Get list group by companyId' })
  @ApiResponse({ status: 200, type: Group })
  @Get('getByCompanyId/:companyId')
  getByCompanyId(@Param('companyId') companyId: number) {
    return this.groupService.getAllGroupsByCompanyId(companyId);
  }

  @ApiOperation({summary: 'Update group method'})
  @ApiResponse({status: 200, type: Group})
  @Put('/:id')
  updateGroup(@Param('id') id: number, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.updateGroup(id, updateGroupDto)
  }

  @ApiOperation({summary: 'Delete group method'})
  @ApiResponse({status: 200, type: Group})
  @Delete('/:id')
  deleteClass(@Param('id') id: number) {
    return this.groupService.deleteGroup(id)
  }
}
