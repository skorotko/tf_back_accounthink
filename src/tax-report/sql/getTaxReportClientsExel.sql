SELECT 
    sr1.taxableMonth,
    sr1.TIN,
    sr1.registeredName,
    sr1.customerName,
    sr1.customerAddress,
    SUM(sr1.GrossAmount) AS GrossAmount, 
    SUM(sr1.exemptSales) AS exemptSales, 
    SUM(sr1.zeroRatedSales) AS zeroRatedSales, 
    SUM(sr1.taxableSales) AS taxableSales, 
    SUM(sr1.OutputTaxAmount) AS OutputTaxAmount, 
    SUM(sr1.grossTaxableSales) AS grossTaxableSales,
    sr1.clientId
FROM
(
        SELECT
            sr.taxableMonth,
            sr.TIN,
            sr.registeredName,
            sr.customerName,
            sr.customerAddress,
            CASE
                WHEN sr.GrossAmount = 0 THEN 0
                ELSE CASE
                    WHEN sr."taxAssignAccountId" = 30 THEN (sr.GrossAmount * -1)
                    ELSE sr.GrossAmount
                END
            END AS GrossAmount,
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
            END AS OutputTaxAmount,
            CASE
                WHEN sr.grossTaxableSales = 0 THEN 0
                ELSE CASE
                    WHEN sr."taxAssignAccountId" = 30 THEN (sr.grossTaxableSales * -1)
                    ELSE sr.grossTaxableSales
                END
            END AS grossTaxableSales,
            sr.clientId,
            sr.tid
        FROM
        (
            SELECT
                te."clientId" AS clientId,
                TO_CHAR(DATE_TRUNC('month', CAST(:endDate AS DATE)) + INTERVAL '1 month - 1 day', 'mm/dd/yyyy') AS taxableMonth,
                '' AS TIN,
                '' AS registeredName,
                '' AS customerName,
                '' AS customerAddress,
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
                (select "accountTypeId" from accounts where id=cast(te."taxAssignAccountId" as int )) AS "taxAssignAccountId",
                t.id AS tid,
                te.id AS teid
            FROM
                transaction t
            INNER JOIN "transactionEntry" te ON te."transactionId" = t.id AND te."companyId" = t."companyId"
            INNER JOIN accounts ac ON ac.id = te."accountId" AND ac."companyId" = te."companyId"
            WHERE
                t."companyId" = :companyId
                AND te."clientId" IS NOT NULL
                AND te."vendorId" IS NULL
                AND te."employeeId" IS NULL
                AND te."isAllocated" = 'ALLOCATED'
                AND t."isPosted" = 'true'
                AND t."isVoid" = 'false'
                AND t."isDeleted" = 'false'
                AND CAST(TO_CHAR(t."transactionDate", 'mm/dd/yyyy') AS DATE) <= CAST(:endDate AS DATE)
                AND ac."accountTypeId" = 11
                AND te."VatRCheked" = 'True'
                AND te."VatRCleared" = 'False'
        ) AS sr
) AS sr1
GROUP BY 
    sr1.clientId, 
    sr1.tid, 
    sr1.taxableMonth,
    sr1.TIN,
    sr1.registeredName,
    sr1.customerName,
    sr1.customerAddress
ORDER BY 
    sr1.clientId, 
    sr1.tid;
