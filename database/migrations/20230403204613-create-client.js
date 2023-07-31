const { INTEGER } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
 up (queryInterface, Sequelize) {
      return queryInterface.createTable ('clientes', {
        id:{
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        nome:{
          allowNull: false,
          type: Sequelize.STRING
        },
        sobrenome: {
          allowNull: false,
          type: Sequelize.STRING
        },
        telefone:{
          allowNull: false,
          type: Sequelize.STRING
        },
        cpf: {
          allowNull: false,
          unique: true,
          type: Sequelize.STRING
        },
        email: {
          type: Sequelize.STRING
        },
        endereco: {
          allowNull: false,
          type: Sequelize.STRING
        },
        numero: {
          allowNull: false,
          type: Sequelize.STRING
        },
        cep: {
          allowNull: false,
          type: Sequelize.STRING
        },
        bairro: {
          type: Sequelize.STRING,
          allowNull: false
        },
        complemento:{
          type: Sequelize.STRING
        },
        cidade:{
          type: Sequelize.STRING,
          allowNull: false
        },
        uf:{
          type: Sequelize.STRING,
          allowNull: false
        },
        id_usuario:{
          type: Sequelize.INTEGER,
          allowNull: false,
          references:{
              model: 'usuario',
              key: "id"
          }
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

  down (queryInterface, Sequelize) {
    return queryInterface.dropTable('clientes')  
  }
};
