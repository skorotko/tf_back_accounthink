select
df.codeDetails,df.codePurchase,df.TIN,df.registeredName,df.lastName,df.firstName,df.middleName,df.supplierAddress,df.supplierAddBrgyCity,
cast(sum(df.exemptPurchase) as numeric(18,2)) as exemptPurchase,
cast(sum(df.zeroRatedPurchase) as numeric(18,2)) as zeroRatedPurchase,
cast(sum(df.servicePurchase) as numeric(18,2)) as servicePurchase,
cast(sum(df.capitalGoodsPurchase) as numeric(18,2)) as capitalGoodsPurchase,
cast(sum(df.otherThanCapitalGoodsPurchase) as numeric(18,2)) as otherThanCapitalGoodsPurchase,
cast(sum(df.InputTaxAmount) as numeric(18,2)) as InputTaxAmount,
--sum(df.grossTaxablePurchase) as grossTaxablePurchase,
df.ownersTin,
df.taxableMonth,
df.vendorId
from
(
select
te."vendorId" as vendorId,
'D' as codeDetails,--code for Details
'P' as codePurchase,--code for Purchase
'' as TIN,--Tax Identification Number
'' as registeredName,--vendor registered name
'' as lastName,--vendor last name
'' as firstName,--vendor first name
'' as middleName,--vendor middle name
'' as supplierAddress, --vendor's address
'' as supplierAddBrgyCity, --vendor's address barangay/city

(case when (select "taxTypeId" from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")=4 then
--(select amount from "transactionEntry" where "accountId"=cast((select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as int) and "transactionId"=t.id)
(case when
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode") is null
then
(te.amount/
((select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00))
else
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
end)
else 0 end) as exemptPurchase,--Amount of Exempt Sales

(case when (select "taxTypeId" from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")=3 then
--(select amount from "transactionEntry" where "accountId"=cast((select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as int) and "transactionId"=t.id)
(case when
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode") is null
then
(te.amount/
((select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00))
else
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
end)
else 0 end) as zeroRatedPurchase,--Amount of Zero Rated Sales

(case when (select "taxTypeId" from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")=1 then
--(select amount from "transactionEntry" where "accountId"=cast((select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as int) and "transactionId"=t.id)
(case when
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode") is null
then
(te.amount/
((select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00))
else
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
end)
else 0 end) as taxablePurchase,--Amount of Taxable Sales

(case when (select st.code from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")='DPS' then
--(select amount from "transactionEntry" where "accountId"=cast((select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as int) and "transactionId"=t.id)
(case when
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode") is null
then
(te.amount/
((select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00))
else
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
end)
else 0 end) as servicePurchase,

(case when (select st.code from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId") in ('PCG<1M','PCG>1M') then
--(select amount from "transactionEntry" where "accountId"=cast((select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as int) and "transactionId"=t.id)
(case when
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode") is null
then
(te.amount/
((select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00))
else
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
end)
else 0 end) as capitalGoodsPurchase,

(case when (select st.code from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")='PGOCG' then
--(select amount from "transactionEntry" where "accountId"=cast((select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as int) and "transactionId"=t.id)
(case when
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode") is null
then
(te.amount/
((select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00))
else
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
end)
else 0 end) as otherThanCapitalGoodsPurchase,

te.amount as InputTaxAmount,--Amount of Input Tax

--(select amount from "transactionEntry" where "accountId"=cast((select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as int) and "transactionId"=t.id)
(case when
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode") is null
then
(te.amount/
((select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00))
else
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
end)
+te.amount as grossTaxablePurchase,

'' as ownersTin,--company's/owner's TIN

to_char(((date_trunc('month', cast(:endDate as date)) ) + interval '1 month - 1 day'), 'mm/dd/yyyy') as taxableMonth--Taxable Month

FROM transaction t
inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
inner join accounts ac on ac.id=te."accountId" and ac."companyId"=te."companyId"
where t."companyId"=:companyId
and te."vendorId" is not NULL
and te."clientId" IS NULL and te."employeeId" IS NULL and te."isAllocated"='ALLOCATED'
and t."isPosted"='true' and t."isVoid"='false' and t."isDeleted"='false'
and ac."taxId" not in (select id from "saleTax" where code='IGOCG')
and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast(:endDate as date)-- as at date
--and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) >= cast('01/01/2024' as date)--startdate
--and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast('12/31/2024' as date)--enddate
and ac."accountTypeId" in (8,22,23) and  te."VatRCheked"='True' and te."VatRCleared"='False'
) as df
group by df.vendorId,df.codeDetails,df.codePurchase,df.TIN,df.registeredName,df.lastName,df.firstName,df.middleName,df.supplierAddress,df.supplierAddBrgyCity,df.ownersTin,df.taxableMonth