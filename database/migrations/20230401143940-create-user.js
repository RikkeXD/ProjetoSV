'use strict';
//Criando a Tabela Usuario atraves do comando: npx sequelize migration:create --name=create-user
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface.createTable('usuarios', {
      id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
    },
    nome: {
        type: Sequelize.STRING(15),
        allowNull: false,
    },
    sobrenome: {
        type: Sequelize.STRING(40),
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING(45),
        allowNull: false,
        unique: true
    },
    senha: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    permissao: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    return queryInterface.dropTable('users')
  }
};
//Para rodar a migration só utilizar o comando: npx sequelize db:migrate