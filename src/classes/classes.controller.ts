import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ClassesService } from "./classes.service";
import { CreateClassDto } from "./dto/create-class.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Classes } from "./classes.model";
import { UpdateClassDto } from "./dto/update-class.dto";

@ApiTags('Classes')
@Controller('classes')
export class ClassesController {

  constructor(private classesService: ClassesService) {}

  @ApiOperation({summary: 'Create class method'})
  @ApiResponse({status: 200, type: Classes})
  @Post()
  async create(@Body() classDto: CreateClassDto) {
    return this.classesService.createClass(classDto);
  }

  @ApiOperation({summary: 'Get all classes'})
  @ApiResponse({status: 200, type: [Classes]})
  @Get()
  getAll() {
    return this.classesService.getAllClasses()
  }

  @ApiOperation({summary: 'Get class by id'})
  @ApiResponse({status: 200, type: Classes})
  @Get('/:id')
  getClassById (@Param('id') id: number) {
    return this.classesService.getClassItem(id)
  }

  @ApiOperation({summary: 'Update class method'})
  @ApiResponse({status: 200, type: Classes})
  @Put('/:id')
  updateClass(@Param('id') id: number, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.updateClass(id, updateClassDto)
  }
  
  @ApiOperation({summary: 'Delete class method'})
  @ApiResponse({status: 200, type: Classes})
  @Delete('/:id')
  deleteClass(@Param('id') id: number) {
    return this.classesService.deleteClass(id)
  }
}
