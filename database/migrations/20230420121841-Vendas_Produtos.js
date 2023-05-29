'use strict';

const { increment } = require('../../models/Cliente');

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('venda_produto', {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      venda_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references:{
          model: 'vendas',
          key: 'id'
        }
      },
      produto_id: {
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