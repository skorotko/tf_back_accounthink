const { Sequelize, QueryTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Параметри підключення до БД
const sequelize = new Sequelize(
  process.env.POSTGRES_DB || 'account-think',
  process.env.POSTGRES_USER || 'postgres12',
  process.env.POSTGRES_PASSWORD || '1111',
  {
    host: process.env.POSTGRES_HOST || 'localhost',
    dialect: 'postgres',
  });

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');

    const accountTypesDataPromise = sequelize.query('SELECT * FROM accountTypes', {
      type: QueryTypes.SELECT,
    });

    const accountingMethodMappingDataPromise = sequelize.query('SELECT * FROM AccountingMethodMapping', {
      type: QueryTypes.SELECT,
    });

    const typesDataPromise = sequelize.query('SELECT * FROM types', {
      type: QueryTypes.SELECT,
    });

    const clashflowsDataPromise = sequelize.query('SELECT * FROM clashflows', {
      type: QueryTypes.SELECT,
    });

    const classesDataPromise = sequelize.query('SELECT * FROM classes WHERE companyId = 0', {
      type: QueryTypes.SELECT,
    });

    const groupsDataPromise = sequelize.query('SELECT * FROM groups WHERE companyId = 0', {
      type: QueryTypes.SELECT,
    });

    const accountsDataPromise = sequelize.query('SELECT * FROM accounts WHERE companyId = 0', {
      type: QueryTypes.SELECT,
    });

    const taxTypeDataPromise = sequelize.query('SELECT * FROM taxType', {
      type: QueryTypes.SELECT,
    });

    const withHoldingTaxRemarkDataPromise = sequelize.query('SELECT * FROM withHoldingTaxRemark', {
      type: QueryTypes.SELECT,
    });

    const zeroTaxTypeDataPromise = sequelize.query('SELECT * FROM zeroTaxType', {
      type: QueryTypes.SELECT,
    });

    const itemsTypeDataPromise = sequelize.query('SELECT * FROM itemsType', {
      type: QueryTypes.SELECT,
    });

    const saleTaxDataPromise = sequelize.query('SELECT * FROM saleTax', {
      type: QueryTypes.SELECT,
    });

    const withHoldingTaxDataPromise = sequelize.query('SELECT * FROM withHoldingTax', {
      type: QueryTypes.SELECT,
    });

    const taxRateDataPromise = sequelize.query('SELECT * FROM taxRate', {
      type: QueryTypes.SELECT,
    });

    const [
      accountTypesData,
      accountingMethodMappingData,
      typesData,
      clashflowsData,
      classesData,
      groupsData,
      accountsData,
      taxTypeData,
      withHoldingTaxRemarkData,
      zeroTaxTypeData,
      itemsTypeData,
      saleTaxData,
      withHoldingTaxData,
      taxRateData
    ] = await Promise.all([
      accountTypesDataPromise,
      accountingMethodMappingDataPromise,
      typesDataPromise,
      clashflowsDataPromise,
      classesDataPromise,
      groupsDataPromise,
      accountsDataPromise,
      taxTypeDataPromise,
      withHoldingTaxRemarkDataPromise,
      zeroTaxTypeDataPromise,
      itemsTypeDataPromise,
      saleTaxDataPromise,
      withHoldingTaxDataPromise,
      taxRateDataPromise
    ]);

    const migrationPath = path.join(__dirname, 'migrations', '20210909080003-added-base_data_copy.js');

    let migrationContent = fs.readFileSync(migrationPath, 'utf8');

    migrationContent = migrationContent.replace(
      /await queryInterface\.bulkInsert\('types', \[\s*[\s\S]*?\]\);/,
      `await queryInterface.bulkInsert('types', ${JSON.stringify(typesData, null, 2)});`
    );

    migrationContent = migrationContent.replace(
      /await queryInterface\.bulkInsert\('classes', \[\s*[\s\S]*?\]\);/,
      `await queryInterface.bulkInsert('classes', ${JSON.stringify(classesData, null, 2)});`
    );

    migrationContent = migrationContent.replace(
      /await queryInterface\.bulkInsert\('clashflows', \[\s*[\s\S]*?\]\);/,
      `await queryInterface.bulkInsert('clashflows', ${JSON.stringify(clashflowsData, null, 2)});`
    );

    migrationContent = migrationContent.replace(
      /await queryInterface\.bulkInsert\('groups', \[\s*[\s\S]*?\]\);/,
      `await queryInterface.bulkInsert('groups', ${JSON.stringify(groupsData, null, 2)});`
    );

    migrationContent = migrationContent.replace(
      /await queryInterface\.bulkInsert\('accounts', \[\s*[\s\S]*?\]\);/,
      `await queryInterface.bulkInsert('accounts', ${JSON.stringify(accountsData, null, 2)});`
    );

    migrationContent = migrationContent.replace(
      /await queryInterface\.bulkInsert\('accountTypes', \[\s*[\s\S]*?\]\);/,
      `await queryInterface.bulkInsert('accountTypes', ${JSON.stringify(accountTypesData, null, 2)});`
    );

    migrationContent = migrationContent.replace(
      /await queryInterface\.bulkInsert\('taxType', \[\s*[\s\S]*?\]\);/,
      `await queryInterface.bulkInsert('taxType', ${JSON.stringify(taxTypeData, null, 2)});`
    );

    migrationContent = migrationContent.replace(
      /await queryInterface\.bulkInsert\('withHoldingTaxRemark', \[\s*[\s\S]*?\]\);/,
      `await queryInterface.bulkInsert('withHoldingTaxRemark', ${JSON.stringify(withHoldingTaxRemarkData, null, 2)});`
    );

    migrationContent = migrationContent.replace(
      /await queryInterface\.bulkInsert\('zeroTaxType', \[\s*[\s\S]*?\]\);/,
      `await queryInterface.bulkInsert('zeroTaxType', ${JSON.stringify(zeroTaxTypeData, null, 2)});`
    );

    migrationContent = migrationContent.replace(
      /await queryInterface\.bulkInsert\('AccountingMethodMapping', \[\s*[\s\S]*?\]\);/,
      `await queryInterface.bulkInsert('AccountingMethodMapping', ${JSON.stringify(accountingMethodMappingData, null, 2)});`
    );

    migrationContent = migrationContent.replace(
      /await queryInterface\.bulkInsert\('itemsType', \[\s*[\s\S]*?\]\);/,
      `await queryInterface.bulkInsert('itemsType', ${JSON.stringify(itemsTypeData, null, 2)});`
    );

    migrationContent = migrationContent.replace(
      /await queryInterface\.bulkInsert\('taxRate', \[\s*[\s\S]*?\]\);/,
      `await queryInterface.bulkInsert('taxRate', ${JSON.stringify(taxRateData, null, 2)});`
    );

    migrationContent = migrationContent.replace(
      /await queryInterface\.bulkInsert\('saleTax', \[\s*[\s\S]*?\]\);/,
      `await queryInterface.bulkInsert('saleTax', ${JSON.stringify(saleTaxData, null, 2)});`
    );

    migrationContent = migrationContent.replace(
      /await queryInterface\.bulkInsert\('withHoldingTax', \[\s*[\s\S]*?\]\);/,
      `await queryInterface.bulkInsert('withHoldingTax', ${JSON.stringify(withHoldingTaxData, null, 2)});`
    );

    fs.writeFileSync(migrationPath, migrationContent, 'utf8');

    console.log('Migration file updated successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
})();
