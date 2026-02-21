import { Injectable } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionEntryService } from '../transaction-entry/transaction-entry.service'

@Injectable()
export class GeneralLedgerService {

	makeUniq = (arr) => [...new Set(arr)];

	async getFilterData(params) {
		let accNameArr = [];
		let dbCodeArr = [];
		let accNoArr = [];
		let trNoArr = [];
		let entryTypeArr = ['GENERAL', 'LIQUIDATION', 'CASHADVANCE', 'ADJUSTING', 'CLOSING', 'OPENING'];
		let createdByArr = [];
		let amountArr = [];

		let transactionArr = await TransactionService.getTransactionByDate(params.companyId, params.startDate, params.endDate);
		let transactionEntryArr = await TransactionEntryService.getTransactionEntryByDate(params.companyId, params.startDate, params.endDate);

		let accountIdArr = transactionArr.map(tr => {
			trNoArr.push(tr.transactionNo);
			amountArr.push(tr.amount);
			createdByArr.push(tr.createdBy);
			return tr.accountId
		});

		transactionEntryArr.forEach(tre => {
			accountIdArr.push(tre.accountId)
		})

		let allAccountsByCompany = await AccountService.getByAccountIdArr(accountIdArr);
		allAccountsByCompany.forEach(acc => {
			accNameArr.push(acc.name);
			dbCodeArr.push(acc.code);
			if (acc.number)
				accNoArr.push(acc.number);
		});
		return {
			accNameArr: this.makeUniq(accNameArr),
			dbCodeArr: this.makeUniq(dbCodeArr),
			accNoArr: this.makeUniq(accNoArr),
			trNoArr: this.makeUniq(trNoArr),
			entryTypeArr: this.makeUniq(entryTypeArr),
			createdByArr: this.makeUniq(createdByArr),
			amountArr: this.makeUniq(amountArr)
		};
	}

