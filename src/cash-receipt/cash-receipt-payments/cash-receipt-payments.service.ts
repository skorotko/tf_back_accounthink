import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CashReceiptPaymentsModel } from './cash-receipt-payments.model';
import { CreateCashReceiptPaymentsDto } from './dto/create-cash-receipt-payments.dto';
import { Op } from 'sequelize';
@Injectable()
export class CashReceiptPaymentsService {
  constructor(
    @InjectModel(CashReceiptPaymentsModel)
    private cashReceiptPaymentsRepository: typeof CashReceiptPaymentsModel,
  ) {}

  async bulkCreate(
    dto: CreateCashReceiptPaymentsDto,
  ): Promise<CashReceiptPaymentsModel[]> {
    let createArr = dto.cashReceiptPaymentsList.map((obj) => ({
      ...obj,
      companyId: dto.companyId,
      createdBy: dto.createdBy,
    }));
    return this.cashReceiptPaymentsRepository.bulkCreate(createArr);
  }

  async destroyCashReceiptPayments(
    cashReceiptHeaderId: number,
  ): Promise<boolean> {
    const countRowDestroy = this.cashReceiptPaymentsRepository.destroy({
      where: { cashReceiptHeaderId },
      individualHooks: true,
    });
    if (countRowDestroy) return true;
    return false;
  }

  async destroy(companyId): Promise<number> {
    return this.cashReceiptPaymentsRepository.destroy({
      where: {
        companyId,
      },
    });
  }

  blocked(blockedParams) {
    this.cashReceiptPaymentsRepository.update(
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
    this.cashReceiptPaymentsRepository.update(
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
