// 'use strict';

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     return queryInterface.sequelize.query(`-- FUNCTION: public.get_currentearnings(date, date)

//     -- DROP FUNCTION IF EXISTS public.get_currentearnings(date, date);
    
//     CREATE OR REPLACE FUNCTION public.get_currentearnings(
//       startdate date,
//       enddate date)
//         RETURNS numeric
//         LANGUAGE 'plpgsql'
//         COST 100
//         VOLATILE PARALLEL UNSAFE
//     AS $BODY$
//     BEGIN
//         RETURN 
//       (
//       select 
//     sum(ce.Amount*ce.DRCRCode)
//     from (
//     select
//       (case when bs."DRCRCode"='DR' then -1 else 1 end) as DRCRCode,
//       sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else bs.credit-bs.debit end)) as Amount
//       from
//       (
//       select
//       ty."sortOrder",ty.name as type,cl.name as class,gp.name as group,ac.name as account,ac."DRCRCode",
//       (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
//       (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
//       from types ty
//       inner join classes cl on cl."typeId"=ty.id
//       inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
//       inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
//       inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
//       inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
//       where t."companyId"=90 and ty."finDocName"='INCOME STATEMENT'and t."transactionDate" between startdate and enddate
//       group by ty."sortOrder",ty.name,cl.name,gp.name,ac.name,ac."DRCRCode",te."DRCRCode") as bs
//       group by bs."sortOrder", bs.type, bs.class, bs.group, bs.account,bs."DRCRCode") ce
//       )
//       ;
//     END; 
//     $BODY$;
    
//     ALTER FUNCTION public.get_currentearnings(date, date)
//     OWNER TO CURRENT_USER;`)
//   },

