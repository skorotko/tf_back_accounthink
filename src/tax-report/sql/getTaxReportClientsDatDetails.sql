SELECT
        'D' as codeDetails,--code for Details
        'S' as codeSales,--code for Sales
        df.TIN,
        df.registeredName,
        df.lastName,
        df.firstName,
        df.middleName,
        df.customerAddress,
        df.customerAddBrgyCity,
        cast(sum(df.exemptSales) as numeric(18,2)) as exemptSales,
        cast(sum(df.zeroRatedSales) as numeric(18,2)) as zeroRatedSales,
        cast(sum(df.taxableSales) as numeric(18,2)) as taxableSales,
        cast(sum(df.OutputTaxAmount) as numeric(18,2)) as OutputTaxAmount,
        '' as ownersTin,--company's/owner's TIN
        df.taxableMonth,
        df.clientId
FROM
(
	SELECT
                sr.TIN,
                sr.registeredName,
                sr.lastName,
                sr.firstName,
                sr.middleName,
                sr.customerAddress,
                sr.customerAddBrgyCity,
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
                sr.taxableMonth,
                sr.clientId
	FROM
	(
		SELECT
			te."clientId" as clientId,
			'' as TIN,--Tax Identification Number
			'' as registeredName,--customer registered name
			'' as lastName,--customer last name
			'' as firstName,--customer first name
			'' as middleName,--customer middle name
			'' as customerAddress, --customer's address
			'' as customerAddBrgyCity, --customer's address barangay/city
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
			(select "accountTypeId" from accounts where id=cast(te."taxAssignAccountId" as int )) AS "taxAssignAccountId",
			to_char(((date_trunc('month', CAST(:endDate AS DATE)) ) + interval '1 month - 1 day'), 'mm/dd/yyyy') as taxableMonth--Taxable Month

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
) AS df
GROUP BY
        df.clientId,
        df.TIN,
        df.registeredName,
        df.lastName,
        df.firstName,
        df.middleName,
        df.customerAddress,
        df.customerAddBrgyCity,
        df.taxableMonth 