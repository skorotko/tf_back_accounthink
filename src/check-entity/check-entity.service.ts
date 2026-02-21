import { Injectable } from '@nestjs/common';
import { CashDisbursementDetailsService } from 'src/cash-disbursement/cash-disbursement-details/cash-disbursement-details.service';
import { CashReceiptDetailsService } from 'src/cash-receipt/cash-receipt-details/cash-receipt-details.service';
import { TransactionEntryService } from 'src/transaction-entry/transaction-entry.service';


@Injectable()
export class CheckEntityService {

  constructor(private transactionEntryService: TransactionEntryService,
              private cashReceiptDetailsService: CashReceiptDetailsService,
              private cashDisbursementDetailsService: CashDisbursementDetailsService,
            ) {}



  async checkEntity(id: number, entityTypeId: number): Promise<object> {//entityTypeId for Project - 1, BU - 2, Eng - 3
    const tre = await this.transactionEntryService.findOneWhere({ where: { taskId: id, entityTypeId }});
    if(tre)
      return { message: 'Task used in Transaction Entry', status: false };
    const crh = await this.cashReceiptDetailsService.findOneWhere({ where: { taskId: id, allocatedTo: entityTypeId}});
    if(crh)
      return { message: 'Task used in Cash Receipt Details', status: false };
    const cdd = await this.cashDisbursementDetailsService.findOneWhere({ where: { taskId: id, allocatedTo: entityTypeId } });
    if(cdd)
      return { message: 'Task used in Cash Disbursement Details', status: false };
    return { message:'Task not used in Account Think', status: true};
  }

}
