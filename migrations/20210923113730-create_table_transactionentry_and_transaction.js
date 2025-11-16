"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      // await queryInterface.createTable(
      //   'transaction',
      //   {
      //     id: {
      //       field: 'id',
      //       type: Sequelize.INTEGER,
      //       primaryKey: true,
      //       autoIncrement: true,
      //       allowNull: false
      //     },
      //     transactionId: {
      //       field: 'transactionId',
      //       type: Sequelize.INTEGER,
      //       allowNull: false
      //     },
      //     taxTypeId: {
      //       field: 'taxTypeId',
      //       type: Sequelize.INTEGER,
      //       allowNull: true,
      //       defaultValue: 1
      //     },
      //     transactionCode: {
      //       field: 'transactionCode',
      //       type: Sequelize.STRING,
      //       allowNull: false
      //     },
      //     transactionType: {
      //       field: 'transactionType',
      //       type: Sequelize.STRING,
      //       allowNull: false,
      //     },
      //     transactionNo: {
      //       field: 'transactionNo',
      //       type: Sequelize.STRING,
      //       allowNull: false
      //     },
      //     transactionDate: {
      //       field: 'transactionDate',
      //       type: Sequelize.DATE,
      //       allowNull: false
      //     },
      //     documentDate: {
      //       field: 'documentDate',
      //       type: Sequelize.DATE,
      //       allowNull: true
      //     },
      //     transactionCurrency: {
      //       field: 'transactionCurrency',
      //       type: Sequelize.STRING,
      //       allowNull: false
      //     },
      //     foreignCurrency: {
      //       field: 'foreignCurrency',
      //       type: Sequelize.STRING,
      //       allowNull: true
      //     },
      //     reference: {
      //       field: 'reference',
      //       type: Sequelize.STRING,
      //       allowNull: true
      //     },
      //     sourceReference: {
      //       field: 'sourceReference',
      //       type: Sequelize.STRING,
      //       allowNull: true
      //     },
      //     transactionDescription: {
      //       field: 'transactionDescription',
      //       type: Sequelize.STRING,
      //       allowNull: true
      //     },
      //     isPosted: {
      //       field: 'isPosted',
      //       type: Sequelize.BOOLEAN,
      //       allowNull: false,
      //       defaultValue: false
      //     },
      //     postedDate: {
      //       field: 'postedDate',
      //       type: Sequelize.DATE,
      //       allowNull: false
      //     },
      //     createdBy: {
      //       field: 'createdBy',
      //       type: Sequelize.INTEGER,
      //       allowNull: false
      //     },
      //     updatedBy: {
      //       field: 'updatedBy',
      //       type: Sequelize.INTEGER,
      //       allowNull: true
      //     },
      //     createdDate: {
      //       field: 'createdDate',
      //       type: Sequelize.DATE,
      //       allowNull: false
      //     },
      //     updatedDate: {
      //       field: 'updatedDate',
      //       type: Sequelize.DATE,
      //       allowNull: true
      //     },
      //     checkedBy: {
      //       field: 'checkedBy',
      //       type: Sequelize.INTEGER,
      //       allowNull: true
      //     },
      //     checkedDate: {
      //       field: 'checkedDate',
      //       type: Sequelize.DATE,
      //       allowNull: true
      //     },
      //     isSendToAcc: {
      //       field: 'isSendToAcc',
      //       type: Sequelize.BOOLEAN,
      //       allowNull: true
      //     },
      //     sendToAccDate: {
      //       field: 'sendToAccDate',
      //       type: Sequelize.DATE,
      //       allowNull: true
      //     },
      //     recorderBy: {
      //       field: 'recorderBy',
      //       type: Sequelize.INTEGER,
      //       allowNull: true
      //     },
      //     recorderDate: {
      //       field: 'recorderDate',
      //       type: Sequelize.DATE,
      //       allowNull: true
      //     },
      //     companyId: {
      //       field: 'companyId',
      //       type: Sequelize.INTEGER,
      //       allowNull: false
      //     },
      //     accountId: {
      //       field: 'accountId',
      //       type: Sequelize.INTEGER,
      //       allowNull: true
      //     },
      //     amount: {
      //       field: 'amount',
      //       type: Sequelize.INTEGER,
      //       allowNull: true
      //     },
      //     foreignAmount: {
      //       field: 'foreignAmount',
      //       type: Sequelize.INTEGER,
      //       allowNull: true
      //     },
      //     exchangeRate: {
      //       field: 'exchangeRate',
      //       type: Sequelize.FLOAT,
      //       allowNull: true
      //     }
      //   }
      // );

      // await queryInterface.createTable(
      //   'transactionEntry',
      //   {
      //     id: {
      //       field: 'id',
      //       type: Sequelize.INTEGER,
      //       primaryKey: true,
      //       autoIncrement: true,
      //       allowNull: false
      //     },
      //     transactionId: {
      //       field: 'transactionId',
      //       type: Sequelize.INTEGER,
      //       allowNull: false
      //     },
      //     accountId: {
      //       field: 'accountId',
      //       type: Sequelize.INTEGER,
      //       allowNull: false
      //     },
      //     taxAssignAccountId: {
      //       field: 'taxAssignAccountId',
      //       type: Sequelize.INTEGER,
      //       allowNull: true
      //     },
      //     DRCRCode: {
      //       field: 'DRCRCode',
      //       type: Sequelize.STRING,
      //       allowNull: false,
      //     },
      //     amount: {
      //       field: 'amount',
      //       type: Sequelize.INTEGER,
      //       allowNull: false
      //     },
      //     foreignAmount: {
      //       field: 'foreignAmount',
      //       type: Sequelize.INTEGER,
      //       allowNull: true
      //     },
      //     exchangeRate: {
      //       field: 'exchangeRate',
      //       type: Sequelize.FLOAT,
      //       allowNull: true
      //     },
      //     description: {
      //       field: 'description',
      //       type: Sequelize.STRING,
      //       allowNull: true
      //     },
      //     companyId: {
      //       field: 'companyId',
      //       type: Sequelize.INTEGER,
      //       allowNull: false
      //     },
      //     entityId: {
      //       field: 'entityId',
      //       type: Sequelize.INTEGER,
      //       allowNull: true
      //     },
      //     entityTypeId: {
      //       field: 'entityTypeId',
      //       type: Sequelize.INTEGER,
      //       allowNull: true
      //     },
      //     userId: {
      //       field: 'userId',
      //       type: Sequelize.INTEGER,
      //       allowNull: false
      //     },
      //     taskId: {
      //       field: 'taskId',
      //       type: Sequelize.INTEGER,
      //       allowNull: true
      //     },
      //     BRID: {
      //       field: 'BRID',
      //       type: Sequelize.INTEGER,
      //       allowNull: true
      //     },
      //     BRCheked: {
      //       field: 'BRCheked',
      //       type: Sequelize.BOOLEAN,
      //       allowNull: true,
      //     },
      //     BRCleared: {
      //       field: 'BRCleared',
      //       type: Sequelize.BOOLEAN,
      //       allowNull: true,
      //     },
      //     isTax: {
      //       field: 'isTax',
      //       type: Sequelize.BOOLEAN,
      //       allowNull: true,
      //       defaultValue: false
      //     },
      //     CCRID: {
      //       field: 'CCRID',
      //       type: Sequelize.INTEGER,
      //       allowNull: true
      //     },
      //     CCRCheked: {
      //       field: 'CCRCheked',
      //       type: Sequelize.BOOLEAN,
      //       allowNull: true,
      //     },
      //     CCRCleared: {
      //       field: 'CCRCleared',
      //       type: Sequelize.BOOLEAN,
      //       allowNull: true,
      //     },
      //     VatRID: {
      //       field: 'VatRID',
      //       type: Sequelize.INTEGER,
      //       allowNull: true
      //     },
      //     VatRCheked: {
      //       field: 'VatRCheked',
      //       type: Sequelize.BOOLEAN,
      //       allowNull: true,
      //     },
      //     VatRCleared: {
      //       field: 'VatRCleared',
      //       type: Sequelize.BOOLEAN,
      //       allowNull: true,
      //     },
      //     buId: {
      //       field: 'buId',
      //       type: Sequelize.INTEGER, 
      //       allowNull: true
      //     },
      //     employeeId: {
      //       field: 'employeeId',
      //       type: Sequelize.INTEGER, 
      //       allowNull: true
      //     },
      //     vendorId: {
      //       field: 'vendorId',
      //       type: Sequelize.INTEGER, 
      //       allowNull: true
      //     },
      //     clientId: {
      //       field: 'clientId',
      //       type: Sequelize.INTEGER, 
      //       allowNull: true
      //     },
      //     isAllocated: {
      //       field: 'isAllocated',
      //       type: Sequelize.STRING, 
      //       allowNull: false, 
      //       defaultValue: 'UnAllocated'
      //     }
      //   }
      // );

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
