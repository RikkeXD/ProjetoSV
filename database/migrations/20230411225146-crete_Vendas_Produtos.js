'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('venda_produto', {
      vendaId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references:{
          model: 'vendas',
          key: 'id'
        }
      },
      produtoId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references:{
          model: 'produtos',
          key: 'id'
        }
      },
      quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      vlr_uni:{
        type: Sequelize.FLOAT,
        allowNull: false
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
      },

    })
},
      
  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('venda_produto')
  }
};
