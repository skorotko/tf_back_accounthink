import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {PaymentMethod} from "./payment-method.model";
import {PaymentMethodDto} from "./dto/payment-method.dto";
import {PaymentMethodService} from "./payment-method.service";

@Controller('payment-method')
export class PaymentMethodController {
  constructor(
    private readonly paymentMethodService: PaymentMethodService
  ) {}

  @ApiOperation({summary: 'Create method'})
  @ApiResponse({status: 200, type: PaymentMethod})
  @Post()
  async create(
    @Body() data: PaymentMethodDto
  ) {
    return this.paymentMethodService.create(data);
  }

  @ApiOperation({summary: 'Update method'})
  @ApiResponse({status: 200, type: PaymentMethod})
  @Put('/:id')
  update(
    @Param('id') id: number,
    @Body() data: PaymentMethodDto
  ) {
    return this.paymentMethodService.update(id, data)
  }

  @ApiOperation({summary: 'Delete method'})
  @ApiResponse({status: 200, type: PaymentMethod})
  @Delete('/:id')
  delete(@Param('id') id: number) {
    return this.paymentMethodService.delete(id)
  }

  @ApiOperation({summary: 'Delete method'})
  @ApiResponse({status: 200, type: PaymentMethod})
  @Delete('delete/for-company/:companyId')
  deleteByCompanyId(@Param('companyId') companyId: number) {
    return this.paymentMethodService.deleteByCompanyId(companyId)
  }

  @ApiOperation({summary: 'Get one method'})
  @ApiResponse({status: 200, type: PaymentMethod})
  @Get('/:id')
  getOne(@Param('id') id: number) {
    return this.paymentMethodService.getOne(id)
  }

  @ApiOperation({summary: 'Get one method'})
  //@ApiResponse({status: 200, type: Array<PaymentMethod>})
  @Get('list/:companyId')
  getAllByCompanyId(@Param('companyId') companyId: number) {
    return this.paymentMethodService.getAllByCompanyId(companyId)
  }
}