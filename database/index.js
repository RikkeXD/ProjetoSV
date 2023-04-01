const Sequelize = require('sequelize')
const configDB = require('../config/database') //Impotando as configurações de conexão com Banco de dados

const Usuario = require('../models/Usuario')

const connection = new Sequelize(configDB)

Usuario.init(connection)

module.exports = connection