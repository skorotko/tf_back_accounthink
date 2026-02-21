import { Controller, Get, Param } from "@nestjs/common";
import { AccountTreeService } from "./accountTree.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('AccountTree')
@Controller('accountTree')
export class AccountTreeController {

  constructor(private accountTreeService: AccountTreeService) {}

  @ApiOperation({summary: 'Get all types'})
  @ApiResponse({status: 200})
  @Get('/:companyId')
  getTreeByCompanyId(@Param('companyId') companyId: number) {
    return this.accountTreeService.getAccountTree(companyId)
  }

  @ApiOperation({ summary: 'Get all types' })
  @ApiResponse({ status: 200 })
  @Get('doubleTree/:companyId/:startDate/:endDate')
  getDoubleTreeByCompanyId(@Param() params: {
      companyId: number,
      startDate: string,
      endDate: string
    }) {
    return this.accountTreeService.getAccountDoubleTree(params)
  }
}
