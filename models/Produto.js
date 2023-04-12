const {Model, DataTypes } = require ('sequelize')

class Produto extends Model{
    static init(sequelize) {
        super.init({
            nome: DataTypes.STRING,
            fornecedor: DataTypes.STRING,
            cod_barras: DataTypes.STRING
        }, {
            sequelize
        })
    }
}
module.exports =  Produto