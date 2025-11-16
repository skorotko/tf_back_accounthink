--SAWT 2550Q Control--
select
df.codeControl,df.codeControl2550Q,
df.ownersTin, df.ownersBranchCode,
df.taxableMonth,
cast(sum(df.amountIncomePayment) as numeric(18,2)) as amountIncomePayment,
cast(sum(df.amountTaxWithheld) as numeric(18,2)) as amountTaxWithheld

from
(
select
'CSAWT' as codeControl,--code for Control/Type of alphalist
'C2550Q' as codeControl2550Q,--code for 2550Q/Form type code
'' as ownersTin,--company's/owner's TIN
'' as ownersBranchCode,--company's/owner's branch code
to_char(((date_trunc('month', cast(:endDate as date)) ) + interval '1 month - 1 day'), 'mm/dd/yyyy') as taxableMonth,--Taxable Month
(case when
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode") is null
then
(te.amount/
((select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00))
else
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
end) as amountIncomePayment,--Amount of Income Payment

te.amount as amountTaxWithheld--Amount of TaxWithheld

FROM transaction t
inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
inner join accounts ac on ac.id=te."accountId" and ac."companyId"=te."companyId"
where t."companyId"=:companyId
and te."clientId" is not NULL
and te."vendorId" IS NULL and te."employeeId" IS NULL and te."isAllocated"='ALLOCATED'
and t."isPosted"='true' and t."isVoid"='false' and t."isDeleted"='false'
and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast(:endDate as date)-- as at date
--and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('01/01/2024' as date)--startdate
--and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('12/31/2024' as date)--enddate
and ac."accountTypeId"=16 and  te."VatRCheked"='True' and te."VatRCleared"='False'
) as df
group by df.codeControl,df.codeControl2550Q,df.ownersTin, df.ownersBranchCode,df.taxableMonth