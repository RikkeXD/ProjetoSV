const express = require('express')
const Usuario = require('../models/Usuario')
const router = express.Router()

router.get('/cadastro', (req, res) => {
    res.render('usuarios/cadastrouser')
})
router.post('/cadastro', async (req,res)=>{

    var erro = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erro.push({texto:'Campo nome invalido ou vazio! '})
    }
    if(!req.body.sobrenome || typeof req.body.sobrenome == undefined || req.body.sobrenome == null){
        erro.push({texto:'Campo sobrenome invalido ou vazio!'})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erro.push({texto:'Email invalido !'})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null ){
        erro.push({texto:'Senha invalida'})
    }
    if(req.body.senha.length < 5){
        erro.push({texto: 'Senha muito curta'})
    }
    if (req.body.senha != req.body.senha2){
        erro.push({texto: 'As senhas não são iguais'})
    }
    if(erro.length > 0){
        res.render('usuarios/cadastrouser', {erro: erro})
    }else{

        const user = await Usuario.create({
            nome: req.body.nome,
            sobrenome: req.body.sobrenome,
            email: req.body.email,
            senha: req.body.senha
        }).then(()=>{
            req.flash('success_msg', 'Usuario criado com sucesso!')
            res.redirect('/home')
        }).catch((err)=>{
            req.flash('error_msg', 'Ocorreu um erro ao criar o usuario')
            res.redirect('/home')
            console.log('Ocorreu o seguinte erro: '+err)
        })
    }
})

router.get('/', async(req, res)=>{
    const usuarios = await Usuario.findAll({}).then((usuario)=>{
        const usuariosJSON = usuario.map(usuario => usuario.toJSON())
        res.render('usuarios/usuarios', {usuarios: usuariosJSON})
    }).catch((err)=>{
        req.flash('error_msg','Ocorreu um erro ao carregar os usuarios')
        res.redirect('/home')
    })
    
})
router.get('/edit/:id',async(req,res)=>{
    try{
        const usuarioedit = await Usuario.findOne({where: {id: req.params.id}})
        const UsuarioEditJSON = usuarioedit.toJSON()
        res.render('usuarios/editusuario', {usuario: UsuarioEditJSON})
    } catch {
        req.flash('error_msg', 'Erro ao carregar este usuário!')
        res.redirect('/home')
    }
    
})

router.post('/edit',async(req,res)=>{
    const UserEdit = await 
})
module.exports = router