import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CashReceiptDetailsModel } from 'src/cash-receipt/cash-receipt-details/cash-receipt-details.model';
import { CashReceiptPaymentsModel } from 'src/cash-receipt/cash-receipt-payments/cash-receipt-payments.model';
import { Transaction } from 'src/transaction/transaction.model';
import { CashReceiptHeaderModel } from './cash-receipt-header.model';
import { CreateCashReceiptHeaderDto } from './dto/create-cash-receipt-header.dto';
import { RecordCashReceiptHeaderDto } from './dto/record-cash-receipt-header.dto';
import { UpdateCashReceiptHeaderDto } from './dto/update-cash-receipt-header.dto';
import { Op, fn, col } from "sequelize";
import { CashReceiptOverPaymentsModel } from '../cash-receipt-overPayments/cash-receipt-overPayments.model';

@Injectable()
export class CashReceiptHeaderService {
  constructor(
    @InjectModel(CashReceiptHeaderModel)
    private cashReceiptHeaderRepository: typeof CashReceiptHeaderModel,
  ) {}

  async create(
    dto: CreateCashReceiptHeaderDto,
  ): Promise<CashReceiptHeaderModel> {
    //return this.cashReceiptHeaderRepository.create({ ...dto, status: 'Add', clientUnderPayment: Number((dto.amountOwing - dto.amountReceived).toFixed(8)), clientOverPayment: Number((dto.amountOwing - dto.amountReceived).toFixed(8)) });
    return this.cashReceiptHeaderRepository.create({
      ...dto,
      status: 'Add',
      statused: 'Added',
      clientUnderPayment: Number(
        (dto.amountOwing - dto.amountReceived).toFixed(8),
      ),
      clientOverPayment: Number(
        (dto.amountOwing - dto.amountReceived).toFixed(8),
      ),
    });
  }

  async update(
    cashReceiptHeaderId,
    dto: UpdateCashReceiptHeaderDto,
  ): Promise<boolean> {
    //const countRowUpdate = this.cashReceiptHeaderRepository.update({ ...dto, status: 'Add', clientUnderPayment: Number((dto.amountOwing - dto.amountReceived).toFixed(8)), clientOverPayment: Number((dto.amountOwing - dto.amountReceived).toFixed(8)) }, { where: { id: cashReceiptHeaderId } });
    delete dto.createdBy;
    const countRowUpdate = this.cashReceiptHeaderRepository.update(
      {
        ...dto,
        status: 'Add',
        statused: 'Added',
        clientUnderPayment: Number(
          (dto.amountOwing - dto.amountReceived).toFixed(8),
        ),
        clientOverPayment: Number(
          (dto.amountOwing - dto.amountReceived).toFixed(8),
        ),
      },
      { where: { id: cashReceiptHeaderId }, individualHooks: true },
    );
    if (countRowUpdate) return true;
    return false;
  }

  async updateTranIdAndNumber(id, tranId, transactionNo): Promise<boolean> {
    const countRowUpdate = this.cashReceiptHeaderRepository.update(
      { tranId, transactionNo, saveTranId: tranId },
      { where: { id } },
    );
    if (countRowUpdate) return true;
    return false;
  }

  async updateStatus(id, status): Promise<boolean> {
    let statused = '';
    if (status.slice(-1) === 'e') statused = status + 'd';
    else statused = status + 'ed';
    const countRowUpdate = this.cashReceiptHeaderRepository.update(
      { status, statused },
      { where: { id } },
    );
    if (countRowUpdate) return true;
    return false;
  }

  async updateRecord(
    cashReceiptHeaderId,
    dto: RecordCashReceiptHeaderDto,
  ): Promise<boolean> {
    const countRowUpdate = this.cashReceiptHeaderRepository.update(dto, {
      where: { id: cashReceiptHeaderId },
    });
    if (countRowUpdate) return true;
    return false;
  }