	async getArrBeginBalanceForCompanyId(params) {
		try {
			let queryCond = `where t."companyId"=${params.companyId}`;
			if (params.filterEntity === 'accNameArr' && params.filterEntityTypeId !== 'all') {
				queryCond = queryCond + ` and ac.name = '${params.filterEntityTypeId}'`
			}
			if (params.filterEntity === 'dbCodeArr' && params.filterEntityTypeId !== 'all') {
				queryCond = queryCond + ` and ac.code = '${params.filterEntityTypeId}'`
			}
			if (params.filterEntity === 'accNoArr' && params.filterEntityTypeId !== 'all') {
				queryCond = queryCond + ` and ac.number = '${params.filterEntityTypeId}'`
			}
			if (params.filterEntity === 'entryTypeArr' && params.filterEntityTypeId !== 'all') {
				queryCond = queryCond + ` and t."transactionType" = '${params.filterEntityTypeId}'`
			}
			if (params.filterEntity === 'createdByArr' && params.filterEntityTypeId !== 'all') {
				queryCond = queryCond + ` and t."createdBy" = '${params.filterEntityTypeId}'`
			}
			if (params.filterEntity === 'amountArr' && params.filterEntityTypeId !== 'all') {
				queryCond = queryCond + ` and t."amount" = '${params.filterEntityTypeId}'`
			}
			if (params.filterEntity === 'trNoArr' && params.filterEntityTypeId !== 'all') {
				queryCond = queryCond + ` and t."transactionNo" = '${params.filterEntityTypeId}'`
			}
			let accountsInfArr = await AccountService.getAccountRawQuery(`select gl.accountid,gl.dbcode,gl.accountno,gl.accountname, coalesce(gl.begbalance,0.00) as begbalance from
					(
					select beg.accountid,beg.dbcode,beg.accountno,beg.accountname, 0 as begbalance from (
					SELECT
					ac.id as accountid,
					ac.code as dbcode,
					ac.number as accountno,
					ac.name as accountname
					from types ty
					inner join classes cl on cl."typeId"=ty.id
					inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
					inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
					left outer join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
					left outer join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
					${queryCond}
					and ty."finDocName"='INCOME STATEMENT'
					and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${params.startDate}' as date)
					and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
					--where t."companyId"=162 and ty."finDocName"='INCOME STATEMENT'
					--and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('01/01/2023' as date)
					--and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('12/31/2023' as date)
					group by ac.id,ac.code, ac.number, ac.name) as beg

					UNION ALL
					select beg.accountid,beg.dbcode,beg.accountno,beg.accountname, coalesce(begbal.begbalance,0.00) as begbalance from (
					SELECT
					ac.id as accountid,
					ac.code as dbcode,
					ac.number as accountno,
					ac.name as accountname
					from types ty
					inner join classes cl on cl."typeId"=ty.id
					inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
					inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
					left outer join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
					left outer join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
					${queryCond}
					and ty."finDocName"='BALANCE SHEET'
					and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
					--where t."companyId"=162 and ty."finDocName"='BALANCE SHEET'
					--and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('12/31/2023' as date)
					group by ac.id,ac.code, ac.number, ac.name) as beg
					left outer join (
					SELECT
					gld.accountid,
					gld.dbcode,
					gld.accountname,
					(case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else sum(gld.credit)-sum(gld.debit) end) as begbalance
					FROM
					(
					SELECT
					ac.id as accountid,
					ac.code as dbcode,
					ac.number as accountno,
					ac.name as accountname,
					ac."DRCRCode" as "ADRCRCode",
					(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
					(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
					from types ty
					inner join classes cl on cl."typeId"=ty.id
					inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
					inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"			
					left outer join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
					left outer join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
					${queryCond}
					and ty."finDocName"='BALANCE SHEET'
					and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.startDate}' as date)
					--where t."companyId"=162 and ty."finDocName"='BALANCE SHEET'
					--and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('01/01/2023' as date)
					group by ac.id,ac.code, ac.number,ac.name,te."DRCRCode",ac."DRCRCode") as gld
					group by gld.accountid,gld.dbcode,gld.accountno,gld.accountname,gld."ADRCRCode") begbal on begbal.accountid=beg.accountid

					UNION ALL
					select id as accountid,code as "dbCode",number as accountno,name as accountname,
					(case when "DRCRCode"='DR' then
								
					(
					(case when public.get_retainedearnings(${params.companyId},'${params.startDate}')<0 then public.get_retainedearnings(${params.companyId},'${params.startDate}')*-1 else 0 end) -
					(case when public.get_retainedearnings(${params.companyId},'${params.startDate}')>0 then public.get_retainedearnings(${params.companyId},'${params.startDate}') else 0 end)

					--(case when public.get_retainedearnings(162,'01/01/2023')<0 then public.get_retainedearnings(162,'01/01/2023')*-1 else 0 end) -
					--(case when public.get_retainedearnings(162,'01/01/2023')>0 then public.get_retainedearnings(162,'01/01/2023') else 0 end)
					)

					else

					(
					(case when public.get_retainedearnings(${params.companyId},'${params.startDate}')>0 then public.get_retainedearnings(${params.companyId},'${params.startDate}') else 0 end) -
					(case when public.get_retainedearnings(${params.companyId},'${params.startDate}')<0 then public.get_retainedearnings(${params.companyId},'${params.startDate}')*-1 else 0 end)

					--(case when public.get_retainedearnings(162,'01/01/2023')>0 then public.get_retainedearnings(162,'01/01/2023') else 0 end) -
					--(case when public.get_retainedearnings(162,'01/01/2023')<0 then public.get_retainedearnings(162,'01/01/2023')*-1 else 0 end)
					)
					
					end
					) as begbalance           
					from accounts where "companyId" = ${params.companyId} and name = 'Retained Earnings'
						
					) as gl
					ORDER BY  string_to_array(gl.dbcode, '.', '')::int[];

					`);
			return accountsInfArr;
		} catch (error) {
			console.log(error)
		}

	}

