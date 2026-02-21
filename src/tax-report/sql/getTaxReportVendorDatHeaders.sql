SELECT
  'H' as codeHeader,
  'P' as codeSales,
  '' as ownersTin,
  '' as ownersName,
  '' as ownersLastName,
  '' as ownersFirstName,
  '' as ownersMiddleName,
  '' as ownersTradeName,
  '' as ownersAddress,
  '' as ownersAddBrgyCity,
  cast(SUM(dt.exemptPurchase) as numeric(18,2)) as totalExemptPurchase,
  cast(SUM(dt.zeroRatedPurchase) as numeric(18,2)) as totalZeroRatedPurchase,
  cast(SUM(dt.servicePurchase) as numeric(18,2)) as totalServicePurchase,
  cast(SUM(dt.capitalGoodsPurchase) as numeric(18,2)) as totalCapitalGoodsPurchase,
  cast(SUM(dt.otherThanCapitalGoodsPurchase) as numeric(18,2)) as totalOtherThanCapitalGoodsPurchase,
  cast(SUM(dt.InputTaxAmount) as numeric(18,2)) as totalInputTax1,
  cast(SUM(dt.InputTaxAmount) as numeric(18,2)) as totalInputTax2,
  0 as Unknown,
  '' as rdoNumber,
  to_char(((date_trunc('month', cast(:endDate as date)) ) + interval '1 month - 1 day'), 'mm/dd/yyyy') as taxableMonth,
  '12' as fixed12
FROM
(
  SELECT
    to_char(((date_trunc('month', cast(:endDate as date)) ) + interval '1 month - 1 day'), 'mm/dd/yyyy') as taxableMonth,
    '' as TIN,
    '' as registeredName,
    '' as supplierName,
    '' as supplierAddress,
    (CASE
      WHEN (SELECT amount FROM "transactionEntry" WHERE "transactionId"=t.id AND "trAccountCode"=te."trTaxCode") IS NULL
      THEN (te.amount / ((SELECT tr.rate FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId"=st.id WHERE st.id=ac."taxId") / 100.00))
      ELSE (SELECT amount FROM "transactionEntry" WHERE "transactionId"=t.id AND "trAccountCode"=te."trTaxCode")
    END) as GrossPurchaseAmount,
    (CASE
      WHEN (SELECT "taxTypeId" FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId"=st.id WHERE st.id=ac."taxId")=4
      THEN (CASE
        WHEN (SELECT amount FROM "transactionEntry" WHERE "transactionId"=t.id AND "trAccountCode"=te."trTaxCode") IS NULL
        THEN (te.amount / ((SELECT tr.rate FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId"=st.id WHERE st.id=ac."taxId") / 100.00))
        ELSE (SELECT amount FROM "transactionEntry" WHERE "transactionId"=t.id AND "trAccountCode"=te."trTaxCode")
      END)
      ELSE 0
    END) as exemptPurchase,
    (CASE
      WHEN (SELECT "taxTypeId" FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId"=st.id WHERE st.id=ac."taxId")=3
      THEN (CASE
        WHEN (SELECT amount FROM "transactionEntry" WHERE "transactionId"=t.id AND "trAccountCode"=te."trTaxCode") IS NULL
        THEN (te.amount / ((SELECT tr.rate FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId"=st.id WHERE st.id=ac."taxId") / 100.00))
        ELSE (SELECT amount FROM "transactionEntry" WHERE "transactionId"=t.id AND "trAccountCode"=te."trTaxCode")
      END)
      ELSE 0
    END) as zeroRatedPurchase,
    (CASE
      WHEN (SELECT "taxTypeId" FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId"=st.id WHERE st.id=ac."taxId")=1
      THEN (CASE
        WHEN (SELECT amount FROM "transactionEntry" WHERE "transactionId"=t.id AND "trAccountCode"=te."trTaxCode") IS NULL
        THEN (te.amount / ((SELECT tr.rate FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId"=st.id WHERE st.id=ac."taxId") / 100.00))
        ELSE (SELECT amount FROM "transactionEntry" WHERE "transactionId"=t.id AND "trAccountCode"=te."trTaxCode")
      END)
      ELSE 0
    END) as taxablePurchase,
    (CASE
      WHEN (SELECT st.code FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId"=st.id WHERE st.id=ac."taxId")='DPS'
      THEN (CASE
        WHEN (SELECT amount FROM "transactionEntry" WHERE "transactionId"=t.id AND "trAccountCode"=te."trTaxCode") IS NULL
        THEN (te.amount / ((SELECT tr.rate FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId"=st.id WHERE st.id=ac."taxId") / 100.00))
        ELSE (SELECT amount FROM "transactionEntry" WHERE "transactionId"=t.id AND "trAccountCode"=te."trTaxCode")
      END)
      ELSE 0
    END) as servicePurchase,
    (CASE
      WHEN (SELECT st.code FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId"=st.id WHERE st.id=ac."taxId") IN ('PCG<1M','PCG>1M')
      THEN (CASE
        WHEN (SELECT amount FROM "transactionEntry" WHERE "transactionId"=t.id AND "trAccountCode"=te."trTaxCode") IS NULL
        THEN (te.amount / ((SELECT tr.rate FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId"=st.id WHERE st.id=ac."taxId") / 100.00))
        ELSE (SELECT amount FROM "transactionEntry" WHERE "transactionId"=t.id AND "trAccountCode"=te."trTaxCode")
      END)
      ELSE 0
    END) as capitalGoodsPurchase,
    (CASE
      WHEN (SELECT st.code FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId"=st.id WHERE st.id=ac."taxId")='PGOCG'
      THEN (CASE
        WHEN (SELECT amount FROM "transactionEntry" WHERE "transactionId"=t.id AND "trAccountCode"=te."trTaxCode") IS NULL
        THEN (te.amount / ((SELECT tr.rate FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId"=st.id WHERE st.id=ac."taxId") / 100.00))
        ELSE (SELECT amount FROM "transactionEntry" WHERE "transactionId"=t.id AND "trAccountCode"=te."trTaxCode")
      END)
      ELSE 0
    END) as otherThanCapitalGoodsPurchase,
    te.amount as InputTaxAmount,
    (CASE
      WHEN (SELECT amount FROM "transactionEntry" WHERE "transactionId"=t.id AND "trAccountCode"=te."trTaxCode") IS NULL
      THEN (te.amount / ((SELECT tr.rate FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId"=st.id WHERE st.id=ac."taxId") / 100.00))
      ELSE (SELECT amount FROM "transactionEntry" WHERE "transactionId"=t.id AND "trAccountCode"=te."trTaxCode")
    END) + te.amount as grossTaxablePurchase
  FROM transaction t
  INNER JOIN "transactionEntry" te ON te."transactionId"=t.id AND te."companyId"=t."companyId"
  INNER JOIN accounts ac ON ac.id=te."accountId" AND ac."companyId"=te."companyId"
  WHERE t."companyId"=:companyId
  AND te."vendorId" IS NOT NULL
  AND te."clientId" IS NULL AND te."employeeId" IS NULL AND te."isAllocated"='ALLOCATED'
  AND t."isPosted"='true' AND t."isVoid"='false' AND t."isDeleted"='false'
  AND ac."taxId" NOT IN (SELECT id FROM "saleTax" WHERE code='IGOCG')
  AND CAST(to_char(t."transactionDate", 'mm/dd/yyyy') AS date) <= CAST(:endDate AS date)
  AND ac."accountTypeId" IN (8,22,23) AND te."VatRCheked"='True' AND te."VatRCleared"='False'
) AS dt;