  async accountBalanceByClientId(clientId: number) {
    const totalAmount = await this.cashReceiptHeaderRepository.sequelize
      .query(`SELECT 
    co."totalOverPayment" - COALESCE(oa."totalAmtApplied", 0) AS "clientOverPayment",
    co."totalUnderPayment" AS "clientUnderPayment",
    co."totalAmountReceived" AS "amountReceived",
    co."totalUnderPaymentAfterRate" AS "clientUnderPaymentAfterRate",
    co."totalOverPaymentAfterRate" - COALESCE(oa."totalAmtApplied", 0) AS "clientOverPaymentAfterRate"
FROM 
    (SELECT 
        "clientId",
        SUM("clientOverPayment") AS "totalOverPayment",
        SUM("clientOverPayment" * "fxRate") AS "totalOverPaymentAfterRate",
        SUM("clientUnderPayment") AS "totalUnderPayment",
        SUM("amountReceived") AS "totalAmountReceived",
        SUM("clientUnderPayment" * "fxRate") AS "totalUnderPaymentAfterRate"
     FROM 
        "cashReceiptHeader"
     WHERE 
	    "isSales" = 'True'
     	AND
        "clientId" = ${clientId}
     GROUP BY 
        "clientId"
    ) co
LEFT JOIN 
    (SELECT 
        cr."clientId", 
        SUM(op."amtApplied") AS "totalAmtApplied"
     FROM 
        "cashReceiptOverPayment" op
     LEFT JOIN 
        "cashReceiptHeader" cr ON op."cashReceiptHeaderIdOut" = cr."id"
     WHERE 
        cr."clientId" = ${clientId}
     GROUP BY 
        cr."clientId"
    ) oa ON co."clientId" = oa."clientId"`);
    return totalAmount[0];
  }

  async checkCashReceiptForClient(clientId: number) {
    let count: number = await this.cashReceiptHeaderRepository.count({
      where: {
        clientId,
      },
    });

    return count > 0;
  }

  async byClientOverPayment(clientId: number, startDate, endDate) {
    let result = {
      total: {},
      table: {},
    };
    let queryTable: any = [{}];
    let queryTotal: any = [{}];
    let queryDate = '';
    if (startDate !== 'null' && endDate !== 'null')
      queryDate = `and cast(to_char(cr."crDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)--startdate
				and cast(to_char(cr."crDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)--enddate`;
    queryTable = await this.cashReceiptHeaderRepository.sequelize.query(`
							SELECT 
					co."transactionNo" AS CRID,
					co."crDate" AS Date,
					co.status AS Status,
					co.statused AS Statused,
					co."amountOwing" AS Owing,
					co."amountReceived" AS Received,
					co."clientUnderPayment" AS UnderPMTDr,
					co."clientOverPayment" - COALESCE(oa."totalAmtApplied", 0) AS OverPMTCr,
					co.id,
					oa."totalAmtApplied"
				FROM 
					(SELECT
							"clientId",
							"isSales",
						"transactionNo",
						"crDate",
						status,
						statused,
						id,
						"amountOwing",
						"amountReceived",
						"clientUnderPayment",
						"clientOverPayment"
					FROM 
						"cashReceiptHeader" cr
					WHERE 
						"isSales" = 'True'
							AND "clientId" = ${clientId}
					) co
				LEFT JOIN 
					(SELECT  
							op."cashReceiptHeaderIdOut",
						SUM(op."amtApplied") AS "totalAmtApplied"
					FROM 
						"cashReceiptOverPayment" op
					GROUP BY 
						op."cashReceiptHeaderIdOut"
					) oa ON co."id" = oa."cashReceiptHeaderIdOut"
				WHERE
					(co."clientUnderPayment" - co."clientOverPayment") <> 0
					AND (co."clientOverPayment" - COALESCE(oa."totalAmtApplied", 0)) <> 0
					${queryDate}
				GROUP BY
					co."transactionNo",
					co."crDate",
					co.status,
					co.statused,
					co."amountOwing",
					co."amountReceived",
					co."clientUnderPayment",
					co."clientOverPayment",
					co.id,
					oa."totalAmtApplied"
				ORDER BY
					CRID DESC;
			`);
    queryTotal = await this.cashReceiptHeaderRepository.sequelize.query(`
				select
				sum(cr."clientUnderPayment") as totalUnderPMTDr,
				sum(cr."clientOverPayment") as totalOverPMTCr,
				--(sum(cr."clientUnderPayment")-sum(cr."clientOverPayment")) as AccountBalanceSales,
				--(sum(cr."clientOverPayment")-sum(cr."clientUnderPayment")) as AccountBalanceSales
				(CASE WHEN (sum(cr."clientOverPayment")-sum(cr."clientUnderPayment")) < 0 THEN '(' || TO_CHAR(ABS((sum(cr."clientOverPayment")-sum(cr."clientUnderPayment"))), '999999999.99') || ') Cr' ELSE TO_CHAR((sum(cr."clientOverPayment")-sum(cr."clientUnderPayment")), '999999999.99') || ' Cr' END) as AccountBalanceSales
				from "cashReceiptHeader" cr
				inner join transaction t on t.id=cr."tranId" and t."companyId"=cr."companyId"
				where cr."isSales"='True'
				and (cr."clientUnderPayment"-cr."clientOverPayment")<>0
				and cr."clientId"=${clientId}
				${queryDate}
			`);
    queryTotal = queryTotal[0];
    result.table = queryTable[0];
    result.total = queryTotal[0];
    return result;
  }