	async getDetailsExport(params) {
		// console.log('params');
		// console.log(params);
		try {
			let queryCond = `where t."companyId"=${params.companyId}`;
			if (params.filterEntity === 'accNameArr' && params.filterEntityTypeId !== 'all') {
				queryCond = queryCond + ` and ac.name = '${params.filterEntityTypeId}'`
			}
			if (params.filterEntity === 'dbCodeArr' && params.filterEntityTypeId !== 'all') {
				queryCond = queryCond + ` and ac.code = '${params.filterEntityTypeId}'`
			}
			if (params.filterEntity === 'accNoArr' && params.filterEntityTypeId !== 'all') {
				queryCond = queryCond + ` and ac.number = '${params.filterEntityTypeId}'`
			}
			if (params.filterEntity === 'entryTypeArr' && params.filterEntityTypeId !== 'all') {
				queryCond = queryCond + ` and t."transactionType" = '${params.filterEntityTypeId}'`
			}
			if (params.filterEntity === 'createdByArr' && params.filterEntityTypeId !== 'all') {
				queryCond = queryCond + ` and t."createdBy" = '${params.filterEntityTypeId}'`
			}
			if (params.filterEntity === 'amountArr' && params.filterEntityTypeId !== 'all') {
				queryCond = queryCond + ` and t."amount" = '${params.filterEntityTypeId}'`
			}
			if (params.filterEntity === 'trNoArr' && params.filterEntityTypeId !== 'all') {
				queryCond = queryCond + ` and t."transactionNo" = '${params.filterEntityTypeId}'`
			}
			// console.log('queryCond');
			// console.log(queryCond);
			let accountsInfArr = await AccountService.getAccountRawQuery(`--query for gldetailsreport filter by accoutname--
				SELECT
				gld."dbCode",gld.accountno,gld."accountName",
				gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode",
				sum(gld.debit) as debit,
				sum(gld.credit) as credit,
				(case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (partition by gld."dbCode" order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (partition by gld."dbCode" order by gld.tid))  end) as endbalance
				FROM
				(
				select beg.dbcode as "dbCode",beg.accountno,beg.accountname as "accountName"
				,0 as tid,'${params.startDate}' as "transactionDate",'' as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",
				beg."ADRCRCode",coalesce(begbal.debit,0.00) as debit, coalesce(begbal.credit,0.00) as credit
				--,coalesce(begbal.begbalance,0.00) as begbalance
				from (
				SELECT
				ty."sortOrder",ty.code as typecode,ty.name as typename,cl.code as classcode,cl.name as classname,gp.code as groupcode,gp.name as groupname,
				ac.id as accountid,
				ac.code as dbcode,
				ac.number as accountno,
				ac.name as accountname,
				ac."DRCRCode" as "ADRCRCode"
				from types ty
				inner join classes cl on cl."typeId"=ty.id
				inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
				inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
				left outer join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
				left outer join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
				and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${params.startDate}' as date)
				and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
				${queryCond}
				group by ty."sortOrder",ty.code,ty.name,cl.code,cl.name,gp.code,gp.name,ac.id,ac.code,ac.name,ac.number,ac."DRCRCode") as beg
				left outer join (
				SELECT
				gld.accountid,
				gld.dbcode,
				gld.accountname,
				--sum(gld.debit) as debit,
				--sum(gld.credit) as credit,
					(case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else 0 end) as debit,
					(case when gld."ADRCRCode"='CR' then sum(gld.credit)-sum(gld.debit) else 0 end) as credit,
				(case when gld."ADRCRCode"='DR' then sum(gld.debit)-sum(gld.credit) else sum(gld.credit)-sum(gld.debit) end) as begbalance
				FROM
				(
				SELECT
				ac.id as accountid,
				ac.code as dbcode,
				ac.number as accountno,
				ac.name as accountname,
				ac."DRCRCode" as "ADRCRCode",
				(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
				(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
				from types ty
				inner join classes cl on cl."typeId"=ty.id
				inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
				inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
				left outer join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
				left outer join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
				and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${params.startDate}' as date)
				${queryCond}
				group by ac.id,ac.code, ac.number,ac.name,te."DRCRCode",ac."DRCRCode") as gld
				group by gld.accountid,gld.dbcode,gld.accountno,gld.accountname,gld."ADRCRCode") begbal on begbal.accountid=beg.accountid
				--order by beg."sortOrder", beg.typecode, beg.typename, beg.classcode, beg.classname, beg.groupcode, beg.groupname, beg.accountname
				UNION ALL
				SELECT
				ac.code as "dbCode",ac.number as accountno,ac.name as "accountName",
				t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",ac."DRCRCode" as "ADRCRCode",
				(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
				(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
				from types ty
				inner join classes cl on cl."typeId"=ty.id
				inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
				inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
				inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
				inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
				and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${params.startDate}' as date)
				and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
				${queryCond}
				group by ac.code,ac.number,ac.name,t.id, t."transactionDate", t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",te."DRCRCode",ac."DRCRCode",t."createdBy") as gld
				group by gld."dbCode",gld.accountno,gld."accountName",gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."ADRCRCode",gld."createdBy"`);
			return accountsInfArr;
		} catch (error) {
			console.log(error)
		}

	}

