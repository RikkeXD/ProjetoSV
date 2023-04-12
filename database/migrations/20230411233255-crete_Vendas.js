'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('vendas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      vendedorId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'usuarios',
          key: 'id'
        }
      },
      clienteId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'clientes',
          key: 'id'
        }
      },
      pagamentoId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'pagamentos',
          key: 'id'
        }
      },
      vlr_total: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      frete: {
        allowNull: false,
        type: Sequelize.STRING
      },
      vlr_frete: {
        allowNull: true,
        type: Sequelize.FLOAT
      },
    })
  },

  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('vendas')
  }
};
