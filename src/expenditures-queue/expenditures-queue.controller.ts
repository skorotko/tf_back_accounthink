import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CreateExpenditureDto } from './dto/CreateExpenditureDto';
import { ExpendituresQueueService } from './expenditures-queue.service';
import { UpdateStatusExpenditureDto } from './dto/UpdateStatusExpenditureDto.dto';
import { UpdateRejectExpenditureDto } from './dto/UpdateRejectExpenditureDto.dto';
import { UpdateExpenditureDto } from './dto/UpdateExpenditureDto';

@Controller('expenditures-queue')
export class ExpendituresQueueController {
  constructor(private readonly expendituresService: ExpendituresQueueService) {}

  @Post()
  create(@Body() createRequestDto: CreateExpenditureDto) {
    console.log('create');
    return this.expendituresService.create(createRequestDto);
  }

  @Get(
    'list/:accountId/:userId/:companyId/:expendituresQueueStatusId/:startDate/:endDate',
  )
  listCashAccountByUserId(
    @Param()
    params: {
      accountId: number;
      userId: number;
      companyId: number;
      startDate: string;
      endDate: string;
      expendituresQueueStatusId: number;
    },
  ) {
    return this.expendituresService.list(
      params.accountId,
      params.userId,
      params.companyId,
      params.startDate,
      params.endDate,
      params.expendituresQueueStatusId,
    );
  }

  @Put('approve/:id')
  approve(
    @Param() params: { id: number },
    @Body() updateStatusRequestDto: UpdateStatusExpenditureDto,
  ) {
    return this.expendituresService.approve(params.id, updateStatusRequestDto);
  }

  @Put('reject/:id')
  reject(
    @Param() params: { id: number },
    @Body() updateStatusRequestDto: UpdateStatusExpenditureDto,
  ) {
    return this.expendituresService.reject(params.id, updateStatusRequestDto);
  }

  @Put('liquidate/:id')
  issue(
    @Param() params: { id: number },
    @Body() UpdateRejectExpenditureDto: UpdateRejectExpenditureDto,
  ) {
    return this.expendituresService.liquidate(
      params.id,
      UpdateRejectExpenditureDto,
    );
  }

  //   @Get(':id')
  //   async findOne(@Param('id') id: string) {
  //     return this.requestsService.findOne(+id);
  //   }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() UpdateExpenditureDto: UpdateExpenditureDto,
  ) {
    return this.expendituresService.update(id, UpdateExpenditureDto);
  }
}