	async getTEDetailsForAccId(params) {
		// let accountsInfArr = await AccountService.getAccountRawQuery(`SELECT
		// 	gld."dbCode",gld."accountName",
		// 	gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode",
		// 	sum(gld.debit) as debit,
		// 	sum(gld.credit) as credit,
		// 	(case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (order by gld.tid))  end) as endbalance
		// 	FROM
		// 	(
		// 	SELECT
		// 	beg."dbCode",beg."accountName",0 as tid,NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",beg."ADRCRCode",
		// 	sum(beg.debit) as debit,
		// 	sum(beg.credit) as credit
		// 	FROM (
		// 	SELECT
		// 	ac.code as "dbCode",ac.name as "accountName",ac."DRCRCode" as "ADRCRCode",
		// 	(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
		// 	(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
		// 	from types ty
		// 	inner join classes cl on cl."typeId"=ty.id
		// 	inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
		// 	inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
		// 	inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
		// 	inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
		// 	where t."companyId"=${params.companyId} and ac.id=${params.accountId}
		// 	and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${params.startDate}' as date)
		// 	group by ac.code,ac.name,te."DRCRCode",ac."DRCRCode") as beg
		// 	group by beg."dbCode",beg."accountName",beg."ADRCRCode"
		// 	UNION ALL
		// 	SELECT
		// 	ac.code as "dbCode",ac.name as "accountName",
		// 	t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",ac."DRCRCode" as "ADRCRCode",
		// 	(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
		// 	(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
		// 	from types ty
		// 	inner join classes cl on cl."typeId"=ty.id
		// 	inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
		// 	inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
		// 	inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
		// 	inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
		// 	where t."companyId"=${params.companyId} and ac.id=${params.accountId}
		// 	and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${params.startDate}' as date)
		// 	and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
		// 	group by ac.code,ac.name,t.id, t."transactionDate", t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",te."DRCRCode",ac."DRCRCode",t."createdBy") as gld
		// 	group by gld."dbCode",gld."accountName",gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."ADRCRCode",gld."createdBy"`);
		// let accountsInfArr = await AccountService.getAccountRawQuery(`SELECT
		// 	gld."dbCode",gld."accountName",
		// 	gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode",
		// 	sum(gld.debit) as debit,
		// 	sum(gld.credit) as credit,
		// 	(case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (order by gld."transactionDate",gld."transactionNo")) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (order by gld."transactionDate",gld."transactionNo"))  end) as endbalance
		// 	FROM
		// 	(
		// 	SELECT
		// 	beg."dbCode",beg."accountName",0 as tid,NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",beg."ADRCRCode",
		// 	sum(beg.debit) as debit,
		// 	sum(beg.credit) as credit
		// 	FROM (
		// 	SELECT
		// 	ac.code as "dbCode",ac.name as "accountName",ac."DRCRCode" as "ADRCRCode",
		// 	(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
		// 	(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
		// 	from types ty
		// 	inner join classes cl on cl."typeId"=ty.id
		// 	inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
		// 	inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
		// 	inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
		// 	inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
		// 	where t."companyId"=90 and ac.id=246
		// 	and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${params.startDate}' as date)
		// 	group by ac.code,ac.name,te."DRCRCode",ac."DRCRCode") as beg
		// 	group by beg."dbCode",beg."accountName",beg."ADRCRCode"
		// 	UNION ALL
		// 	SELECT
		// 	ac.code as "dbCode",ac.name as "accountName",
		// 	t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",ac."DRCRCode" as "ADRCRCode",
		// 	(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
		// 	(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
		// 	from types ty
		// 	inner join classes cl on cl."typeId"=ty.id
		// 	inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
		// 	inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
		// 	inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
		// 	inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
		// 	where t."companyId"=90 and ac.id=246
		// 	and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${params.startDate}' as date)
		// 	and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
		// 	group by ac.code,ac.name,t.id, t."transactionDate", t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",te."DRCRCode",ac."DRCRCode",t."createdBy") as gld
		// 	group by gld."dbCode",gld."accountName",gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."ADRCRCode",gld."createdBy"
		// 	order by gld."transactionDate", gld."transactionNo"`);
		// let accountsInfArr = await AccountService.getAccountRawQuery(`SELECT
		// 	gld."dbCode",gld."accountName",
		// 	gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode",
		// 	sum(gld.debit) as debit,
		// 	sum(gld.credit) as credit,
		// 	(case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (order by gld."transactionDate",gld."transactionNo")) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (order by gld."transactionDate",gld."transactionNo"))  end) as endbalance
		// 	FROM
		// 	(
		// 	SELECT
		// 	beg."dbCode",beg."accountName",0 as tid,NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",beg."ADRCRCode",
		// 	sum(beg.debit) as debit,
		// 	sum(beg.credit) as credit
		// 	FROM (
		// 	SELECT
		// 	ac.code as "dbCode",ac.name as "accountName",ac."DRCRCode" as "ADRCRCode",
		// 	(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
		// 	(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
		// 	from types ty
		// 	inner join classes cl on cl."typeId"=ty.id
		// 	inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
		// 	inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
		// 	inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
		// 	inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
		// 	where t."companyId"=${params.companyId} and ac.id=${params.accountId}
		// 	and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${params.startDate}' as date)
		// 	group by ac.code,ac.name,te."DRCRCode",ac."DRCRCode") as beg
		// 	group by beg."dbCode",beg."accountName",beg."ADRCRCode"
		// 	UNION ALL
		// 	SELECT
		// 	ac.code as "dbCode",ac.name as "accountName",
		// 	t.id as tid,
		// 	t."transactionDate" as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",ac."DRCRCode" as "ADRCRCode",
		// 	(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
		// 	(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
		// 	from types ty
		// 	inner join classes cl on cl."typeId"=ty.id
		// 	inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
		// 	inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
		// 	inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
		// 	inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
		// 	where t."companyId"=${params.companyId} and ac.id=${params.accountId}
		// 	and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${params.startDate}' as date)
		//  	and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
		// 	group by ac.code,ac.name,t.id, t."transactionDate", t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",te."DRCRCode",ac."DRCRCode",t."createdBy") as gld
		// 	group by gld."dbCode",gld."accountName",gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."ADRCRCode",gld."createdBy"
		// 	order by gld."transactionDate", gld."transactionNo"`);
		// 	let accountsInfArr = await AccountService.getAccountRawQuery(`select
		//     cte_1.id,cte_1."transactionDate",cte_1."transactionCode",cte_1."transactionNo",cte_1."transactionType",cte_1."transactionDescription",cte_1."ADRCRCode",
		//     sum(cte_1.debit) as debit,
		//     sum(cte_1.credit) as credit,
		//     (case when cte_1."ADRCRCode"='DR' then (sum((0+sum(cte_1.debit)-sum(cte_1.credit))) over (order by cte_1."transactionDate",cte_1."transactionNo" )) else (sum((0-sum(cte_1.debit)+sum(cte_1.credit))) over (order by cte_1."transactionDate",cte_1."transactionNo"))  end) as balance
		//     from
		//     (
		// 		select
		// 		0 as id,cast('${params.startDate}' as date) as "transactionDate",'' as "transactionCode",'' as "transactionNo",'' as "transactionType",'Beginning Balance' as "transactionDescription",
		// 		a."DRCRCode" as "ADRCRCode",
		//       (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
		//       (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
		//       from transaction tr
		//       inner join "transactionEntry" te on te."transactionId"=tr.id and te."companyId"=tr."companyId"
		//       inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
		//       where te."accountId"=997 and te."companyId"=90
		// 	  and cast(to_char(tr."transactionDate", 'mm/dd/yyyy') as date) < cast('${params.startDate}' as date)
		// 	  --and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${params.startDate}' as date)
		//       group by tr.id,tr."transactionDate",tr."transactionCode",tr."transactionNo",tr."transactionType",tr."transactionDescription",te."DRCRCode",a."DRCRCode"
		// union all

		// 	  select
		//       tr.id,tr."transactionDate",tr."transactionCode",tr."transactionNo",tr."transactionType",tr."transactionDescription",a."DRCRCode" as "ADRCRCode",
		//       (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
		//       (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
		//       from transaction tr
		//       inner join "transactionEntry" te on te."transactionId"=tr.id and te."companyId"=tr."companyId"
		//       inner join accounts a on a.id=te."accountId" and a."companyId"=te."companyId"
		//       where te."accountId"=${params.accountId}
		// 	  and cast(to_char(tr."transactionDate", 'mm/dd/yyyy') as date) >= cast('01/01/2023' as date)
		// 	  and cast(to_char(tr."transactionDate", 'mm/dd/yyyy') as date) <= cast('12/31/2023' as date)
		// 	  --and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${params.startDate}' as date)
		// 	  --and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
		//       group by tr.id,tr."transactionDate",tr."transactionCode",tr."transactionNo",tr."transactionType",tr."transactionDescription",te."DRCRCode",a."DRCRCode"
		//     ) as cte_1
		//     group by cte_1.id,cte_1."transactionDate",cte_1."transactionCode",cte_1."transactionNo",cte_1."transactionType",cte_1."transactionDescription",cte_1."ADRCRCode"
		//     order by cte_1."transactionDate",cte_1."transactionNo"`);
		//accountsInfArr.shift();
		let accountsInfArr = await AccountService.getAccountRawQuery(`SELECT
			gld."dbCode",gld."accountName",
			gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."createdBy",gld."ADRCRCode",
			sum(gld.debit) as debit,
			sum(gld.credit) as credit,
			gld.tid,
			(case when gld."ADRCRCode"='DR' then (sum((0+sum(gld.debit)-sum(gld.credit))) over (order by gld.tid)) else (sum((0-sum(gld.debit)+sum(gld.credit))) over (order by gld.tid))  end) as endbalance
			FROM
			(
			SELECT
			beg."dbCode",beg."accountName",0 as tid,NULL as "transactionDate",NULL as "transactionNo",NULL as "transactionType",'BeginningBalance' as "transactionDescription",NULL as "createdBy",beg."ADRCRCode",
			--sum(beg.debit) as debit,
			--sum(beg.credit) as credit
			(case when beg."ADRCRCode"='DR' then sum(beg.debit)-sum(beg.credit) else 0 end) as debit,
			(case when beg."ADRCRCode"='CR' then sum(beg.credit)-sum(beg.debit) else 0 end) as credit
			FROM (
			SELECT
			ac.code as "dbCode",ac.name as "accountName",ac."DRCRCode" as "ADRCRCode",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from types ty
			inner join classes cl on cl."typeId"=ty.id
			inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
			inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
			inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
			inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
			where ac.id=${params.accountId}
			and ty."finDocName"='BALANCE SHEET'
			and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('${params.startDate}' as date)
			--where t."companyId"=162 and ac.id=1448 and ty."finDocName"='BALANCE SHEET'
			--and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) < cast('01/01/2023' as date)
			group by ac.code,ac.name,te."DRCRCode",ac."DRCRCode") as beg 
			group by beg."dbCode",beg."accountName",beg."ADRCRCode"
			UNION ALL
			SELECT
			ac.code as "dbCode",ac.name as "accountName",
			t.id as tid, to_char(t."transactionDate", 'mm/dd/yyyy') as "transactionDate" , t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",ac."DRCRCode" as "ADRCRCode",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from types ty
			inner join classes cl on cl."typeId"=ty.id
			inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
			inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
			inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
			inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
			where ac.id=${params.accountId}
			and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('${params.startDate}' as date)
			and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('${params.endDate}' as date)
			--where t."companyId"=162 and ac.id=1448
			--and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('01/01/2023' as date)
			--and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('12/31/2023' as date)	
			group by ac.code,ac.name,t.id, t."transactionDate", t."transactionNo", t."transactionType", t."transactionDescription",t."createdBy",te."DRCRCode",ac."DRCRCode",t."createdBy") as gld
			group by gld."dbCode",gld."accountName",gld.tid, gld."transactionDate", gld."transactionNo", gld."transactionType", gld."transactionDescription",gld."ADRCRCode",gld."createdBy"`);
		return accountsInfArr;
	}

