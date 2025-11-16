"use strict";

const { DataType } = require('sequelize-typescript');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'types',
        {
          id: {
            field: 'id',
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          entityType: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'type'
          },
          code: {
            field: 'code',
            type: Sequelize.STRING,
            allowNull: false
          },
          number: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          name: {
            field: 'name',
            type: Sequelize.STRING,
            allowNull: false
          },
          finDocName: {
            field: 'finDocName',
            type: Sequelize.ENUM,
            values: ['BALANCE SHEET', 'INCOME STATEMENT'],
            allowNull: false
          },
          sortOrder: {
            field: 'sortOrder',
            type: Sequelize.INTEGER,
            allowNull: false
          },
          DRCRCode: {
            field: 'DRCRCode',
            type: Sequelize.ENUM,
            values: ['DR', 'CR'],
            allowNull: false
          },
          filePath: {
            type: Sequelize.STRING,
            allowNull: true
          }
        }
      );

      await queryInterface.createTable(
        'clashflows',
        {
          id: {
            field: 'id',
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          entityType: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'clash-flow'
          },
          name: {
            field: 'name',
            type: Sequelize.STRING,
            allowNull: false
          }
        }
      );

      await queryInterface.createTable(
        'classes',
        {
          id: {
            field: 'id',
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          indelible: {
            field: 'indelible',
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
          entityType: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'class'
          },
          defaultId: {
            field: 'defaultId',
            type: Sequelize.INTEGER,
            allowNull: true
          },
          clashflowId: {
            field: 'clashflowId',
            type: Sequelize.INTEGER,
            allowNull: true
          },
          companyId: {
            field: 'companyId',
            type: Sequelize.INTEGER,
            allowNull: false
          },
          typeId: {
            field: 'typeId',
            type: Sequelize.INTEGER,
            allowNull: false
          },
          code: {
            field: 'code',
            type: Sequelize.STRING,
            allowNull: false
          },
          name: {
            field: 'name',
            type: Sequelize.STRING,
            allowNull: false
          },
          number: {
            field: 'number',
            type: Sequelize.STRING,
            allowNull: true
          },
          contra: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          active: {
            field: 'active',
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
          },
          DRCRCode: {
            field: 'DRCRCode',
            type: Sequelize.ENUM,
            values: ['DR', 'CR'],
            allowNull: true
          },
          createdBy: {
            field: 'createdBy',
            type: Sequelize.STRING,
            allowNull: true
          },
          createdDate: {
            field: 'createdDate',
            type: Sequelize.DATE,
            allowNull: true
          },
          updatedBy: {
            field: 'updatedBy',
            type: Sequelize.STRING,
            allowNull: true
          },
          updatedDate: {
            field: 'updatedDate',
            type: Sequelize.DATE,
            allowNull: true
          },
          filePath: {
            type: Sequelize.STRING,
            allowNull: true
          }
        }
      );

      await queryInterface.createTable(
        'groups',
        {
          id: {
            field: 'id',
            type: Sequelize.INTEGER, 
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          indelible: {
            field: 'indelible',
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
          entityType: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'group'
          },
          defaultClassId: {
            field: 'defaultClassId',
            type: Sequelize.INTEGER,
            allowNull: true
          },
          defaultId: {
            field: 'defaultId',
            type: Sequelize.INTEGER,
            allowNull: true
          },
          companyId: {
            field: 'companyId',
            type: Sequelize.INTEGER,
            allowNull: false
          },
          classId: {
            field: 'classId',
            type: Sequelize.INTEGER,
            allowNull: false
          },
          clashflowId: {
            field: 'clashflowId',
            type: Sequelize.INTEGER,
            allowNull: false
          },
          contra: {
            field: 'contra',
            type: Sequelize.BOOLEAN,
            allowNull: false
          },
          active: {
            field: 'active',
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
          },
          code: {
            field: 'code',
            type: Sequelize.STRING,
            allowNull: false
          },
          name: {
            field: 'name',
            type: Sequelize.STRING,
            allowNull: false
          },
          number: {
            field: 'number',
            type: Sequelize.STRING,
            allowNull: true
          },
          remarks: {
            field: 'remarks',
            type: Sequelize.STRING,
            allowNull: true
          },
          DRCRCode: {
            field: 'DRCRCode',
            type: Sequelize.ENUM,
            values: ['DR', 'CR'],
            allowNull: false
          },
          createdBy: {
            field: 'createdBy',
            type: Sequelize.STRING,
            allowNull: true
          },
          createdDate: {
            field: 'createdDate',
            type: Sequelize.DATE,
            allowNull: true
          },
          updatedBy: {
            field: 'updatedBy',
            type: Sequelize.STRING,
            allowNull: true
          },
          updatedDate: {
            field: 'updatedDate',
            type: Sequelize.DATE,
            allowNull: true
          },
          filePath: {
            type: Sequelize.STRING,
            allowNull: true
          },
          transactionCode: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: 'GENERAL'
          }
        }
      );

      await queryInterface.createTable(
        'accounts',
        {
          id: {
            field: 'id',
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          indelible: {
            field: 'indelible',
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
          entityType: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'account'
          },
          defaultGroupId: {
            field: 'defaultGroupId',
            type: Sequelize.INTEGER,
            allowNull: true
          },
          defaultId: {
            field: 'defaultId',
            type: Sequelize.INTEGER,
            allowNull: true
          },
          clashflowId: {
            field: 'clashflowId',
            type: Sequelize.INTEGER,
            allowNull: true
          },
          companyId: {
            field: 'companyId',
            type: Sequelize.INTEGER,
            allowNull: false
          },
          groupId: {
            field: 'groupId',
            type: Sequelize.INTEGER,
            allowNull: false
          },
          parentId: {
            field: 'parentId',
            type: Sequelize.INTEGER,
            allowNull: true
          },
          currencyId: {
            field: 'currencyId',
            type: Sequelize.INTEGER,
            allowNull: false
          },
          taxId: {
            field: 'taxId',
            type: Sequelize.INTEGER,
            allowNull: true
          },
          taxTypeId: {
            field: 'taxTypeId',
            type: Sequelize.INTEGER,
            allowNull: true
          },
          bankId: {
            field: 'bankId',
            type: Sequelize.INTEGER,
            allowNull: true
          },
          accountTypeId: {
            field: 'accountTypeId',
            type: Sequelize.INTEGER,
            defaultValue: 0
          },
          CCId: {
            field: 'CCId',
            type: Sequelize.INTEGER,
            allowNull: true
          },
          assignToTaxAccountId: {
            field: 'assignToTaxAccountId',
            type: Sequelize.INTEGER,
            allowNull: true
          },
          accountCurrencyId: {
            field: 'accountCurrencyId',
            type: Sequelize.INTEGER,
            allowNull: true
          },
          code: {
            field: 'code',
            type: Sequelize.STRING,
            allowNull: false
          },
          name: {
            field: 'name',
            type: Sequelize.TEXT('long'),
            allowNull: false
          },
          number: {
            field: 'number',
            type: Sequelize.STRING,
            allowNull: true
          },
          DRCRCode: {
            field: 'DRCRCode',
            type: Sequelize.ENUM,
            values: ['DR', 'CR'],
            allowNull: false
          },
          active: {
            field: 'active',
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
          },
          close: {
            field: 'close',
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
          isBankAccount: {
            field: 'isBankAccount',
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
          isCreditCardAccount: {
            field: 'isCreditCardAccount',
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
          description: {
            field: 'description',
            type: Sequelize.STRING,
            allowNull: true
          },
          remarks: {
            field: 'remarks',
            type: Sequelize.STRING,
            allowNull: true
          },
          zeroTax: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
          noTax: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
          noTaxSP: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
          exemptTax: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
          createdBy: {
            field: 'createdBy',
            type: Sequelize.STRING,
            allowNull: true
          },
          createdDate: {
            field: 'createdDate',
            type: Sequelize.DATE,
            allowNull: true
          },
          updatedBy: {
            field: 'updatedBy',
            type: Sequelize.STRING,
            allowNull: true
          },
          updatedDate: {
            field: 'updatedDate',
            type: Sequelize.DATE,
            allowNull: true
          },
          filePath: {
            type: Sequelize.STRING,
            allowNull: true
          }
        }
      );

      await queryInterface.createTable(
        'accountTypes',
        {
          id: {
            field: 'id',
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          accountTypeID: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          accountTypeName: {
            type: Sequelize.STRING,
            allowNull: false
          }
        }
      );

      await queryInterface.createTable(
        'taxType',
        {
          id: {
            field: 'id',
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          topType: {
            type: Sequelize.STRING,
            allowNull: false
          },
          mainTypeId: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          accountTypeID: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          name: {
            field: 'name',
            type: Sequelize.STRING(100),
            allowNull: false
          }
        }
      );

      await queryInterface.createTable(
        'withHoldingTaxRemark',
        {
          id: {
            field: 'id',
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          name: {
            field: 'name',
            type: Sequelize.STRING(100),
            allowNull: false
          }
        }
      );

      await queryInterface.createTable(
        'zeroTaxType',
        {
          id: {
            field: 'id',
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          name: {
            field: 'name',
            type: Sequelize.STRING,
            allowNull: false
          }
        },
        { transaction }
      );

      await queryInterface.createTable(
        'AccountingMethodMapping',
        {
          Id: {
            field: 'Id',
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          DBCode: {
            type: Sequelize.STRING('50'),
            allowNull: false
          },
          MethodOfAccountingId: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
            BusinessTypeId: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          BusinessFormationId: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          ShowHide: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false
          },
        }
      );

      await queryInterface.createTable(
        'itemsType',
        {
          id: {
            field: 'id',
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          name: {
            field: 'name',
            type: Sequelize.STRING,
            allowNull: false
          },
          group: {
            field: 'group',
            type: Sequelize.INTEGER,
            allowNull: false
          }
        },
        { transaction }
      );

      await queryInterface.createTable(
        'taxRate',
        {
          id: {
            field: 'id',
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          saleTaxId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
          },
          withHoldingTaxId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
          },
          rate: {
            type: Sequelize.FLOAT(10,2),
            allowNull: false
          },
          financeYear: {
            type: Sequelize.DATE,
            allowNull: false
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          }
        },
        { transaction }
      );

      await queryInterface.createTable(
        'saleTax',
        {
          id: {
            field: 'id',
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          countryId: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          typeId: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          taxTypeId: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          code: {
            type: Sequelize.STRING(1000),
            allowNull: false
          },
          viewCode: {
            type: Sequelize.STRING(1000),
            allowNull: true
          },
          name: {
            type: Sequelize.STRING,
            allowNull: false
          },
          active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
          },
          description: {
            type: Sequelize.STRING(1000),
            allowNull: true,
            defaultValue: null
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          }
        },
        { transaction }
      );


      await queryInterface.createTable(
        'withHoldingTax',
        {
          id: {
            field: 'id',
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          typeId: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          countryId: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          name: {
            type: Sequelize.STRING(1000),
            allowNull: false
          },
          code: {
            type: Sequelize.STRING,
            allowNull: false
          },
          viewCode: {
            type: Sequelize.STRING(1000),
            allowNull: true
          },
          active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
          },
          description: {
            type: Sequelize.STRING(1000),
            allowNull: true,
            defaultValue: null
          },
          remarkId: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          }
        },
        { transaction }
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
