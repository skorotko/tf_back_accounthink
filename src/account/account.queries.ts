export const AccountQueries = {
  getAccountsTree: `
    select cte_2.id, cte_2."DRCRCode", cte_2."companyId", cte_2.amount,
    sum((case when cte_2."DRCRCode"='DR' then (cte_2.debit-cte_2.credit) else 0 end)) as debit,
    sum((case when cte_2."DRCRCode"='CR' then (cte_2.credit-cte_2.debit) else 0 end)) as credit,
    cte_2.code, cte_2.name, cte_2."groupId",
    cte_2.description, cte_2.remarks, cte_2."parentId", cte_2."currencyId", cte_2."accountCurrencyId",
    cte_2."taxId", cte_2.indelible, cte_2.active, cte_2."createdBy", cte_2."updatedBy",
    cte_2."createdDate", cte_2."updatedDate", cte_2.number, cte_2."filePath", cte_2."entityType", cte_2."taxTypeId",
    cte_2."assignToTaxAccountId", cte_2."clashflowId", cte_2."isBankAccount", cte_2."isCreditCardAccount", cte_2."accountTypeId", at."accountTypeName"
    from(
        WITH RECURSIVE cte_1 AS (
                SELECT * FROM public.accounts
                WHERE "companyId" = :companyId
                UNION ALL
                SELECT e.* FROM cte_1 AS c
                JOIN public.accounts e ON e."parentId" = c.id
            )
            SELECT cte_1.id, cte_1."companyId", cte_1."DRCRCode", cte_1.code, cte_1.name, cte_1."groupId",
                cte_1.description, cte_1.remarks, cte_1."parentId", cte_1."currencyId", cte_1."accountCurrencyId",
                cte_1."taxId", cte_1.indelible, cte_1.active, cte_1."createdBy", cte_1."updatedBy",
                    cte_1."createdDate", cte_1."updatedDate", cte_1.number, cte_1."filePath", cte_1."entityType",
                tre.debit, tre.credit, tr.amount, cte_1."taxTypeId", cte_1."assignToTaxAccountId",  cte_1."clashflowId",
                cte_1."isBankAccount", cte_1."isCreditCardAccount", cte_1."accountTypeId"
            FROM cte_1
            LEFT JOIN (
                SELECT "accountId",
                case when "DRCRCode" = 'DR' then sum(amount) else 0 end as debit,
                case when "DRCRCode" = 'CR' then sum(amount) else 0 end as credit
                FROM "transactionEntry"
                group by "accountId", "DRCRCode"
            ) tre ON cte_1.id = tre."accountId"
            LEFT JOIN (
                SELECT amount, "accountId"
                FROM transaction
                WHERE "transactionId" = 1
            ) tr ON cte_1.id = tr."accountId"
            group by cte_1.id, cte_1."DRCRCode",cte_1."companyId", cte_1.code, cte_1.name, cte_1."groupId",
                cte_1.description, cte_1.remarks, cte_1."parentId", cte_1."currencyId", cte_1."accountCurrencyId",
                cte_1."taxId", cte_1.indelible, cte_1.active, cte_1."createdBy", cte_1."updatedBy",
                cte_1."createdDate", cte_1."updatedDate", cte_1.number, cte_1."filePath", cte_1."entityType",
                tre.debit, tre.credit, tr.amount, cte_1."taxTypeId", cte_1."assignToTaxAccountId",  cte_1."clashflowId",
                cte_1."isBankAccount", cte_1."isCreditCardAccount", cte_1."accountTypeId"
            order by cte_1.id) as cte_2
    LEFT JOIN "accountTypes" AS at ON at."accountTypeID" = cte_2."accountTypeId"
    group by cte_2.id, cte_2."DRCRCode", cte_2."companyId", cte_2.amount, cte_2.code, cte_2.name, cte_2."groupId",
    cte_2.description, cte_2.remarks, cte_2."parentId", cte_2."currencyId", cte_2."accountCurrencyId",
    cte_2."taxId", cte_2.indelible, cte_2.active, cte_2."createdBy", cte_2."updatedBy",
    cte_2."createdDate", cte_2."updatedDate", cte_2.number, cte_2."filePath", cte_2."entityType", cte_2."taxTypeId",
    cte_2."assignToTaxAccountId", cte_2."clashflowId", cte_2."isBankAccount", cte_2."isCreditCardAccount", cte_2."accountTypeId", at."accountTypeName"
    order by code
  `,
  
  getAccountById: `
    SELECT * FROM public.accounts WHERE id = :id
  `
} as const; // <-- Это ключевой момент для TS