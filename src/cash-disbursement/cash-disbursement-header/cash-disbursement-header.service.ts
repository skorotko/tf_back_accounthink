import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'src/transaction/transaction.model';
import { CashDisbursementDetailsModel } from '../cash-disbursement-details/cash-disbursement-details.model';
import { CashDisbursementPaymentsModel } from '../cash-disbursement-payments/cash-disbursement-payments.model';
import { CashDisbursementHeaderModel } from './cash-disbursement-header.model';
import { CreateCashDisbursementHeaderDto } from './dto/create-cash-disbursement-header.dto';
import { RecordCashDisbursementHeaderDto } from './dto/record-cash-disbursement-header.dto';
import { UpdateCashDisbursementHeaderDto } from './dto/update-cash-disbursement-header.dto';
import { Op, fn, col } from "sequelize";
import { CashDisbursementOverPaymentsModel } from '../cash-disbursement-overPayments/cash-disbursement-overPayments.model';

@Injectable()
export class CashDisbursementHeaderService {
  constructor(
    @InjectModel(CashDisbursementHeaderModel)
    private cashDisbursementHeaderRepository: typeof CashDisbursementHeaderModel,
  ) {}

  async create(
    dto: CreateCashDisbursementHeaderDto,
  ): Promise<CashDisbursementHeaderModel> {
    return this.cashDisbursementHeaderRepository.create({
      ...dto,
      status: 'Add',
      statused: 'Added',
      vendorUnderPayment: dto.amountOwing - dto.amountPaid,
      vendorOverPayment: dto.amountOwing - dto.amountPaid,
    });
  }

  async update(
    cashDisbursementHeaderId,
    dto: UpdateCashDisbursementHeaderDto,
  ): Promise<boolean> {
    delete dto.createdBy;
    const countRowUpdate = this.cashDisbursementHeaderRepository.update(
      {
        ...dto,
        status: 'Add',
        statused: 'Added',
        vendorUnderPayment: dto.amountOwing - dto.amountPaid,
        vendorOverPayment: dto.amountOwing - dto.amountPaid,
      },
      { where: { id: cashDisbursementHeaderId } },
    );
    if (countRowUpdate) return true;
    return false;
  }