	async getOrganisation(
		companyId: number,
		accountId: number,
		filterBy: string,
		id: number
	) {
		switch (filterBy) {
			case 'bu':
				if(id === null)
					return this.getOrganisationFilterByAllBusinessUnit(companyId, accountId)
				else
					return this.getOrganisationFilterByBusinessUnitId(companyId, accountId, id);

			case 'eng':
				if(id === null)
					return this.getOrganisationFilterByAllEngagement(companyId, accountId)
				else
					return this.getOrganisationFilterByEngagementId(companyId, accountId, id);

			case 'proj':
				if(id === null)
					return this.getOrganisationFilterByAllProject(companyId, accountId)
				else
					return this.getOrganisationFilterByProjectId(companyId, accountId, id);

			default:
				return this.getOrganisationWithoutFilter(companyId, accountId);
		}
	}

	async getOrganisationWithoutFilter(companyId, accountId) {
		return AccountService.getAccountRawQuery(`
			select glo."accountId" as accountid, ac.name as accountname,0 as "buId",0 as "entityId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			from
			(
			select
			te."accountId",te."buId",te."entityId",te."taskId",te."employeeId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId}
			group by te."accountId",te."buId", te."entityId",te."taskId",te."employeeId",te."DRCRCode"
			) glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId",ac.name,ac."DRCRCode"
			
			UNION ALL
			
			select 
			glo."accountId", '' as accountname, glo."buId" as "buId", 0 as "entityId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			
			from
			(
			select
			te."accountId",te."buId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId}
			group by te."accountId",te."buId",te."DRCRCode"
			) as glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId", glo."buId",ac.name,ac."DRCRCode"
			
			UNION ALL
			
			select 
			glo."accountId", '' as accountname, 0 as "buId", glo."entityId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			
			from
			(
			select
			te."accountId",te."entityId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId}
			group by te."accountId",te."entityId",te."DRCRCode"
			) as glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId", glo."entityId",ac.name,ac."DRCRCode"`)
	}

