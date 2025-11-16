select
df.codeDetail,df.codeDetail1601EQ,
ROW_NUMBER() OVER (ORDER BY df.vendorId) AS seqNo,--sequence number
df.TIN,df.vendorBranchCode,df.registeredName,df.lastName,df.firstName,df.middleName,
df.taxableMonth,df.atcCode,
cast(sum(df.taxrate) as numeric(18,2)) as taxRate,
cast(sum(df.amountIncomePayment) as numeric(18,2)) as amountIncomePayment,
cast(sum(df.amountTaxWithheld) as numeric(18,2)) as amountTaxWithheld,
df.vendorId
from
    (
        select
        te."vendorId" as vendorId,
        'D1' as codeDetail,--code for Detail/Type of alphalist
        '1601EQ' as codeDetail1601EQ,--code for 1601EQ/Form type code
        '' as TIN,
        '' as vendorBranchCode,
        '' as registeredName,--vendor registered name/corporation
        '' as lastName,--individual last name
        '' as firstName,--individual first name
        '' as middleName,--individual middle name
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
group by df.vendorId,df.codeDetail,df.codeDetail1601EQ,df.TIN,df.vendorBranchCode,df.registeredName,df.lastName,df.firstName,df.middleName,df.taxableMonth,df.atcCode,df.taxrate