const express = require('express')
app = express()
const Sequelize = require('sequelize') //Sequelize Banco de Dados SQL
const handlebars = require('express-handlebars')
const path = require('path')
const usuarios = require('./routes/usuarios')//Importando as Rotas do usuario
const Usuario = require('./models/Usuario')

//Configurações
    //Banco de Dados
        const sequelize = new Sequelize ('bancosv', 'root', 'senha123',{
            host:'localhost',
            dialect:'mysql'
        })
        sequelize.authenticate().then(()=>{
            console.log('Banco de dados conectado!')
        }).catch((erro) =>{
            console.log('Erro ao conectar no banco de dados')
        })
        module.exports = {sequelize, Sequelize}

    //Handlebars
        app.engine('handlebars', handlebars.engine
        ({defaultLayout: 'main',}))
        app.set('view engine', 'handlebars')
    // Public
        app.use(express.static(path.join(__dirname,'public')))
        
        
    //Rotas
    app.get('/', (req,res)=> {
        res.render('usuarios/login',{hideNavBar: true})
    })

    //Exportando Rotas

    app.use('/usuarios', usuarios)
//Servidor
const port = 8081
app.listen(port, ()=> console.log(`Servidor iniciado na porta ${port}`))