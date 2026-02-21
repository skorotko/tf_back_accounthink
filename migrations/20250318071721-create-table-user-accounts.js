"use strict";

const { DataType } = require('sequelize-typescript');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    let transaction = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.createTable(
        'user-accounts',
        {
          id: {
            field: 'id',
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          accountId: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          companyId: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          cashAccountTypeId: {
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
  }
};