//   down: async (queryInterface, Sequelize) => {
//     return Promise.resolve()
//   }
// };

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        `-- FUNCTION: public.get_grossearnings(integer, date, date)
        -- DROP FUNCTION IF EXISTS public.get_grossearnings(integer, date, date);
        CREATE OR REPLACE FUNCTION public.get_grossearnings(
        companyid integer,
        startdate date,
        enddate date)
        RETURNS numeric
        LANGUAGE 'plpgsql'
        COST 100
        VOLATILE PARALLEL UNSAFE
        AS $BODY$
        BEGIN
        RETURN
        (
        select
        sum(ce.Amount*ce.DRCRCode)
        from (
        select
        (case when bs."DRCRCode"='DR' then -1 else 1 end) as DRCRCode,
        sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else bs.credit-bs.debit end)) as Amount
        from
        (
        select
        ty."sortOrder",ty.name as type,cl.name as class,gp.name as group,ac.name as account,ac."DRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        from types ty
        inner join classes cl on cl."typeId"=ty.id
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
        inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
        inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
        where t."companyId"=companyid and ty."finDocName"='INCOME STATEMENT'and t."transactionDate" between startdate and enddate
        AND cl.name in ('SALES','SERVICE INCOME','SALES ADJUSTMENT','COST OF SALES')
        group by ty."sortOrder",ty.name,cl.name,gp.name,ac.name,ac."DRCRCode",te."DRCRCode") as bs
        group by bs."sortOrder", bs.type, bs.class, bs.group, bs.account,bs."DRCRCode") ce);
        END;
        $BODY$;
        ALTER FUNCTION public.get_grossearnings(integer, date, date)
        OWNER TO CURRENT_USER;`
      );

      await queryInterface.sequelize.query(
        `-- FUNCTION: public.get_netoperatingtearnings(integer, date, date)
        -- DROP FUNCTION IF EXISTS public.get_netoperatingtearnings(integer, date, date);
        CREATE OR REPLACE FUNCTION public.get_netoperatingtearnings(
        companyid integer,
        startdate date,
        enddate date)
        RETURNS numeric
        LANGUAGE 'plpgsql'
        COST 100
        VOLATILE PARALLEL UNSAFE
        AS $BODY$
        BEGIN
        RETURN
        (
        select
        sum(ce.Amount*ce.DRCRCode)
        from (
        select
        (case when bs."DRCRCode"='DR' then -1 else 1 end) as DRCRCode,
        sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else bs.credit-bs.debit end)) as Amount
        from
        (
        select
        ty."sortOrder",ty.name as type,cl.name as class,gp.name as group,ac.name as account,ac."DRCRCode",
        (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,
        (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
        from types ty
        inner join classes cl on cl."typeId"=ty.id
        inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
        inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
        inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
        inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
        where t."companyId"=companyid and ty."finDocName"='INCOME STATEMENT'and t."transactionDate" between startdate and enddate
        AND cl.name in ('SALES','SERVICE INCOME','SALES ADJUSTMENT','COST OF SALES','OPERATING EXPENSES')
        group by ty."sortOrder",ty.name,cl.name,gp.name,ac.name,ac."DRCRCode",te."DRCRCode") as bs
        group by bs."sortOrder", bs.type, bs.class, bs.group, bs.account,bs."DRCRCode") ce);
        END;
        $BODY$;
        ALTER FUNCTION public.get_netoperatingtearnings(integer, date, date)
        OWNER TO CURRENT_USER;`
      );

      await queryInterface.sequelize.query(
        `CREATE OR REPLACE FUNCTION "public"."get_currentearnings"("companyid" int4, "startdate" date, "enddate" date)
          RETURNS "pg_catalog"."numeric" AS $BODY$
        BEGIN
            RETURN 
          (
          select 
        sum(ce.Amount*ce.DRCRCode)
        from (
        select
          (case when bs."DRCRCode"='DR' then -1 else 1 end) as DRCRCode,
          sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else bs.credit-bs.debit end)) as Amount
          from
          (
          select
          ty."sortOrder",ty.name as type,cl.name as class,gp.name as group,ac.name as account,ac."DRCRCode",
          (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
          (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
          from types ty
          inner join classes cl on cl."typeId"=ty.id
          inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
          inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
          inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
          inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
          where t."companyId"=companyid and ty."finDocName"='INCOME STATEMENT'and t."transactionDate" between startdate and enddate
          group by ty."sortOrder",ty.name,cl.name,gp.name,ac.name,ac."DRCRCode",te."DRCRCode") as bs
          group by bs."sortOrder", bs.type, bs.class, bs.group, bs.account,bs."DRCRCode") ce
          )
          ;
        END; 
        $BODY$
          LANGUAGE plpgsql VOLATILE
          COST 100`
      );

      await queryInterface.sequelize.query(
                `CREATE OR REPLACE FUNCTION "public"."get_retainedearnings"("companyid" int4, "startdate" date)
          RETURNS "pg_catalog"."numeric" AS $BODY$
        BEGIN
            RETURN 
          (
          select 
        sum(ce.Amount*ce.DRCRCode)
        from (
        select
          (case when bs."DRCRCode"='DR' then -1 else 1 end) as DRCRCode,
          sum((case when bs."DRCRCode"='DR' then bs.debit-bs.credit else bs.credit-bs.debit end)) as Amount
          from
          (
          select
          ty."sortOrder",ty.name as type,cl.name as class,gp.name as group,ac.name as account,ac."DRCRCode",
          (case when te."DRCRCode" = 'DR' then sum(te.amount) else 0 end) as debit,   
          (case when te."DRCRCode" = 'CR' then sum(te.amount) else 0 end) as credit
          from types ty
          inner join classes cl on cl."typeId"=ty.id
          inner join groups gp on gp."classId"=cl.id and cl."companyId"=gp."companyId"
          inner join accounts ac on ac."groupId"=gp.id and gp."companyId"=ac."companyId"
          inner join "transactionEntry" te on te."accountId"=ac.id and te."companyId"=ac."companyId"
          inner join transaction t on t.id=te."transactionId" and t."companyId"=te."companyId"
          where t."companyId"=companyid and ty."finDocName"='INCOME STATEMENT'and t."transactionDate" < startdate
          group by ty."sortOrder",ty.name,cl.name,gp.name,ac.name,ac."DRCRCode",te."DRCRCode") as bs
          group by bs."sortOrder", bs.type, bs.class, bs.group, bs.account,bs."DRCRCode") ce
          )
          ;
        END; 
        $BODY$
          LANGUAGE plpgsql VOLATILE
          COST 100`
      );

      await transaction.commit();
      return Promise.resolve();
    } catch (err) {
      if (transaction) {
        await transaction.rollback();
      }
      return Promise.reject(err);
    }
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.resolve();
  }
};
