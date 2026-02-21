import { Body, Controller, Post, Get, Param, Patch, Put } from '@nestjs/common';
import { RequestsQueueService } from './requests-queue.service';
import { CreateRequestDto } from './dto/CreateRequestDto.dto';
import { UpdateRequestDto } from './dto/UpdateRequestDto.dto';
import { UpdateStatusRequestDto } from './dto/UpdateStatusRequestDto.dto';
import {UpdateIssueRequestDto} from './dto/UpdateIssueRequestDto.dto'

@Controller('requests-queue')
export class RequestsQueueController {
    constructor(private readonly requestsService: RequestsQueueService) {}

    @Post()
    create(@Body() createRequestDto: CreateRequestDto) {
        return this.requestsService.create(createRequestDto);
    }
    
    @Get('list/:accountId/:userId/:companyId/:requestsQueueStatusId/:startDate/:endDate')
    listCashAccountByUserId(@Param() params: { accountId: number, userId: number, companyId: number, startDate: string, endDate: string, requestsQueueStatusId: number}) {
        return this.requestsService.list(params.accountId, params.userId, params.companyId, params.startDate, params.endDate, params.requestsQueueStatusId);
    }

    @Put('approve/:id')
    approve(@Param() params: { id: number }, @Body() updateStatusRequestDto: UpdateStatusRequestDto) {
        return this.requestsService.approve(params.id, updateStatusRequestDto);
    }

    @Put('reject/:id')
    reject(@Param() params: { id: number }, @Body() updateStatusRequestDto: UpdateStatusRequestDto) {
        return this.requestsService.reject(params.id, updateStatusRequestDto);
    }

    @Put('issue/:id')
    issue(@Param() params: { id: number }, @Body() UpdateIssueRequestDto: UpdateIssueRequestDto) {
        return this.requestsService.issue(params.id, UpdateIssueRequestDto);
    }

//   @Get(':id')
//   async findOne(@Param('id') id: string) {
//     return this.requestsService.findOne(+id);
//   }

//   @Patch(':id')
//   async update(
//     @Param('id') id: string,
//     @Body() updateRequestDto: UpdateRequestDto,
//   ) {
//     return this.requestsService.update(+id, updateRequestDto);
//   }
}