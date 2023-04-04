const {Model, DataTypes } = require ('sequelize')

class Cliente extends Model{
    static init(sequelize) {
        super.init({
            nome: DataTypes.STRING,
            sobrenome: DataTypes.STRING,
            email: DataTypes.STRING,
            senha: DataTypes.STRING,
            permissao: DataTypes.INTEGER
        }, {
            sequelize
        })
    }
}
module.exports = Cliente