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
      vendedor_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'usuarios',
          key: 'id'
        }
      },
      cliente_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'clientes',
          key: 'id'
        }
      },
      pagamento_id: {
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
    return queryInterface.dropTable('vendas')
  }
};
