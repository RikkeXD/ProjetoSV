'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface.createTable('entrada_produto', {
      id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      produto_id:{
        allowNull: false,
        type: Sequelize.INTEGER,
        references:{
          model: 'produtos', 
          key: 'id'
        }},
      fornecedor:{
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      num_nota:{
        allowNull:true,
        type: Sequelize.STRING(20)
      },
      vlr_total:{
        allowNull: false,
        type: Sequelize.FLOAT
      },
      qntd_produto:{
        allowNull: false,
        type: Sequelize.INTEGER
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    })
  
  },

  down (queryInterface, Sequelize) {
    return queryInterface.dropTable('entrada_produto')
  }
};
