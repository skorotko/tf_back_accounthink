--SAWT 2550Q Detail--
select
df.codeDetail,df.codeDetail2550Q,
ROW_NUMBER() OVER (ORDER BY df.clientId) AS seqNo,--sequence number
df.TIN,df.customerBranchCode,df.registeredName,df.lastName,df.firstName,df.middleName,
df.taxableMonth,df.naturePayment,df.atcCode,df.taxrate,
cast(sum(df.amountIncomePayment) as numeric(18,2)) as amountIncomePayment,
cast(sum(df.amountTaxWithheld) as numeric(18,2)) as amountTaxWithheld,
df.clientId

from
(
select
te."clientId" as clientId,
'DSAWT' as codeDetail,--code for Detail/Type of alphalist
'D2550Q' as codeDetail2550Q,--code for 2550Q/Form type code
--ROW_NUMBER() OVER (ORDER BY name) AS seqNo,--sequence number
'' as TIN,--customer's Tax Identification Number
'' as customerBranchCode,--customer's/client branch code
'' as registeredName,--customer registered name/corporation
'' as lastName,--individual last name
'' as firstName,--individual first name
'' as middleName,--individual middle name
to_char(((date_trunc('month', cast(:endDate as date)) ) + interval '1 month - 1 day'), 'mm/dd/yyyy') as taxableMonth,--Taxable Month
'' as naturePayment,
(select code from "saleTax" where id=ac."taxId") as atcCode,
(select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId") as taxrate,
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
group by df.clientId,df.codeDetail,df.codeDetail2550Q,df.TIN,df.customerBranchCode,df.registeredName,df.lastName,df.firstName,df.middleName,df.taxableMonth,df.naturePayment,df.atcCode,df.taxrate