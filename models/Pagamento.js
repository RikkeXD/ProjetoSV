const {Model, DataTypes} = require ('sequelize')

class Pagamentos extends Model{
    static init(sequelize) {
        super.init({
            nome: DataTypes.STRING,
            qtd_parcela: DataTypes.INTEGER
        }, {
            sequelize
        })
    }
}
module.exports =  Pagamentos