  async byClientOverPaymentTable(id: number, startDate, endDate) {
    let result = {
      total: {},
      table: {},
    };
    let queryTable: any = [{}];
    let queryTotal: any = [{}];
    let queryDate = '';
    if (startDate !== 'null' && endDate !== 'null')
      queryDate = `and cast(to_char(cr."crDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)--startdate
				and cast(to_char(cr."crDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)--enddate`;
    queryTable = await this.cashReceiptHeaderRepository.sequelize.query(`
						SELECT
				cr2."transactionNo" AS "crid", 
				cr1."crDate" AS "date", 
				cr1.status AS status, 
				cr1.statused AS statused, 
				cr1."amountOwing" AS "owning", 
				cr1."amountReceived" AS received, 
				cr1."clientUnderPayment" AS underpmtdr,
				c2."cashReceiptHeaderIdOut", 
				cr1."clientOverPayment" AS overpmtcr, 
				c2."amtApplied", 
				c2."cashReceiptHeaderIdIn", 
				(c2.overpmtcr - c2."amtApplied") as ovptcrdeff 
				FROM
				"cashReceiptHeader" AS cr1
				INNER JOIN
				"cashReceiptOverPayment" AS c2
				ON 
				cr1."id" = c2."cashReceiptHeaderIdOut"
				INNER JOIN
				"cashReceiptHeader" AS cr2
				ON 
				c2."cashReceiptHeaderIdIn" = cr2."id"
				WHERE
				cr1."id" = ${id}
				${queryDate}
				ORDER BY
				cr2."transactionNo" DESC;
			`);
    queryTotal = await this.cashReceiptHeaderRepository.sequelize.query(`
				select
				sum(cr."clientUnderPayment") as totalUnderPMTDr,
				sum(cr."clientOverPayment") as totalOverPMTCr,
				--(sum(cr."clientUnderPayment")-sum(cr."clientOverPayment")) as AccountBalanceSales,
				--(sum(cr."clientOverPayment")-sum(cr."clientUnderPayment")) as AccountBalanceSales
				(CASE WHEN (sum(cr."clientOverPayment")-sum(cr."clientUnderPayment")) < 0 THEN '(' || TO_CHAR(ABS((sum(cr."clientOverPayment")-sum(cr."clientUnderPayment"))), '999999999.99') || '), CR' ELSE TO_CHAR((sum(cr."clientOverPayment")-sum(cr."clientUnderPayment")), '999999999.99') || ', CR' END) as AccountBalanceSales
				from "cashReceiptHeader" cr
				inner join transaction t on t.id=cr."tranId" and t."companyId"=cr."companyId"
				where cr."isSales"='True'
				and (cr."clientUnderPayment"-cr."clientOverPayment")<>0
				and cr."id"=${id}
				${queryDate}
			`);
    queryTotal = queryTotal[0];
    result.table = queryTable[0];
    result.total = queryTotal[0];
    return result;
  }

