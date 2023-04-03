const { TRUE } = require('node-sass');


/** @type {import('sequelize-cli').Migration} */
module.exports = {
 up (queryInterface, Sequelize) {
      return queryInterface.createTable ('clientes', {
        id:{
          allowNull: null,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        nome:{
          allowNull: true,
          type: Sequelize.STRING
        },
        sobrenome: {
          allowNull: true,
          type: Sequelize.STRING
        },
        telefone:{
          allowNull: true,
          type: Sequelize.STRING
        },
        cpf: {
          allowNull: true,
          type: Sequelize.STRING
        },
        email: {
          type: Sequelize.STRING
        },
        endereco: {
          allowNull: true,
          type: Sequelize.STRING
        },
        numero: {
          allowNull: true,
          type: Sequelize.STRING
        },
        cep: {
          allowNull: true,
          type: Sequelize.STRING
        },
        bairro: {
          type: Sequelize.STRING,
          allowNull: true
        },
        complemento:{
          type: Sequelize.STRING
        },
        uf:{
          type: Sequelize.STRING,
          allowNull: true
        }
        
      })
  },

  async down (queryInterface, Sequelize) {
    
  }
};
