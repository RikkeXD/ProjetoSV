const {Model, DataTypes } = require ('sequelize')

class Cliente extends Model{
    static init(sequelize) {
        super.init({
            nome: DataTypes.STRING,
            sobrenome: DataTypes.STRING,
            telefone: DataTypes.STRING,
            cpf: DataTypes.STRING,
            email: DataTypes.STRING,
            endereco: DataTypes.STRING,
            numero: DataTypes.STRING,
            cep: DataTypes.STRING,
            bairro: DataTypes.STRING,
            cidade: DataTypes.STRING,
            complemento: DataTypes.STRING,
            uf: DataTypes.STRING,
            id_usuario: DataTypes.INTEGER
        }, {
            sequelize
        })
    }
}
module.exports =  Cliente