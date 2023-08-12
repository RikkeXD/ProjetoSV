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
          type: Sequelize.STRING(15)
        },
        sobrenome: {
          allowNull: false,
          type: Sequelize.STRING(40)
        },
        telefone:{
          allowNull: false,
          type: Sequelize.STRING(16)
        },
        cpf: {
          allowNull: false,
          unique: true,
          type: Sequelize.STRING(15)
        },
        email: {
          type: Sequelize.STRING(45)
        },
        endereco: {
          allowNull: false,
          type: Sequelize.STRING(50)
        },
        numero: {
          allowNull: false,
          type: Sequelize.STRING(15)
        },
        cep: {
          allowNull: false,
          type: Sequelize.STRING(11)
        },
        bairro: {
          type: Sequelize.STRING(55),
          allowNull: false
        },
        complemento:{
          type: Sequelize.STRING(50)
        },
        cidade:{
          type: Sequelize.STRING(30),
          allowNull: false
        },
        uf:{
          type: Sequelize.STRING(2),
          allowNull: false
        },
        id_usuario:{
          type: Sequelize.INTEGER,
          allowNull: false,
          references:{
              model: 'usuarios',
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
