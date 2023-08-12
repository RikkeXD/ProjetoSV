'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
 up (queryInterface, Sequelize) {
    return queryInterface.createTable('pagamentos',{
      id:{
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nome:{
        allowNull: false,
        type:Sequelize.STRING(25)
      },
      qtd_parcela:{
        type: Sequelize.INTEGER
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
    return queryInterface.dropTable('pagamentos')
    
  }
};
