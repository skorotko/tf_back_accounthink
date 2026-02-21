'use strict';

const { DataType } = require('sequelize-typescript');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'expenditures-queues',
        {
          id: {
            field: 'id',
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          userAccountId: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          requestDate: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          approveDate: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          rejectDate: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          liquidateDate: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          purposeReject: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          requestByUserId: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          isExpenditure: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
          },
          mDataObj: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          vendorName: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          vendorTin: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          vendorContactAddress: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          vendorPhone: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          transactionDate: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          transactionArunumber: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          transactionRcptnumber: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          transactionItemsObj: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          vatableAmount: {
            type: Sequelize.FLOAT,
            allowNull: true,
          },
          totalAmount: {
            type: Sequelize.FLOAT,
            allowNull: true,
          },
          vatableAmountInclusive: {
            type: Sequelize.FLOAT,
            allowNull: true,
          },
          vatableAmountExclusive: {
            type: Sequelize.FLOAT,
            allowNull: true,
          },
          vatableAmountWithoutTax: {
            type: Sequelize.FLOAT,
            allowNull: true,
          },
          serviceCharge: {
            type: Sequelize.FLOAT,
            allowNull: true,
          },
          amountTendered: {
            type: Sequelize.FLOAT,
            allowNull: true,
          },
          paymentMethod: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          chargeGiven: {
            type: Sequelize.FLOAT,
            allowNull: true,
          },
          currency: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          tips: {
            type: Sequelize.FLOAT,
            allowNull: true,
          },
          statusId: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
        },
        { transaction },
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
  },
};
