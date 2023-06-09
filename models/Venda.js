const {Model, DataTypes} = require ('sequelize')

class Vendas extends Model{
    static init(sequelize) {
        super.init({
            vendedor_id: DataTypes.INTEGER,
            cliente_id: DataTypes.INTEGER,
            pagamento_id: DataTypes.INTEGER,
            qntd_parcela: DataTypes.INTEGER,
            vlr_total: DataTypes.FLOAT,
            frete: DataTypes.STRING,
            vlr_frete: DataTypes.FLOAT,
            status: DataTypes.INTEGER,
            cod_rastreio: DataTypes.STRING,
        }, {
            sequelize
        })
    }
}
module.exports =  Vendas