  async updateTranIdAndNumber(id, tranId, transactionNo): Promise<boolean> {
    const countRowUpdate = this.cashDisbursementHeaderRepository.update(
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
    const countRowUpdate = this.cashDisbursementHeaderRepository.update(
      { status, statused },
      { where: { id } },
    );
    if (countRowUpdate) return true;
    return false;
  }

  async updateRecord(
    cashDisbursementHeaderId,
    dto: RecordCashDisbursementHeaderDto,
  ): Promise<boolean> {
    const countRowUpdate = this.cashDisbursementHeaderRepository.update(dto, {
      where: { id: cashDisbursementHeaderId },
    });
    if (countRowUpdate) return true;
    return false;
  }

  async accountBalanceByVendorId(vendorId: number) {
    const totalAmount = await this.cashDisbursementHeaderRepository.sequelize
      .query(`SELECT SUM("vendorOverPayment") as "vendorOverPayment", 
			SUM("vendorUnderPayment") as "vendorUnderPayment",
			SUM("amountPaid") as "amountPaid",
			SUM("vendorUnderPayment"*"fxRate") as "vendorUnderPaymentAfterRate",
			SUM("vendorOverPayment"*"fxRate")  as "vendorOverPaymentAfterRate"
			FROM "cashDisbursementHeader"
			WHERE "vendorId"=${vendorId}`);
    return totalAmount[0];
  }

  async byVendorOverPaymentTable(id: number, startDate, endDate) {
    let result = {
      total: {},
      table: {},
    };
    let queryTable: any = [{}];
    let queryTotal: any = [{}];
    let queryDate = '';
    if (startDate !== 'null' && endDate !== 'null')
      queryDate = `and cast(to_char(cd."crDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)--startdate
				and cast(to_char(cd."crDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)--enddate`;
    queryTable = await this.cashDisbursementHeaderRepository.sequelize.query(`
				SELECT
				cd2."transactionNo" AS "cdid", 
				cd1."cdDate" AS "date", 
				cd1.status AS status, 
				cd1."amountOwing" AS "owning", 
				cd1."amountPaid" AS received, 
				cd1."vendorUnderPayment" AS underpmtdr,
				c2."cashDisbursementHeaderIdOut", 
				cd1."vendorOverPayment" AS overpmtcr, 
				c2."amtApplied", 
				c2."cashDisbursementHeaderIdIn", 
				(c2.overpmtcr - c2."amtApplied") as ovptcrdeff 
				FROM
				"cashDisbursementHeader" AS cd1
				INNER JOIN
				"cashDisbursementOverPayment" AS c2
				ON 
				cd1."id" = c2."cashDisbursementHeaderIdOut"
				INNER JOIN
				"cashDisbursementHeader" AS cd2
				ON 
				c2."cashDisbursementHeaderIdIn" = cd2."id"
				WHERE
				cd1."id" = ${id}
				${queryDate}
				ORDER BY
				cd2."transactionNo" DESC;
			`);
    queryTotal = await this.cashDisbursementHeaderRepository.sequelize.query(`
				select
				sum(cd."vendorUnderPayment") as totalUnderPMTDr,
				sum(cd."vendorOverPayment") as totalOverPMTCr,
				--(sum(cd."vendorUnderPayment")-sum(cd."vendorOverPayment")) as AccountBalanceSales,
				--(sum(cd."vendorOverPayment")-sum(cd."vendorUnderPayment")) as AccountBalanceSales
				(CASE WHEN (sum(cd."vendorOverPayment")-sum(cd."vendorUnderPayment")) < 0 THEN '(' || TO_CHAR(ABS((sum(cd."vendorOverPayment")-sum(cd."vendorUnderPayment"))), '999999999.99') || '), CR' ELSE TO_CHAR((sum(cd."vendorOverPayment")-sum(cd."vendorUnderPayment")), '999999999.99') || ', CR' END) as AccountBalanceSales
				from "cashDisbursementHeader" cd
				inner join transaction t on t.id=cd."tranId" and t."companyId"=cd."companyId"
				where (cd."vendorUnderPayment"-cd."vendorOverPayment")<>0
				and cd."id"=${id}
				${queryDate}
			`);
    queryTotal = queryTotal[0];
    result.table = queryTable[0];
    result.total = queryTotal[0];
    return result;
  }

  async byVendorOverPayment(vendorId: number, startDate, endDate) {
    let result = {
      total: {},
      table: {},
    };
    let queryTable: any = [{}];
    let queryTotal: any = [{}];
    let queryDate = '';
    if (startDate !== 'null' && endDate !== 'null')
      queryDate = `and cast(to_char(cd."cdDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)--startdate
				and cast(to_char(cd."cdDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)--enddate`;
    queryTable = await this.cashDisbursementHeaderRepository.sequelize.query(`
							SELECT 
					co."transactionNo" AS CDID,
					co."cdDate" AS Date,
					co.status AS Status,
					co."amountOwing" AS Owing,
					co."amountPaid" AS Received,
					co."vendorUnderPayment" AS UnderPMTDr,
					co."vendorOverPayment" - COALESCE(oa."totalAmtApplied", 0) AS OverPMTCr,
					co.id,
					oa."totalAmtApplied"
				FROM 
					(SELECT
							"vendorId",
						"transactionNo",
						"cdDate",
						status,
						id,
						"amountOwing",
						"amountPaid",
						"vendorUnderPayment",
						"vendorOverPayment"
					FROM 
						"cashDisbursementHeader" cd
					WHERE 
						"vendorId" = ${vendorId}
					) co
				LEFT JOIN 
					(SELECT  
							op."cashDisbursementHeaderIdOut",
						SUM(op."amtApplied") AS "totalAmtApplied"
					FROM 
						"cashDisbursementOverPayment" op
					GROUP BY 
						op."cashDisbursementHeaderIdOut"
					) oa ON co."id" = oa."cashDisbursementHeaderIdOut"
				WHERE
					(co."vendorUnderPayment" - co."vendorOverPayment") <> 0
					AND (co."vendorOverPayment" - COALESCE(oa."totalAmtApplied", 0)) <> 0
					${queryDate}
				GROUP BY
					co."transactionNo",
					co."cdDate",
					co.status,
					co."amountOwing",
					co."amountPaid",
					co."vendorUnderPayment",
					co."vendorOverPayment",
					co.id,
					oa."totalAmtApplied"
				ORDER BY
					CDID DESC;
			`);
    queryTotal = await this.cashDisbursementHeaderRepository.sequelize.query(`
				select
				sum(cd."vendorUnderPayment") as totalUnderPMTDr,
				sum(cd."vendorOverPayment") as totalOverPMTCr,
				--(sum(cd."vendorUnderPayment")-sum(cd."vendorOverPayment")) as AccountBalanceSales,
				--(sum(cd."vendorOverPayment")-sum(cd."vendorUnderPayment")) as AccountBalanceSales
				(CASE WHEN (sum(cd."vendorOverPayment")-sum(cd."vendorUnderPayment")) < 0 THEN '(' || TO_CHAR(ABS((sum(cd."vendorOverPayment")-sum(cd."vendorUnderPayment"))), '999999999.99') || ') Cr' ELSE TO_CHAR((sum(cd."vendorOverPayment")-sum(cd."vendorUnderPayment")), '999999999.99') || ' Cr' END) as AccountBalanceSales
				from "cashDisbursementHeader" cd
				inner join transaction t on t.id=cd."tranId" and t."companyId"=cd."companyId"
				where (cd."vendorUnderPayment"-cd."vendorOverPayment")<>0
				and cd."vendorId"=${vendorId}
				${queryDate}
			`);
    queryTotal = queryTotal[0];
    result.table = queryTable[0];
    result.total = queryTotal[0];
    return result;
  }

  async byVendorTables(
    vendorId: number,
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
      queryDate = `and cast(to_char(cd."cdDate", 'mm/dd/yyyy') as date) >= cast('${startDate}' as date)--startdate
				and cast(to_char(cd."cdDate", 'mm/dd/yyyy') as date) <= cast('${endDate}' as date)--enddate`;
    if (typeId === 1) {
      queryCount = await this.cashDisbursementHeaderRepository.sequelize
        .query(`select
				count(cd.id)
				from "cashDisbursementHeader" cd
				inner join transaction t on t.id=cd."tranId" and t."companyId"=cd."companyId"
				where cd."vendorId"=${vendorId} --and cd."companyId"= 
				${queryDate}`);
      queryTable = await this.cashDisbursementHeaderRepository.sequelize.query(`
				select
				t."transactionNo" as CRID,
				cd."cdDate" as Date,
				cd.id,
				cd.status as Status,
				t."isSendToAcc" as SentToAccountant,
				cd."amountOwing" as Owing,
				cd."amountPaid" as Paid
				from "cashDisbursementHeader" cd
				inner join transaction t on t.id=cd."tranId" and t."companyId"=cd."companyId"
				where cd."vendorId"=${vendorId} --and cd."companyId"= 
				${queryDate}
				ORDER BY CRID ASC
				LIMIT ${limit} OFFSET ${offset}

			`);
      queryTotal = await this.cashDisbursementHeaderRepository.sequelize.query(`
				select
				sum(cd."amountPaid") as TotalPaid
				from "cashDisbursementHeader" cd
				inner join transaction t on t.id=cd."tranId" and t."companyId"=cd."companyId"
				where cd."vendorId"=${vendorId} --and cd."companyId"= 
				${queryDate}
			`);
      queryTotal = queryTotal[0];
      queryCount = queryCount[0];
      if (queryTotal[0].totalreceived == null) queryTotal[0].totalreceived = 0;
    } else if (typeId === 2) {
      queryCount = await this.cashDisbursementHeaderRepository.sequelize
        .query(`select
				count(cd.id)
				from "cashDisbursementHeader" cd
				inner join transaction t on t.id=cd."tranId" and t."companyId"=cd."companyId"
				where cd."vendorId"=${vendorId} --and cd."companyId"= 
				${queryDate}`);
      queryTable = await this.cashDisbursementHeaderRepository.sequelize.query(`
				select
				t."transactionNo" as CRID,
				cd."cdDate" as Date,
				cd.id,
				cd.status as Status,
				t."isSendToAcc" as SentToAccountant,
				cd."amountPaid" as AmtDeposited,
				0 as AmountUtilised,--zero is temporary but for confirmation where is this came from
				(cd."amountPaid"-0) as Balance--zero is temporary but it came from amount utilised
				from "cashDisbursementHeader" cd
				inner join transaction t on t.id=cd."tranId" and t."companyId"=cd."companyId"
				where cd."vendorId"=${vendorId} --and cd."companyId"= 
				${queryDate}
				ORDER BY CRID ASC
				LIMIT ${limit} OFFSET ${offset}
			`);
      queryTotal = await this.cashDisbursementHeaderRepository.sequelize.query(`
				select
				sum(cd."amountPaid"-0) as totalreceived--zero is temporary but it came from amount utilised
				from "cashDisbursementHeader" cd
				inner join transaction t on t.id=cd."tranId" and t."companyId"=cd."companyId"
				where  cd."vendorId"=${vendorId} --and cd."companyId"= 
				${queryDate}
			`);
      queryTotal = queryTotal[0];
      queryCount = queryCount[0];
      if (queryTotal[0].accountbalance == null)
        queryTotal[0].accountbalance = 0;
    } else if (typeId === 3) {
      queryCount = await this.cashDisbursementHeaderRepository.sequelize
        .query(`select
				count(cd.id)
				from "cashDisbursementHeader" cd
				inner join transaction t on t.id=cd."tranId" and t."companyId"=cd."companyId"
				where
				--cd."companyId"=  and
				(cd."vendorUnderPayment"-cd."vendorOverPayment")<>0
				and cd."vendorId"=${vendorId}
				${queryDate}`);
      queryTable = await this.cashDisbursementHeaderRepository.sequelize
        .query(`SELECT
				t."transactionNo" AS CRID,
				cd."cdDate" AS Date,
				cd.status AS Status,
				cd.id,
				cd."amountOwing" AS Owing,
				cd."amountPaid" AS Paid,
				cd."vendorUnderPayment" AS UnderPMTCr,
				cd."vendorOverPayment" AS OverPMTDr,
				COALESCE(SUM(op."amtApplied"), 0) AS "totalAmtApplied",
				(cd."vendorOverPayment" - COALESCE(SUM(op."amtApplied"), 0)) -  cd."vendorUnderPayment" AS "overPMTBal"
				FROM
				"cashDisbursementHeader" cd
				INNER JOIN
				transaction t ON t.id = cd."tranId" AND t."companyId" = cd."companyId"
			LEFT JOIN
				"cashDisbursementOverPayment" op ON op."cashDisbursementHeaderIdOut" = cd."id"
			WHERE
				(cd."vendorUnderPayment" - cd."vendorOverPayment") <> 0
				AND cd."vendorId" = ${vendorId} --and cd."companyId"= 
				${queryDate}
			GROUP BY
				t."transactionNo", cd."cdDate", cd.status, cd.id, cd."amountOwing",
				cd."amountPaid", cd."vendorUnderPayment", cd."vendorOverPayment"
			ORDER BY
				CRID ASC
			LIMIT ${limit} OFFSET ${offset}`);
      queryTotal = await this.cashDisbursementHeaderRepository.sequelize.query(`
						select
				sum(cd."vendorUnderPayment") as totalUnderPMTCr,
				sum(cd."vendorOverPayment") as totalOverPMTDr,
				COALESCE(SUM(op.amtApplied), 0) AS "totalAmtApplied",
				sum(cd."vendorOverPayment") - COALESCE(SUM(op.amtApplied), 0) - sum(cd."vendorUnderPayment") AS "totalOverPaymentBal"--,
				--(sum(cd."vendorUnderPayment")-sum(cd."vendorOverPayment")) as AccountBalanceSales,
				--(sum(cd."vendorOverPayment")-sum(cd."vendorUnderPayment")) as AccountBalanceSales
				--(CASE WHEN (sum(cd."vendorOverPayment")-sum(cd."vendorUnderPayment")) < 0 THEN '('  TO_CHAR(ABS((sum(cd."vendorOverPayment")-sum(cd."vendorUnderPayment"))), '999999999.99')  '), CR' ELSE TO_CHAR((sum(cd."vendorOverPayment")-sum(cd."vendorUnderPayment")), '999999999.99') || ', CR' END) as AccountBalanceSales
				from "cashDisbursementHeader" cd
				inner join transaction t on t.id=cd."tranId"
					left join (
				select
				--*
				co."cashDisbursementHeaderIdOut", sum(co."amtApplied") as amtApplied
				from "cashDisbursementOverPayment" as co
				--where co."companyId"= 
				group by co."cashDisbursementHeaderIdOut"
				--order by co."cashDisbursementHeaderIdOut", co."cashDisbursementHeaderIdIn"
				)op on op."cashDisbursementHeaderIdOut"=cd."id"
						where (cd."vendorUnderPayment"-cd."vendorOverPayment")<>0
						and cd."vendorId"=${vendorId} --and cd."companyId"= 
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

  async findOneById(id): Promise<CashDisbursementHeaderModel> {
    return this.cashDisbursementHeaderRepository.findOne({
      where: {
        id,
      },
      include: [
        {
          model: CashDisbursementPaymentsModel,
        },
        {
          model: CashDisbursementDetailsModel,
        },
        {
          model: Transaction,
        },
        {
          model: CashDisbursementOverPaymentsModel,
        },
      ],
    });
  }

  async findAllByCompanyId(companyId): Promise<CashDisbursementHeaderModel[]> {
    return this.cashDisbursementHeaderRepository.findAll({
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
          model: CashDisbursementPaymentsModel,
        },
        {
          model: CashDisbursementPaymentsModel,
        },
        {
          model: CashDisbursementOverPaymentsModel,
        },
      ],
    });
  }

  async findAllByVendorId(
    vendorId: number,
    page: number,
    startDate,
    endDate,
    type,
  ): Promise<{ rows: CashDisbursementHeaderModel[]; count: number }> {
    let limit = 10;
    let offset = 0 + (page - 1) * limit;
    let whereObj = {
      vendorId,
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
          { vendorUnderPayment: { [Op.not]: 0 } },
          { vendorOverPayment: { [Op.not]: 0 } },
        ],
      });
    }

    const result = this.cashDisbursementHeaderRepository.findAndCountAll({
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
    return this.cashDisbursementHeaderRepository.destroy({
      where: {
        companyId,
      },
    });
  }

  blocked(blockedParams) {
    this.cashDisbursementHeaderRepository.update(
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
    let cdhArr = await this.cashDisbursementHeaderRepository.findAll({
      where: {
        tranId: tranIdArr
      },
    });
    this.cashDisbursementHeaderRepository.update(
      { isBlock: true },
      {
        where: {
          tranId: tranIdArr,
        },
      },
    );
    return cdhArr.map(data => data.id);
  }
}
