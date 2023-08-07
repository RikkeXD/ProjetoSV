const {Model, DataTypes} = require ('sequelize')

class Entrada_Produto extends Model{
    static init(sequelize) {
        super.init({
            produto_id: DataTypes.INTEGER,
            fornecedor: DataTypes.STRING,
            num_nota: DataTypes.STRING,
            vlr_total: DataTypes.FLOAT,
            qntd_produto: DataTypes.INTEGER
        }, {
            sequelize,
            tableName: 'entrada_produto'
        })
    }
}
module.exports =  Entrada_Produto