  async byClientTables(
    clientId: number,
    typeId: number,
    startDate,
    endDate,
    page,
  ) {
    let limit = 10;
    let offset = 0 + (page - 1) * limit;
    let result = {
      total: {},
      count: 0,
      page: 1,
      table: {},
    };
    let queryTable: any = [{}];
    let queryTotal: any = [{}];
    let queryCount: any = [{}];
    let queryDate = '';
    if (startDate !== 'null' && endDate !== 'null')
      queryDate = `and cast(to_char(cr."crDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)--startdate
				and cast(to_char(cr."crDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)--enddate`;
    if (typeId === 1) {
      queryCount = await this.cashReceiptHeaderRepository.sequelize
        .query(`select
				count(cr.id)
				from "cashReceiptHeader" cr
				inner join transaction t on t.id=cr."tranId" and t."companyId"=cr."companyId"
				where cr."clientId"=${clientId} --and cr."companyId" = 
				${queryDate}`);
      queryTable = await this.cashReceiptHeaderRepository.sequelize.query(`
				select
				t."transactionNo" as CRID,
				cr."crDate" as Date,
				cr.id,
				cr.status as Status,
				cr.statused as Statused,
				t."isSendToAcc" as SentToAccountant,
				cr."amountOwing" as Owing,
				cr."amountReceived" as Received
				from "cashReceiptHeader" cr
				inner join transaction t on t.id=cr."tranId" and t."companyId"=cr."companyId"
				where cr."clientId"=${clientId} --and cr."companyId" = 
				${queryDate}
				ORDER BY CRID ASC
				LIMIT ${limit} OFFSET ${offset}

			`);
      queryTotal = await this.cashReceiptHeaderRepository.sequelize.query(`
				select
				sum(cr."amountReceived") as TotalReceived
				from "cashReceiptHeader" cr
				inner join transaction t on t.id=cr."tranId" and t."companyId"=cr."companyId"
				where cr."clientId"=${clientId} --and cr."companyId" = 
				${queryDate}
			`);
      queryTotal = queryTotal[0];
      queryCount = queryCount[0];
      if (queryTotal[0].totalreceived == null) queryTotal[0].totalreceived = 0;
    } else if (typeId === 2) {
      queryCount = await this.cashReceiptHeaderRepository.sequelize
        .query(`select
				count(cr.id)
				from "cashReceiptHeader" cr
				inner join transaction t on t.id=cr."tranId" and t."companyId"=cr."companyId"
				where cr."isDeposit"='True' and cr."clientId"=${clientId} --and cr."companyId" = 
				${queryDate}`);
      queryTable = await this.cashReceiptHeaderRepository.sequelize.query(`
				select
				t."transactionNo" as CRID,
				cr."crDate" as Date,
				cr.id,
				cr.status as Status,
				cr.statused as Statused,
				t."isSendToAcc" as SentToAccountant,
				cr."amountReceived" as AmtDeposited,
				0 as AmountUtilised,--zero is temporary but for confirmation where is this came from
				(cr."amountReceived"-0) as Balance--zero is temporary but it came from amount utilised
				from "cashReceiptHeader" cr
				inner join transaction t on t.id=cr."tranId" and t."companyId"=cr."companyId"
				where cr."isDeposit"='True' and cr."clientId"=${clientId} --and cr."companyId" = 
				${queryDate}
				ORDER BY CRID ASC
				LIMIT ${limit} OFFSET ${offset}
			`);
      queryTotal = await this.cashReceiptHeaderRepository.sequelize.query(`
				select
				sum(cr."amountReceived"-0) as AccountBalance--zero is temporary but it came from amount utilised
				from "cashReceiptHeader" cr
				inner join transaction t on t.id=cr."tranId" and t."companyId"=cr."companyId"
				where cr."isDeposit"='True' and cr."clientId"=${clientId} --and cr."companyId" = 
				${queryDate}
			`);
      queryTotal = queryTotal[0];
      queryCount = queryCount[0];
      if (queryTotal[0].accountbalance == null)
        queryTotal[0].accountbalance = 0;
    } else if (typeId === 3) {
      queryCount = await this.cashReceiptHeaderRepository.sequelize
        .query(`select
				count(cr.id)
				from "cashReceiptHeader" cr
				inner join transaction t on t.id=cr."tranId" and t."companyId"=cr."companyId"
				where
				--cr."companyId" =  and
				cr."isSales"='True'
				and (cr."clientUnderPayment"-cr."clientOverPayment")<>0
				and cr."clientId"=${clientId}
				${queryDate}`);
      queryTable = await this.cashReceiptHeaderRepository.sequelize
        .query(`SELECT
				t."transactionNo" AS CRID,
				cr."crDate" AS Date,
				cr.status AS Status,
				cr.statused AS Statused,
				cr.id,
				cr."amountOwing" AS Owing,
				cr."amountReceived" AS Received,
				cr."clientUnderPayment" AS UnderPMTDr,
				cr."clientOverPayment" AS OverPMTCr,
				COALESCE(SUM(op."amtApplied"), 0) AS "totalAmtApplied",
				(cr."clientOverPayment" - COALESCE(SUM(op."amtApplied"), 0)) - cr."clientUnderPayment" AS "overPMTBal"
				FROM
				"cashReceiptHeader" cr
				INNER JOIN
				transaction t ON t.id = cr."tranId" AND t."companyId" = cr."companyId"
			LEFT JOIN
				"cashReceiptOverPayment" op ON op."cashReceiptHeaderIdOut" = cr."id"
			WHERE
				cr."isSales" = TRUE
				AND (cr."clientUnderPayment" - cr."clientOverPayment") <> 0
				AND cr."clientId" = ${clientId} --and cr."companyId" = 
				${queryDate}
			GROUP BY
				t."transactionNo", cr."crDate", cr.status, cr.id, cr."amountOwing",
				cr."amountReceived", cr."clientUnderPayment", cr."clientOverPayment"
			ORDER BY
				CRID ASC
			LIMIT ${limit} OFFSET ${offset}`);
      queryTotal = await this.cashReceiptHeaderRepository.sequelize.query(`
						select
				sum(cr."clientUnderPayment") as totalUnderPMTDr,
				sum(cr."clientOverPayment") as totalOverPMTCr,
				COALESCE(SUM(op.amtApplied), 0) AS "totalAmtApplied",
				sum(cr."clientOverPayment") - COALESCE(SUM(op.amtApplied), 0)  - sum(cr."clientUnderPayment") AS "totalOverPaymentBal"--,
				--(sum(cr."clientUnderPayment")-sum(cr."clientOverPayment")) as AccountBalanceSales,
				--(sum(cr."clientOverPayment")-sum(cr."clientUnderPayment")) as AccountBalanceSales
				--(CASE WHEN (sum(cr."clientOverPayment")-sum(cr."clientUnderPayment")) < 0 THEN '('  TO_CHAR(ABS((sum(cr."clientOverPayment")-sum(cr."clientUnderPayment"))), '999999999.99')  '), CR' ELSE TO_CHAR((sum(cr."clientOverPayment")-sum(cr."clientUnderPayment")), '999999999.99') || ', CR' END) as AccountBalanceSales
				from "cashReceiptHeader" cr
				inner join transaction t on t.id=cr."tranId"
					left join (
				select
				--*
				co."cashReceiptHeaderIdOut", sum(co."amtApplied") as amtApplied
				from "cashReceiptOverPayment" as co
				--where co."companyId" = 
				group by co."cashReceiptHeaderIdOut"
				--order by co."cashReceiptHeaderIdOut", co."cashReceiptHeaderIdIn"
				)op on op."cashReceiptHeaderIdOut"=cr."id"
						where cr."isSales"='True'
						and (cr."clientUnderPayment"-cr."clientOverPayment")<>0
						and cr."clientId"=${clientId} --and cr."companyId" = 
						${queryDate}`);
      queryTotal = queryTotal[0];
      queryCount = queryCount[0];
    }
    result.table = queryTable[0];
    result.total = queryTotal[0];
    result.count = Number(queryCount[0].count);
    result.page = Math.ceil(result.count / 10);
    return result;
  }

