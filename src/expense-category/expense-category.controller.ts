import { Body, Controller, Post, Get, Param, Patch, Put, Delete } from '@nestjs/common';
import { CreateExpenseCategoryDto } from './dto/CreateExpenseCategoryDto.dto';
import { ExpenseCategoryService } from './expense-category.service';

@Controller('expense-category')
export class ExpenseCategoryController {
  constructor(
    private readonly expenseCategoryService: ExpenseCategoryService,
  ) {}

  @Post()
  create(@Body() dto: CreateExpenseCategoryDto) {
    return this.expenseCategoryService.create(dto);
  }

  @Get('list/:companyId')
  getListByCompanyId(@Param() params: { companyId: number }) {
    return this.expenseCategoryService.list(params.companyId);
  }

  @Get('/:id')
  getOneById(@Param() params: { id: number }) {
    return this.expenseCategoryService.findOneById(params.id);
  }

  @Put('/:id')
  update(
    @Param() params: { id: number },
    @Body() dto: CreateExpenseCategoryDto,
  ) {
    return this.expenseCategoryService.update(params.id, dto);
  }

  @Delete('/:id')
  delete(@Param() params: { id: number }) {
    return this.expenseCategoryService.delete(params.id);
  }
}