	async getOrganisationFilterByAllBusinessUnit(companyId, accountId) {
		return AccountService.getAccountRawQuery(`
			select glo."accountId" as accountid, ac.name as accountname,
			'' as isallocated,
			0 as "buId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			from
			(
			select
			te."accountId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId}
			group by te."accountId", te."DRCRCode"
			) glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId",ac.name,ac."DRCRCode"
			
			UNION ALL
			
			select glo."accountId" as accountid, ac.name as accountname,
			'ALLOCATED' as isallocated,
			glo."buId" as "buId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			from
			(
			select
			te."accountId",te."buId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId}
			group by te."accountId",te."buId",te."DRCRCode"
			) glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId",ac.name,glo."buId",ac."DRCRCode"`)
	}

	async getOrganisationFilterByAllEngagement(companyId, accountId) {
		return AccountService.getAccountRawQuery(`
			select glo."accountId" as accountid, ac.name as accountname,
			'' as isallocated,
			0 as "entityId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			from
			(
			select
			te."accountId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId}
			group by te."accountId", te."DRCRCode"
			) glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId",ac.name,ac."DRCRCode"
			
			UNION ALL
			
			select glo."accountId" as accountid, ac.name as accountname,
			'ALLOCATED' as isallocated,
			glo."entityId" as "entityId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			from
			(
			select
			te."accountId",te."entityTypeId",te."entityId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId} and te."entityTypeId"=3
			group by te."accountId",te."entityTypeId",te."entityId",te."DRCRCode"
			) glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId",ac.name,glo."entityTypeId",glo."entityId",ac."DRCRCode"
			
			UNION ALL
			
			select glo."accountId" as accountid, ac.name as accountname,
			'UNALLOCATED' as isallocated,
			0 as "entityId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			from
			(
			select
			te."accountId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId} and te."entityTypeId"<>3
			group by te."accountId",te."DRCRCode"
			) glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId",ac.name,ac."DRCRCode"`)
	}

