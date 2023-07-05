const express = require('express')
app = express()
const bodyParser = require('body-parser') //Coletar os dados do HTML e transformar em JSON para manipulação
const flash = require('connect-flash') //Biblioteca para mensagens temporarias
const session = require('express-session') //Biblioteca para realizar configuração de sessão para a aplicação
const Sequelize = require('sequelize') //Sequelize Banco de Dados SQL
const exphbs = require('express-handlebars')//Engine para o Front-End 
const handlebars = require('handlebars')
const path = require('path')//Realizar caminho padrão para alguns recursos
const usuarios = require('./routes/usuarios')//Importando as Rotas do usuario
const home = require('./routes/home')//Importando as Rotas do usuario
const clientes = require('./routes/clientes') //Importando as Rotas do cliente
const produtos = require('./routes/produtos')
const vendas = require('./routes/vendas')
const moment = require('moment') //Biblioteca para ajuda na formatação das Datas
const bcrypt = require('bcrypt')


//Configurações
    //Banco de Dados
    require('./database')
    //Configurando para utilizar JSON
        app.use(express.json())

    //Handlebars
    const hbs = exphbs.create({
        defaultLayout: 'main', 
        helpers: {
            stringify: (obj) => {
                return JSON.stringify(obj)
            },
            eq: function (a, b, options){
                if (a === b){
                    if(typeof options.fn === 'function'){
                        return options.fn(this)
                    }
                } else{
                    if(typeof options.inverse === 'function'){
                        return options.inverse(this)
                    }
                    return ''
                }
            }
        }
    })

    handlebars.registerHelper('isStatusOne', function(status) {
        return status === 1;
      });

    handlebars.registerHelper('isStatusEnd', function(status) {
        return status === 2;
      });

    handlebars.registerHelper('isMotoboy', function (value, options) {
        if (value === 'Motoboy') {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      });

        app.engine('handlebars', hbs.engine)
        app.set('view engine', 'handlebars')

    // Public
        app.use(express.static(path.join(__dirname,'public')))
    //Body-Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    //Sessão 
        app.use(session({
            secret: 'SaudeVida',
            resave: true,
            saveUninitialized: true
        }))
    //Flash (Mensagens Temporaria)
        app.use(flash())
    //MiddleWares
        app.use((req, res, next) =>{
          res.locals.success_msg = req.flash('success_msg')
          res.locals.error_msg = req.flash('error_msg')

           next()
        })
    //Rotas
    app.get('/', (req,res)=> {
        res.render('usuarios/login',{hideNavBar: true})
    })

    //Importando Rotas
    app.use('/usuarios', usuarios)
    app.use('/home', home)
    app.use('/clientes', clientes)
    app.use('/produtos', produtos)
    app.use('/vendas', vendas)
    
    //Servidor
    const port = 8081
    app.listen(port, ()=> console.log(`Servidor iniciado na porta ${port}`))