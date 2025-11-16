import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CashReceiptDetailsModel } from './cash-receipt-details.model';
import { CreateCashReceiptDetailsDto } from './dto/create-cash-receipt-details.dto';
import { Op } from 'sequelize';

@Injectable()
export class CashReceiptDetailsService {
  constructor(
    @InjectModel(CashReceiptDetailsModel)
    private cashReceiptDetailsRepository: typeof CashReceiptDetailsModel,
  ) {}

  async bulkCreate(
    dto: CreateCashReceiptDetailsDto,
  ): Promise<CashReceiptDetailsModel[]> {
    let createArr = dto.cashReceiptDetailsList.map((obj) => ({
      ...obj,
      companyId: dto.companyId,
      createdBy: dto.createdBy,
    }));
    return this.cashReceiptDetailsRepository.bulkCreate(createArr);
  }

  async findOneWhere(where: object): Promise<CashReceiptDetailsModel> {
    return this.cashReceiptDetailsRepository.findOne(where);
  }

  async destroyCashReceiptDetails(
    cashReceiptHeaderId: number,
  ): Promise<boolean> {
    const countRowDestroy = this.cashReceiptDetailsRepository.destroy({
      where: { cashReceiptHeaderId },
      individualHooks: true,
    });
    if (countRowDestroy) return true;
    return false;
  }

  async destroy(companyId): Promise<number> {
    return this.cashReceiptDetailsRepository.destroy({
      where: {
        companyId,
      },
    });
  }

  async destroyWhereObj(obj): Promise<number> {
    return this.cashReceiptDetailsRepository.destroy({
      where: obj,
    });
  }

  blocked(blockedParams) {
    this.cashReceiptDetailsRepository.update(
      { isBlock: true },
      {
        where: {
          companyId: blockedParams.companyId,
          createDate: { [Op.lte]: blockedParams.lockAccountingPeriodTo },
        },
      },
    );
    return true;
  }

  blockedCRHIdArr(cdhIdArr) {
    this.cashReceiptDetailsRepository.update(
      { isBlock: true },
      {
        where: {
          cashReceiptHeaderId: cdhIdArr,
        },
      },
    );
    return true;
  }
} 
