'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Leads', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      contactInfo: {
        type: Sequelize.STRING
      },
      source: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      agentId: {
        type: Sequelize.INTEGER
      },
      propertyId: {
        type: Sequelize.INTEGER
      },
      reservationFee: {
        type: Sequelize.DECIMAL
      },
      financialStatus: {
        type: Sequelize.STRING
      },
      contractSigned: {
        type: Sequelize.BOOLEAN
      },
      finalSalePrice: {
        type: Sequelize.DECIMAL
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Leads');
  }
};