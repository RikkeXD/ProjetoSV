const {Sequelize, sequelize} = require('../app').sequelize

const Usuario = sequelize.define('usuarios', {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
    },
    nome: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    sobrenome: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    senha: {
        type: Sequelize.STRING,
        allowNull: false
    },
    permissao: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }
})

Usuario.sync({force: true}).then((line)=>{
    console.log('Banco de dados Usuarios criado com sucesso' + line)
}).catch((err)=>{
    console.log('Erro ao Criar o banco de dados Usuario: ' + err)
})

module.exports = Usuario