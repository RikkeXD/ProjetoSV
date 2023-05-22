const {Model, DataTypes} = require ('sequelize')

class Vendas extends Model{
    static init(sequelize) {
        super.init({
            vendedor_id: DataTypes.INTEGER,
            cliente_id: DataTypes.INTEGER,
            pagamento_id: DataTypes.INTEGER,
            vlr_total: DataTypes.FLOAT,
            frete: DataTypes.STRING,
            vlr_frete: DataTypes.FLOAT,
        }, {
            sequelize
        })
    }
}
module.exports =  Vendas