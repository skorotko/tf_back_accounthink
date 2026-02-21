import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CashDisbursementDetailsModel } from './cash-disbursement-details.model';
import { CreateCashDisbursementDetailsDto } from './dto/create-cash-disbursement-details.dto';
import { Op } from 'sequelize';

@Injectable()
export class CashDisbursementDetailsService {
  constructor(
    @InjectModel(CashDisbursementDetailsModel)
    private cashDisbursementDetailsRepository: typeof CashDisbursementDetailsModel,
  ) {}

  async bulkCreate(
    dto: CreateCashDisbursementDetailsDto,
  ): Promise<CashDisbursementDetailsModel[]> {
    let createArr = dto.cashDisbursementDetailsList.map((obj) => ({
      ...obj,
      companyId: dto.companyId,
      createdBy: dto.createdBy,
    }));
    return this.cashDisbursementDetailsRepository.bulkCreate(createArr);
  }

  async findOneWhere(where: object): Promise<CashDisbursementDetailsModel> {
    return this.cashDisbursementDetailsRepository.findOne(where);
  }

  async destroyCashDisbursementDetails(
    cashDisbursementHeaderId: number,
  ): Promise<boolean> {
    const countRowDestroy = this.cashDisbursementDetailsRepository.destroy({
      where: { cashDisbursementHeaderId },
    });
    if (countRowDestroy) return true;
    return false;
  }

  async destroy(companyId): Promise<number> {
    return this.cashDisbursementDetailsRepository.destroy({
      where: {
        companyId,
      },
    });
  }

  async destroyWhereObj(obj): Promise<number> {
    return this.cashDisbursementDetailsRepository.destroy({
      where: obj,
    });
  }

  blocked(blockedParams) {
    this.cashDisbursementDetailsRepository.update(
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
    this.cashDisbursementDetailsRepository.update(
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