  async findOneById(id): Promise<CashReceiptHeaderModel> {
    return this.cashReceiptHeaderRepository.findOne({
      where: {
        id,
      },
      include: [
        {
          model: CashReceiptPaymentsModel,
        },
        {
          model: CashReceiptDetailsModel,
        },
        {
          model: Transaction,
        },
        {
          model: CashReceiptOverPaymentsModel,
        },
      ],
    });
  }

  async findAllByCompanyId(companyId): Promise<CashReceiptHeaderModel[]> {
    return this.cashReceiptHeaderRepository.findAll({
      where: {
        companyId,
        status: {
          [Op.notIn]: ['Deleted', 'Void'],
        },
      },
      include: [
        {
          model: Transaction,
        },
        {
          model: CashReceiptPaymentsModel,
        },
        {
          model: CashReceiptDetailsModel,
        },
        {
          model: CashReceiptOverPaymentsModel,
        },
      ],
    });
  }

  async findAllByClientId(
    clientId: number,
    page: number,
    startDate,
    endDate,
    type,
  ): Promise<{ rows: CashReceiptHeaderModel[]; count: number }> {
    let limit = 10;
    let offset = 0 + (page - 1) * limit;
    let whereObj = {
      clientId,
      status: {
        [Op.notIn]: ['Deleted', 'Void'],
      },
    };
    if (startDate !== 'null' && endDate !== 'null') {
      Object.assign(whereObj, {
        crDate: {
          [Op.between]: [startDate, endDate],
        },
      });
    }

    if (type === 'advancesFrom') {
      Object.assign(whereObj, {
        [Op.or]: [
          { clientUnderPayment: { [Op.not]: 0 } },
          { clientOverPayment: { [Op.not]: 0 } },
        ],
      });
    }

    const result = this.cashReceiptHeaderRepository.findAndCountAll({
      where: whereObj,
      offset,
      limit,
      order: [['id', 'ASC']],
      include: [
        {
          model: Transaction,
        },
      ],
    });
    return result;
  }

  async deleteByCompanyId(companyId): Promise<number> {
    return this.cashReceiptHeaderRepository.destroy({
      where: {
        companyId,
      },
    });
  }

  blocked(blockedParams) {
    this.cashReceiptHeaderRepository.update(
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

  async blockedTranIdArr(tranIdArr) {
    let crhArr = await this.cashReceiptHeaderRepository.findAll({
      where: {
        tranId: tranIdArr,
      },
    });
    this.cashReceiptHeaderRepository.update(
      { isBlock: true },
      {
        where: {
          tranId: tranIdArr,
        },
      },
    );
    return crhArr.map((data) => data.id);
  }
}
