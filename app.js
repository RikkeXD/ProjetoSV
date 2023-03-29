const express = require('express')
app = express()
const Sequelize = require('sequelize') //Sequelize Banco de Dados SQL
const handlebars = require('express-handlebars')
const path = require('path')

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
        module.exports = sequelize

    //Handlebars
        app.engine('handlebars', handlebars.engine
        ({defaultLayout: 'main',}))
        app.set('view engine', 'handlebars')
    // Public
        app.use(express.static(path.join(__dirname,'public')))
        
        
    //Rotas
    app.get('/', (req,res)=> {
        res.render('partials/_navbar',{hideNavBar: false})
    })


//Servidor
const port = 8081
app.listen(port, ()=> console.log(`Servidor iniciado na porta ${port}`))