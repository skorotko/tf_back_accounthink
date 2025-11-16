select
ROW_NUMBER() OVER (ORDER BY t.id) AS seqNo,
'' as TIN,--Tax Identification Number,
'' as corporation,--client registered name/corporation
'' as individual,--name of the individual (Last Name, First Name, Middle Name)/Individual
(select code from "saleTax" where id=ac."taxId") as atcCode,--ATC Code
(select description from "saleTax" where id=ac."taxId") as naturePayment,--Nature of Payment
(case when
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode") is null
then
(te.amount/
((select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId")/100.00))
else
(select amount from "transactionEntry" where "transactionId"=t.id and "trAccountCode"=te."trTaxCode")
end) as amountIncomePayment,--Amount of Income Payment

(select tr.rate from "saleTax" st inner join "taxRate" tr on tr."saleTaxId"=st.id where st.id=ac."taxId") as taxrate,
te.amount as amountTaxWithheld,--Amount of TaxWithheld
te."clientId" as clientId


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
order by te."clientId"