'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('produtos', {
      id:{
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      nome:{
        allowNull: false,
        type: Sequelize.STRING(30)
      },
      fornecedor:{
        allowNull: false,
        type: Sequelize.STRING(30)
      },
      cod_barras:{
        type:Sequelize.STRING(40)
      },
      created_at:{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at:{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
    })
    
  },

  down (queryInterface, Sequelize) {
    return queryInterface.dropTable('produtos')
  }
};
