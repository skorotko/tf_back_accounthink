import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { WithHoldingTax } from "../with-holding-tax/with-holding-tax.model";
import { WithHoldingTaxRemarkService } from "./with-holding-tax-remark.service";

@Controller('with-holding-tax-remark')
export class WithHoldingTaxRemarkController {

    constructor(private readonly withHoldingTaxRemarkService: WithHoldingTaxRemarkService) {}

    @ApiOperation({summary: 'Get tax method'})
    @ApiResponse({status: 200, type: WithHoldingTax})
    @Get()
    async get() {
        return this.withHoldingTaxRemarkService.getAll();
    }
}
