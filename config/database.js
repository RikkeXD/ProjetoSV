module.exports = { //Configuração de conexão com Banco de Dados
    dialect: 'mysql',
    host: 'localhost',
    username: 'root',
    password: 'senha123',
    database: 'bancosv',
    define: {
        timestamp: true, //Parametro para salvar data e hora em qualquer criação de dados
        underscored: true, //Parametro para colocar a letra maiuscula de cada tabela !! 
    }
}
