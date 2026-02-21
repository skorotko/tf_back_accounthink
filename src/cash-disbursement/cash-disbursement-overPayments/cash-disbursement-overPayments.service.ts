import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CashDisbursementOverPaymentsModel } from './cash-disbursement-overPayments.model';
import { CreateCashDisbursementOverPaymentsDto } from './dto/create-cash-disbursement-overPayments.dto';
import { Op } from 'sequelize';

@Injectable()
export class CashDisbursementOverPaymentsService {
  constructor(
    @InjectModel(CashDisbursementOverPaymentsModel)
    private cashDisbursementOverPaymentsRepository: typeof CashDisbursementOverPaymentsModel,
  ) {}

  async bulkCreate(
    dto: CreateCashDisbursementOverPaymentsDto,
  ): Promise<CashDisbursementOverPaymentsModel[]> {
    // console.log(dto);
    let createArr = dto.cashDisbursementPaymentsList.map((obj) => ({
      ...obj,
      companyId: dto.companyId,
      createdBy: dto.createdBy,
      cashDisbursementHeaderIdIn: dto.cashDisbursementHeaderIdIn,
    }));
    return this.cashDisbursementOverPaymentsRepository.bulkCreate(createArr);
  }

  async destroyCashDisbursementOverPayments(
    cashDisbursementHeaderIdIn: number,
  ): Promise<boolean> {
    const countRowDestroy = this.cashDisbursementOverPaymentsRepository.destroy(
      { where: { cashDisbursementHeaderIdIn } },
    );
    if (countRowDestroy) return true;
    return false;
  }

  async destroy(companyId): Promise<number> {
    return this.cashDisbursementOverPaymentsRepository.destroy({
      where: {
        companyId,
      },
    });
  }

  blocked(blockedParams) {
    this.cashDisbursementOverPaymentsRepository.update(
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
    this.cashDisbursementOverPaymentsRepository.update(
      { isBlock: true },
      {
        where: {
          cashDisbursementHeaderIdIn: cdhIdArr,
        },
      },
    );
    return true;
  }
}
