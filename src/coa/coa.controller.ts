import { BadRequestException, Body, Controller, Get, InternalServerErrorException, NotFoundException, Post, Put, Query } from '@nestjs/common';
import { CoaService } from './coa.service';
import { CreateCoaDto } from './dto/create-coa.dto';

@Controller('coa')
export class CoaController {
    constructor(private coaService: CoaService) {}

    @Post('defaultCoA')
    async create(@Body() dto: CreateCoaDto): Promise<any> {
        const {
            businessFormationId,
            businessTypeId,
            methodOfAccountingId,
            currencyId,
            companyId
        } = dto;

        if (businessFormationId <= 0 || businessTypeId <= 0 || methodOfAccountingId <= 0) {
            throw new BadRequestException('businessFormationId, businessTypeId, or methodOfAccountingId is invalid');
        }

        if (currencyId <= 0) {
            throw new BadRequestException('Invalid currency ID');
        }

        const companyHasCoA = await this.coaService.companyHasCoA(companyId);
        if (companyHasCoA) {
            throw new BadRequestException('Company already has CoA.');
        }

        const created = await this.coaService.createDefaultCOA(dto);
        if (created) {
            const coaTreeCollection = await this.coaService.getFlattenCoATree(companyId, null);
            return ({ tree: coaTreeCollection });
        }

        throw new BadRequestException();
    }

    @Get('coaTree')
    async getMethodMapping(
        @Query('companyId') companyId: number, // companyId как параметр в URL
        @Query('showInactive') showInactive: boolean = false, // Параметр showInactive через Query
    ) {
        try {
            // Вызов сервиса для получения дерева CoA
            const coaTreeCollection = await this.coaService.getFlattenCoATree(companyId, null, showInactive);

            // Если данных нет, выбрасываем ошибку 404
            if (!coaTreeCollection) {
                throw new NotFoundException(`CoA tree not found for companyId: ${companyId}`);
            }

            // Возвращаем успешный результат с данными
            return coaTreeCollection;
        } catch (error) {
            // Логируем ошибку, если нужно
            console.error(error);

            // Возвращаем ошибку 500 в случае неудачного запроса
            throw new InternalServerErrorException('An error occurred while processing your request.');
        }
    }

    @Put('switchCoA')
    async switchCoA(@Query('companyId') companyId: number, @Body() dto: CreateCoaDto) {
        if (companyId <= 0) {
            throw new NotFoundException('CompanyId is invalid.')
        }
        if (
          dto.businessFormationId <= 0 ||
          dto.businessTypeId <= 0 ||
          dto.methodOfAccountingId <= 0
        ) {
            throw new NotFoundException('businessFormationId, businessTypeId, or methodOfAccountingId is invalid.');
        }

        const hasCoA = await this.coaService.companyHasCoA(companyId);
        if (!hasCoA) {
            throw new NotFoundException("Company doesn't have CoA to switch or modify");
        }

        const modified = await this.coaService.switchCoA(companyId, dto);
        if (modified) {
            const coaTreeCollection = await this.coaService.getFlattenCoATree(
                companyId,
                null,
            );
            return {
                tree: coaTreeCollection,
            };
        }

        throw new NotFoundException("Failed to switch CoA. Please check if there's existing account settings for the given parameter.");
    }
}

