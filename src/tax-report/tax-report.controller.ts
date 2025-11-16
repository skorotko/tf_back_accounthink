import {Controller, Get, Param} from '@nestjs/common';
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {TaxReportService} from "./tax-report.service";
import {GetTaxReportDto} from "./dto/get-tax-report.dto";

@Controller('tax-report')
export class TaxReportController {

  constructor(private readonly service: TaxReportService) {
  }
  @ApiOperation({ summary: '' })
  @ApiResponse({ status: 200, type: 'list' })
  @Get('clients/:companyId/:endDate')
  getSaleTaxReportClients(
    @Param() params: GetTaxReportDto
  ) {
    return this.service.getSaleTaxReportClients(params)
  }

  @ApiOperation({ summary: '' })
  @ApiResponse({ status: 200, type: 'list' })
  @Get('creditable/:companyId/:endDate')
  getSaleTaxReportCreditable(
    @Param() params: GetTaxReportDto
  ) {
    return this.service.getSaleTaxReportCreditable(params)
  }

  @ApiOperation({ summary: '' })
  @ApiResponse({ status: 200, type: 'list' })
  @Get('vendors/:companyId/:endDate')
  getSaleTaxReportVendors(
    @Param() params: GetTaxReportDto
  ) {
    return this.service.getSaleTaxReportVendor(params)
  }

  @ApiOperation({ summary: '' })
  @ApiResponse({ status: 200, type: 'list' })
  @Get('withholding/vendors/:companyId/:endDate')
  getWithholdingTaxReportVendors(
    @Param() params: GetTaxReportDto
  ) {
    return this.service.getWithholdingTaxReportVendor(params)
  }
}
