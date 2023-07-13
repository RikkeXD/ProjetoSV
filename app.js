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
require('dotenv').config()
const jwt = require('jsonwebtoken')
const Usuario = require('./models/Usuario')
const { serialize } = require('v8')


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
        eq: function (a, b, options) {
            if (a === b) {
                if (typeof options.fn === 'function') {
                    return options.fn(this)
                }
            } else {
                if (typeof options.inverse === 'function') {
                    return options.inverse(this)
                }
                return ''
            }
        }
    }
})

handlebars.registerHelper('isStatusOne', function (status) {
    return status === 1;
});

handlebars.registerHelper('isStatusEnd', function (status) {
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
app.use(express.static(path.join(__dirname, 'public')))
//Body-Parser
app.use(bodyParser.urlencoded({ extended: true }))
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
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')

    next()
})
//Rotas
app.get('/', async (req, res) => {

    res.render('usuarios/login', { hideNavBar: true })

    const usuario = await Usuario.findOne({})

})

app.post("/auth", async (req, res) => {
    const email = req.body.email
    const senha = req.body.senha

    const usuario = await Usuario.findOne({
        where: { email: email }
    })

    if (!usuario || usuario == null || usuario == undefined) {
        req.flash('error_msg', 'Usuario não encontrado')
        res.redirect('/')
    }
    const checkPassword = await bcrypt.compare(senha, usuario.senha)

    if (!checkPassword) {
        req.flash('error_msg', 'Senha incorreta')
        res.redirect('/')
    }

    try {
        const secret = process.env.SECRET

        const token = jwt.sign({
            id: usuario.id,
            nome: usuario.nome,
        }, secret,)

        req.session.token = token
        res.render('home/home', { token: token, sessionToken: req.session.token })

    } catch (err) {
        req.flash('error_msg', 'Ocorreu um erro, tente mais tarde')
        res.redirect('/')
    }

})

//Verificando TOKEN

function checkToken(req, res, next) {
        const token = req.session.token
        const secret = process.env.SECRET

    try {
        jwt.verify(token, secret)
        console.log('Autenticado com sucesso')

        next()
    } catch (err) {
        console.log('ERRO NA AUTENTICAÇÃO', err)
        req.flash('error_msg', 'Acesso não permitido! Por favor faça login!')
        res.redirect('/')
    }

}

app.get('/teste', checkToken, (req, res) => {
    const token = req.session.token
    const secret = process.env.SECRET

    const decodedToken = jwt.verify(token, secret)
    const userId = decodedToken.id
    console.log('ID DO USUARIO > ', userId)
    res.render('home/teste')
})


//Importando Rotas
app.use('/usuarios', checkToken,usuarios)
app.use('/home', checkToken,home)
app.use('/clientes', checkToken,clientes)
app.use('/produtos', checkToken,produtos)
app.use('/vendas', checkToken ,vendas)

app.use(checkToken);

//Servidor
const port = 8081
app.listen(port, () => console.log(`Servidor iniciado na porta ${port}`))