	async getOrganisationFilterByAllProject(companyId, accountId) {
		return AccountService.getAccountRawQuery(`
			select glo."accountId" as accountid, ac.name as accountname,
			'' as isallocated,
			0 as "entityId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			from
			(
			select
			te."accountId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId}
			group by te."accountId", te."DRCRCode"
			) glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId",ac.name,ac."DRCRCode"
			
			UNION ALL
			
			select glo."accountId" as accountid, ac.name as accountname,
			'ALLOCATED' as isallocated,
			glo."entityId" as "entityId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			from
			(
			select
			te."accountId",te."entityTypeId",te."entityId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId} and te."entityTypeId"=1
			group by te."accountId",te."entityTypeId",te."entityId",te."DRCRCode"
			) glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId",ac.name,glo."entityTypeId",glo."entityId",ac."DRCRCode"
			
			UNION ALL
			
			select glo."accountId" as accountid, ac.name as accountname,
			'UNALLOCATED' as isallocated,
			0 as "entityId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			from
			(
			select
			te."accountId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId} and te."entityTypeId"<>1
			group by te."accountId",te."DRCRCode"
			) glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId",ac.name,ac."DRCRCode"`)
	}

	async getOrganisationFilterByBusinessUnitId(companyId, accountId, id) {
		return AccountService.getAccountRawQuery(`
			select glo."accountId" as accountid, ac.name as accountname,
			'' as isallocated,
			0 as "buId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			from
			(
			select
			te."accountId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId}
			group by te."accountId", te."DRCRCode"
			) glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId",ac.name,ac."DRCRCode"
			
			UNION ALL
			
			select glo."accountId" as accountid, ac.name as accountname,
			'ALLOCATED' as isallocated,
			glo."buId" as "buId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			from
			(
			select
			te."accountId",te."buId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId} and te."buId"=${id}
			group by te."accountId",te."buId",te."DRCRCode"
			) glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId",ac.name,glo."buId",ac."DRCRCode"
			
			UNION ALL
			
			select glo."accountId" as accountid, ac.name as accountname,
			'UNALLOCATED' as isallocated,
			0 as "buId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			from
			(
			select
			te."accountId",te."buId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId} and te."buId"<>${id}
			group by te."accountId",te."buId",te."DRCRCode"
			) glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId",ac.name,ac."DRCRCode"`)
	}

