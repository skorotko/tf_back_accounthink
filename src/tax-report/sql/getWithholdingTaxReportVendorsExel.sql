select
ROW_NUMBER() OVER (ORDER BY vd1.tid) AS seqNo,
vd1.TIN,
'' as corporation,--vendor registered name/corporation
'' as individual,--name of the individual (Last Name, First Name, Middle Name)/Individual
vd1.atcCode, vd1.naturePayment,
vd1.firstMonthQtrIncomePayment, vd1.firstMonthQtrTaxRate, vd1.firstMonthQtrAmountTaxWithheld,
vd1.secondMonthQtrIncomePayment, vd1.secondMonthQtrTaxRate, vd1.secondMonthQtrAmountTaxWithheld,
vd1.thirdMonthQtrIncomePayment, vd1.thirdMonthQtrTaxRate, vd1.thirdMonthQtrAmountTaxWithheld,
(vd1.firstMonthQtrIncomePayment + vd1.secondMonthQtrIncomePayment + vd1.thirdMonthQtrIncomePayment) as totalQtrIncomePayment,
(vd1.firstMonthQtrAmountTaxWithheld + vd1.secondMonthQtrAmountTaxWithheld + vd1.thirdMonthQtrIncomePayment) as totalTaxWithheld,
vd1.vendorId
from
(
    SELECT
    vd.TIN,
    vd.taxcode as atcCode,
    vd.naturePayment as naturePayment,
    (CASE
    	WHEN EXTRACT(MONTH FROM cast(vd.Date as date)) in (1,4,7,10) THEN (case when vd.GrossAmount=0 then 0 else (case when vd."taxAssignAccountId"=30 then (vd.GrossAmount*-1) else vd.GrossAmount end) end)
    	ELSE 0 END) as firstMonthQtrIncomePayment,

    (CASE
     	WHEN EXTRACT(MONTH FROM cast(vd.Date as date)) in (1,4,7,10) THEN vd.taxrate
     	ELSE 0 END) as firstMonthQtrTaxRate,

    (CASE WHEN EXTRACT(MONTH FROM cast(vd.Date as date)) in (1,4,7,10) THEN
     	(case when vd.TaxAmount=0 then 0 else (case when vd."taxAssignAccountId"=30 then (vd.TaxAmount*-1) else vd.TaxAmount end) end)
     		ELSE 0 END) as firstMonthQtrAmountTaxWithheld,

    (CASE
    	WHEN EXTRACT(MONTH FROM cast(vd.Date as date)) in (2,5,8,11) THEN (case when vd.GrossAmount=0 then 0 else (case when vd."taxAssignAccountId"=30 then (vd.GrossAmount*-1) else vd.GrossAmount end) end)
    	ELSE 0 END) as secondMonthQtrIncomePayment,

    (CASE
     	WHEN EXTRACT(MONTH FROM cast(vd.Date as date)) in (2,5,8,11) THEN vd.taxrate
     	ELSE 0 END) as secondMonthQtrTaxRate,

    (CASE WHEN EXTRACT(MONTH FROM cast(vd.Date as date)) in (2,5,8,11) THEN
     	(case when vd.TaxAmount=0 then 0 else (case when vd."taxAssignAccountId"=30 then (vd.TaxAmount*-1) else vd.TaxAmount end) end)
     		ELSE 0 END) as secondMonthQtrAmountTaxWithheld,

    (CASE
    	WHEN EXTRACT(MONTH FROM cast(vd.Date as date)) in (3,6,9,12) THEN (case when vd.GrossAmount=0 then 0 else (case when vd."taxAssignAccountId"=30 then (vd.GrossAmount*-1) else vd.GrossAmount end) end)
    	ELSE 0 END) as thirdMonthQtrIncomePayment,

    (CASE
     	WHEN EXTRACT(MONTH FROM cast(vd.Date as date)) in (3,6,9,12) THEN vd.taxrate
     	ELSE 0 END) as thirdMonthQtrTaxRate,

    (CASE WHEN EXTRACT(MONTH FROM cast(vd.Date as date)) in (3,6,9,12) THEN
     	(case when vd.TaxAmount=0 then 0 else (case when vd."taxAssignAccountId"=30 then (vd.TaxAmount*-1) else vd.TaxAmount end) end)
     		ELSE 0 END) as thirdMonthQtrAmountTaxWithheld,

    vd.vendorId,
    vd.tid

    FROM
    (
        select
        te."vendorId" as vendorId,
        '' as TIN,
        to_char(cast(:endDate as date), 'mm/dd/yyyy') as Date,
        --to_char(t."transactionDate", 'dd Mon YYYY') as Date,
        t."transactionNo" as ID,
        t."transactionType" as EntryType,
        t."transactionDescription" as Description,
        t."createdBy" as CreatedBy,
        t.id as tid,
        (case when
        (select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode") is null
        then
        (te.amount/
        ((select tr.rate from "withHoldingTax" st inner join "taxRate" tr on tr."withHoldingTaxId"=st.id where st.id=ac."taxId")/100.00))
        else
        (select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
        end) as GrossAmount,
        te.amount as TaxAmount,
        (select code from "withHoldingTax" where id=ac."taxId") as taxcode,
        (select tr.rate from "withHoldingTax" wt inner join "taxRate" tr on tr."withHoldingTaxId"=wt.id where wt.id=ac."taxId") as taxrate,
        (select "viewCode" from "withHoldingTax" where id=ac."taxId") as viewTaxcode,
        (case when t."sourceReference" is null then 'False' else 'True' end) as "sourceReference",
        (case when t."isPosted"='true' then 'Added' else
        (case when t."checkedBy" is not null then 'Checked' else
        (case when t."isSendToAcc"='true' then 'Send to Accountant' else
        (case when t."recorderBy" is not null then 'Recorded' else '' end)end)end)end) as vendorStatus,
        (case when te."VatRCheked" is null then 'False' else te."VatRCheked" end) as report,
        (case when te."VatRCleared" is null then 'False' else te."VatRCleared" end) as reported,
        (select "accountTypeId" from accounts where id=
        (select "accountId" from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
        )
        as "taxAssignAccountId",
        te.id as teid,
        (select description from "withHoldingTax" where id=ac."taxId") as naturePayment--Nature of Payment

        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts ac on ac.id=te."accountId" and ac."companyId"=te."companyId"
        where t."companyId"=:companyId
        and te."vendorId" is not NULL
        and te."clientId" IS NULL and te."employeeId" IS NULL and te."isAllocated"='ALLOCATED'
        and t."isPosted"='true' and t."isVoid"='false' and t."isDeleted"='false'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast(:endDate as date)
        and ac."accountTypeId"=13
    ) as vd
    order by vd.vendorId, vd.tid, vd.teid
) as vd1