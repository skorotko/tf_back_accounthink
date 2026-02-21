SELECT
vr1.taxableMonth,vr1.TIN,vr1.registeredName,vr1.supplierName,vr1.supplierAddress,
sum(vr1.GrossPurchaseAmount) as GrossPurchaseAmount, sum(vr1.exemptPurchase) as exemptPurchase, sum(vr1.zeroRatedPurchase) as zeroRatedPurchase, sum(vr1.taxablePurchase) as taxablePurchase, sum(vr1.servicePurchase) as servicePurchase, sum(vr1.capitalGoodsPurchase) as capitalGoodsPurchase,
sum(vr1.otherThanCapitalGoodsPurchase) as otherThanCapitalGoodsPurchase, sum(vr1.InputTaxAmount) as InputTaxAmount, sum(vr1.grossTaxablePurchase) as grossTaxablePurchase,
vr1.vendorId
from
(
select
vr.taxableMonth,vr.TIN,vr.registeredName,vr.supplierName,vr.supplierAddress,
(case when vr.GrossPurchaseAmount=0 then 0 else (case when vr."taxAssignAccountId"=30 then (vr.GrossPurchaseAmount*-1) else vr.GrossPurchaseAmount end) end) as GrossPurchaseAmount,
(case when vr.exemptPurchase=0 then 0 else (case when vr."taxAssignAccountId"=30 then (vr.exemptPurchase*-1) else vr.exemptPurchase end) end) as exemptPurchase,
(case when vr.zeroRatedPurchase=0 then 0 else (case when vr."taxAssignAccountId"=30 then (vr.zeroRatedPurchase*-1) else vr.zeroRatedPurchase end) end) as zeroRatedPurchase,
(case when vr.taxablePurchase=0 then 0 else (case when vr."taxAssignAccountId"=30 then (vr.taxablePurchase*-1) else vr.taxablePurchase end) end) as taxablePurchase,
(case when vr.servicePurchase=0 then 0 else (case when vr."taxAssignAccountId"=30 then (vr.servicePurchase*-1) else vr.servicePurchase end) end) as servicePurchase,
(case when vr.capitalGoodsPurchase=0 then 0 else (case when vr."taxAssignAccountId"=30 then (vr.capitalGoodsPurchase*-1) else vr.capitalGoodsPurchase end) end) as capitalGoodsPurchase,
(case when vr.otherThanCapitalGoodsPurchase=0 then 0 else (case when vr."taxAssignAccountId"=30 then (vr.otherThanCapitalGoodsPurchase*-1) else vr.otherThanCapitalGoodsPurchase end) end) as otherThanCapitalGoodsPurchase,
(case when vr.InputTaxAmount=0 then 0 else (case when vr."taxAssignAccountId"=30 then (vr.InputTaxAmount*-1) else vr.InputTaxAmount end) end) as InputTaxAmount,
(case when vr.grossTaxablePurchase=0 then 0 else (case when vr."taxAssignAccountId"=30 then (vr.grossTaxablePurchase*-1) else vr.grossTaxablePurchase end) end) as grossTaxablePurchase,
vr.vendorId, vr.tid
from
(
select 
te."vendorId" as vendorId,
--to_char(t."transactionDate", 'mm/dd/yyyy') as taxableMonth,--Taxable Month
to_char(((date_trunc('month', cast(:endDate as date)) ) + interval '1 month - 1 day'), 'mm/dd/yyyy') as taxableMonth,
'' as TIN,--Tax Identification Number
'' as registeredName,--client registered name
'' as supplierName,--vendor name of the customer (Last Name, First Name, Middle Name)
'' as supplierAddress, --vendor's address
(select st.code from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId") as taxcode,

--(select amount from "transactionEntry" where "accountId"=cast((select "taxAssignAccountId" from "transactionEntry" where "transactionId"=t.id and "accountId"=te."accountId") as int) and "transactionId"=t.id) as GrossAmount,--Amount of Gross Sales

(case when
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode") is null
then
(te.amount/
((select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00))
else
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
end) as GrossPurchaseAmount,--Amount of Gross Sales

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
else 0 end)
+te.amount as grossTaxablePurchase,--Amount of Gross Taxable Sales

(select "accountTypeId" from accounts where id=
(select "accountId" from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
 )

as "taxAssignAccountId",
t.id as tid,
te.id as teid

--(case when te."VatRCleared" is null then 'False' else te."VatRCleared" end) as reported

FROM transaction t
inner join "transactionEntry" te on te."transactionId"=t.id and te."companyId"=t."companyId"
inner join accounts ac on ac.id=te."accountId" and ac."companyId"=te."companyId"
where t."companyId"=:companyId
and te."vendorId" is not NULL
and te."clientId" IS NULL and te."employeeId" IS NULL and te."isAllocated"='ALLOCATED'
and t."isPosted"='true' and t."isVoid"='false' and t."isDeleted"='false'
and ac."taxId" not in (select id from "saleTax" where code='IGOCG')
and cast(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= cast(:endDate as date)
and ac."accountTypeId" in (8,22,23) and  te."VatRCheked"='True' and te."VatRCleared"='False'
--order by te."vendorId"
) as vr
) as vr1
group by vr1.vendorId, vr1.tid, vr1.taxableMonth,vr1.TIN,vr1.registeredName,vr1.supplierName,vr1.supplierAddress
order by vr1.vendorId, vr1.tid