import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CashReceiptOverPaymentsModel } from './cash-receipt-overPayments.model';
import { CreateCashReceiptOverPaymentsDto } from './dto/create-cash-receipt-overPayments.dto';
import { Op } from 'sequelize';

@Injectable()
export class CashReceiptOverPaymentsService {
  constructor(
    @InjectModel(CashReceiptOverPaymentsModel)
    private cashReceiptOverPaymentsRepository: typeof CashReceiptOverPaymentsModel,
  ) {}

  async bulkCreate(
    dto: CreateCashReceiptOverPaymentsDto,
  ): Promise<CashReceiptOverPaymentsModel[]> {
    // console.log(dto);
    let createArr = dto.cashReceiptPaymentsList.map((obj) => ({
      ...obj,
      companyId: dto.companyId,
      createdBy: dto.createdBy,
      cashReceiptHeaderIdIn: dto.cashReceiptHeaderIdIn,
    }));
    return this.cashReceiptOverPaymentsRepository.bulkCreate(createArr);
  }

  async destroyCashReceiptOverPayments(
    cashReceiptHeaderIdIn: number,
  ): Promise<boolean> {
    const countRowDestroy = this.cashReceiptOverPaymentsRepository.destroy({
      where: { cashReceiptHeaderIdIn },
      individualHooks: true,
    });
    if (countRowDestroy) return true;
    return false;
  }

  async destroy(companyId): Promise<number> {
    return this.cashReceiptOverPaymentsRepository.destroy({
      where: {
        companyId,
      },
    });
  }

  blocked(blockedParams) {
    this.cashReceiptOverPaymentsRepository.update(
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
    this.cashReceiptOverPaymentsRepository.update(
      { isBlock: true },
      {
        where: {
          cashReceiptHeaderIdIn: cdhIdArr,
        },
      },
    );
    return true;
  }
}
