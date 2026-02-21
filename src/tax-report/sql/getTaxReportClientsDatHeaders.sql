SELECT
      'H' as codeHeader, -- code for Header
      'S' as codeSales, -- code for Sales
      '' as ownersTin, -- company's/owner's TIN
      '' as ownersName, -- company's/owner's NAME
      '' as ownersLastName, -- ownersLastName
      '' as ownersFirstName, -- ownersFirstName
      '' as ownersMiddleName, -- ownersMiddleName
      '' as ownersTradeName, -- company's/owner's TRADE NAME
      '' as ownersAddress, -- company's/owner's ADDRESS
      '' as ownersAddBrgyCity, -- company's/owner's ADDRESS BARANGAY/CITY
      cast(SUM(dt.exemptSales) as numeric(18,2)) as totalExemptSales,
      cast(SUM(dt.zeroRatedSales) as numeric(18,2)) as totalZeroRatedSales,
      cast(SUM(dt.taxableSales) as numeric(18,2)) as totalTaxableSales,
      cast(SUM(dt.OutputTaxAmount) as numeric(18,2)) as totalOutputTax,
      '' as rdoNumber, -- RDO Number
      dt.taxablemonth,
      '12' as fixed12 -- fixed number in the header
FROM
(
	SELECT
            sr.taxableMonth,
            CASE
            WHEN sr.exemptSales = 0 THEN 0
            ELSE CASE
                  WHEN sr."taxAssignAccountId" = 30 THEN (sr.exemptSales * -1)
                  ELSE sr.exemptSales
            END
            END AS exemptSales,
            CASE
                  WHEN sr.zeroRatedSales = 0 THEN 0
                  ELSE CASE
                        WHEN sr."taxAssignAccountId" = 30 THEN (sr.zeroRatedSales * -1)
                        ELSE sr.zeroRatedSales
                  END
            END AS zeroRatedSales,
            CASE
                  WHEN sr.taxableSales = 0 THEN 0
                  ELSE CASE
                        WHEN sr."taxAssignAccountId" = 30 THEN (sr.taxableSales * -1)
                        ELSE sr.taxableSales
                  END
            END AS taxableSales,
            CASE
                  WHEN sr.OutputTaxAmount = 0 THEN 0
                  ELSE CASE
                        WHEN sr."taxAssignAccountId" = 30 THEN (sr.OutputTaxAmount * -1)
                        ELSE sr.OutputTaxAmount
                  END
            END AS OutputTaxAmount
	FROM
	(
		SELECT
                  te."clientId" as clientId,
                  to_char(((date_trunc('month', CAST(:endDate AS DATE)) ) + interval '1 month - 1 day'), 'mm/dd/yyyy') as taxableMonth,
                  '' as TIN, -- Tax Identification Number
                  '' as registeredName, -- client registered name
                  '' as customerName, -- name of the customer (Last Name, First Name, Middle Name)
                  '' as customerAddress, -- customer's address
                  (select amount from "transactionEntry" where "transactionId"=t.id and "accountId"=cast(te."taxAssignAccountId" as int) and te."trTaxCode"="trAccountCode") AS GrossAmount,
                  CASE
                        WHEN (SELECT "taxTypeId" FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId" = st.id WHERE st.id = ac."taxId") = 4 THEN
                                    (select amount from "transactionEntry" where "transactionId"=t.id and "accountId"=cast(te."taxAssignAccountId" as int) and te."trTaxCode"="trAccountCode")
                        ELSE 0
                  END
                  AS exemptSales,
                  CASE
                        WHEN (SELECT "taxTypeId" FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId" = st.id WHERE st.id = ac."taxId") = 3 THEN
                                    (select amount from "transactionEntry" where "transactionId"=t.id and "accountId"=cast(te."taxAssignAccountId" as int) and te."trTaxCode"="trAccountCode")
                        ELSE 0
                  END
                  AS zeroRatedSales,
                  CASE
                        WHEN (SELECT "taxTypeId" FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId" = st.id WHERE st.id = ac."taxId") = 1 THEN
                                    (select amount from "transactionEntry" where "transactionId"=t.id and "accountId"=cast(te."taxAssignAccountId" as int) and te."trTaxCode"="trAccountCode")
                        ELSE 0
                  END
                  AS taxableSales,
                  te.amount AS OutputTaxAmount,
                  CASE
                        WHEN (SELECT "taxTypeId" FROM "saleTax" st INNER JOIN "taxRate" tr ON tr."saleTaxId" = st.id WHERE st.id = ac."taxId") = 1 THEN
                                    (select amount from "transactionEntry" where "transactionId"=t.id and "accountId"=cast(te."taxAssignAccountId" as int) and te."trTaxCode"="trAccountCode")
                        ELSE 0
                  END + te.amount
                  AS grossTaxableSales,
                  (select "accountTypeId" from accounts where id=cast(te."taxAssignAccountId" as int )) AS "taxAssignAccountId"
            FROM transaction t
            INNER JOIN "transactionEntry" te ON te."transactionId" = t.id AND te."companyId" = t."companyId"
            INNER JOIN accounts ac ON ac.id = te."accountId" AND ac."companyId" = te."companyId"
            WHERE t."companyId" = :companyId
                  AND te."clientId" IS NOT NULL
                  AND te."vendorId" IS NULL
                  AND te."employeeId" IS NULL
                  AND te."isAllocated" = 'ALLOCATED'
                  AND t."isPosted" = 'true'
                  AND t."isVoid" = 'false'
                  AND t."isDeleted" = 'false'
                  AND CAST(to_char(t."transactionDate", 'mm/dd/yyyy') as date) <= CAST(:endDate AS DATE)
                  AND ac."accountTypeId" = 11
                  AND te."VatRCheked" = 'True'
                  AND te."VatRCleared" = 'False'
	) AS sr
) AS dt
GROUP BY
      dt.taxablemonth;