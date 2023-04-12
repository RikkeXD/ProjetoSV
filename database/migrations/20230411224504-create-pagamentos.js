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
        type:Sequelize.STRING
      },
      qtd_parcela:{
        type: Sequelize.INTEGER
      }
    })
  },

   down (queryInterface, Sequelize) {
    return queryInterface.dropTable('pagamentos')
    
  }
};
