select
df.codeControl,df.codeControl1601EQ,
df.ownersTin,df.ownersBranchCode,df.taxableMonth,
cast(sum(df.amountIncomePayment) as numeric(18,2)) as totalAmountIncomePayment,
cast(sum(df.amountTaxWithheld) as numeric(18,2)) as totalAmountTaxWithheld
from
    (
        select
        'C1' as codeControl,--code for Detail/Type of alphalist
        '1601EQ' as codeControl1601EQ,--code for 1601EQ/Form type code
        '' as ownersTin,--company's/owner's TIN
        '' as ownersBranchCode,--company's/owner's branch code
        to_char(((date_trunc('month', cast(:endDate as date)) ) + interval '1 month - 1 day'), 'mm/dd/yyyy') as taxableMonth,--Taxable Month
        (select code from "withHoldingTax" where id=ac."taxId") as atcCode,
        (select tr.rate from "withHoldingTax" wt inner join "taxRate" tr on tr."withHoldingTaxId"=wt.id where wt.id=ac."taxId") as taxrate,
        (case when
        (select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode") is null
        then
        (te.amount/
        ((select tr.rate from "withHoldingTax" st inner join "taxRate" tr on tr."withHoldingTaxId"=st.id where st.id=ac."taxId")/100.00))
        else
        (select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
        end) as amountIncomePayment,--Amount of Income Payment
        te.amount as amountTaxWithheld--Amount of TaxWithheld


        FROM transaction t
        inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
        inner join accounts ac on ac.id=te."accountId" and ac."companyId"=te."companyId"
        where t."companyId"=:companyId
        and te."vendorId" is not NULL
        and te."clientId" IS NULL and te."employeeId" IS NULL and te."isAllocated"='ALLOCATED'
        and t."isPosted"='true' and t."isVoid"='false' and t."isDeleted"='false'
        and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast(:endDate as date)
        and ac."accountTypeId"=13
    ) as df
group by df.codeControl,df.codeControl1601EQ,df.ownersTin, df.ownersBranchCode,df.taxableMonth