'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('produtos', {
      id:{
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER
      },
      nome:{
        allowNull: false,
        type: Sequelize.STRING
      },
      fornecedor:{
        allowNull: false,
        type: Sequelize.STRING
      },
      cod_barra:{
        type:Sequelize.STRING
      },
      created_at:{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      update_at:{
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
