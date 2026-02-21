'use strict';

const { DataType } = require('sequelize-typescript');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    let transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'requests-queues',
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
          issueDate: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          purpose: {
            type: Sequelize.TEXT,
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
          amount: {
            type: Sequelize.FLOAT,
            allowNull: true,
          },
          urgent: {
            type: Sequelize.BOOLEAN,
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
