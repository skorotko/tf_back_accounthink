import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CashDisbursementPaymentsModel } from './cash-disbursement-payments.model';
import { CreateCashDisbursementPaymentsDto } from './dto/create-cash-disbursement-payments.dto';
import { Op } from 'sequelize';

@Injectable()
export class CashDisbursementPaymentsService {
  constructor(
    @InjectModel(CashDisbursementPaymentsModel)
    private cashDisbursementPaymentsRepository: typeof CashDisbursementPaymentsModel,
  ) {}

  async bulkCreate(
    dto: CreateCashDisbursementPaymentsDto,
  ): Promise<CashDisbursementPaymentsModel[]> {
    let createArr = dto.cashDisbursementPaymentsList.map((obj) => ({
      ...obj,
      companyId: dto.companyId,
      createdBy: dto.createdBy,
    }));
    return this.cashDisbursementPaymentsRepository.bulkCreate(createArr);
  }

  async destroyCashDisbursementPayments(
    cashDisbursementHeaderId: number,
  ): Promise<boolean> {
    const countRowDestroy = this.cashDisbursementPaymentsRepository.destroy({
      where: { cashDisbursementHeaderId },
    });
    if (countRowDestroy) return true;
    return false;
  }

  async destroy(companyId): Promise<number> {
    return this.cashDisbursementPaymentsRepository.destroy({
      where: {
        companyId,
      },
    });
  }

  blocked(blockedParams) {
    this.cashDisbursementPaymentsRepository.update(
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

  blockedCDHIdArr(cdhIdArr) {
    this.cashDisbursementPaymentsRepository.update(
      { isBlock: true },
      {
        where: {
          cashDisbursementHeaderId: cdhIdArr,
        },
      },
    );
    return true;
  }
}