	async getOrganisationFilterByEngagementId(companyId, accountId, id) {
		return AccountService.getAccountRawQuery(`
			select glo."accountId" as accountid, ac.name as accountname,
			'' as isallocated,
			0 as "entityId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			from
			(
			select
			te."accountId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId}
			group by te."accountId", te."DRCRCode"
			) glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId",ac.name,ac."DRCRCode"
			
			UNION ALL
			
			select glo."accountId" as accountid, ac.name as accountname,
			'ALLOCATED' as isallocated,
			glo."entityId" as "entityId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			from
			(
			select
			te."accountId",te."entityTypeId",te."entityId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId} and te."entityTypeId"=3 and te."entityId"=${id}
			group by te."accountId",te."entityTypeId",te."entityId",te."DRCRCode"
			) glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId",ac.name,glo."entityTypeId",glo."entityId",ac."DRCRCode"
			
			UNION ALL
			
			select glo."accountId" as accountid, ac.name as accountname,
			'UNALLOCATED' as isallocated,
			0 as "entityId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			from
			(
			select
			te."accountId",te."entityId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId} and
			te."entityId"<>${id}
			group by te."accountId",te."entityId",te."DRCRCode"
			) glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId",ac.name,ac."DRCRCode"`)
	}

	async getOrganisationFilterByProjectId(companyId, accountId, id) {
		return AccountService.getAccountRawQuery(`			
			select glo."accountId" as accountid, ac.name as accountname,
			'' as isallocated,
			0 as "entityId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			from
			(
			select
			te."accountId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId}
			group by te."accountId", te."DRCRCode"
			) glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId",ac.name,ac."DRCRCode"
			
			UNION ALL
			
			select glo."accountId" as accountid, ac.name as accountname,
			'ALLOCATED' as isallocated,
			glo."entityId" as "entityId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			from
			(
			select
			te."accountId",te."entityTypeId",te."entityId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId} and te."entityTypeId"=1 and te."entityId"=${id}
			group by te."accountId",te."entityTypeId",te."entityId",te."DRCRCode"
			) glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId",ac.name,glo."entityTypeId",glo."entityId",ac."DRCRCode"
			
			UNION ALL
			
			select glo."accountId" as accountid, ac.name as accountname,
			'UNALLOCATED' as isallocated,
			0 as "entityId",
			(case when ac."DRCRCode" = 'DR' then sum(glo.debit)-sum(glo.credit) else 0 end) as debit, 
			(case when ac."DRCRCode" = 'CR' then sum(glo.debit)-sum(glo.credit) else 0 end) as credit
			from
			(
			select
			te."accountId",te."entityId",
			(case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
			(case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
			from transaction t
			inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
			where t."companyId"=${companyId} and te."accountId"=${accountId} and
			te."entityId"<>${id}
			group by te."accountId",te."entityId",te."DRCRCode"
			) glo
			inner join accounts ac on ac.id=glo."accountId" and ac."companyId"=${companyId}
			group by glo."accountId",ac.name,ac."DRCRCode"`)
	}
}
