const {Model, DataTypes } = require ('sequelize')

class Venda_Produto extends Model{
    static init(sequelize) {
        super.init({
            venda_id: DataTypes.INTEGER,
            produto_id: DataTypes.INTEGER,
            quantidade: DataTypes.INTEGER,
            vlr_uni: DataTypes.FLOAT
        }, {
            sequelize,
            tableName: 'venda_produto'
        })
    }
}
module.exports =  Venda_Produto