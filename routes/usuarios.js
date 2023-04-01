const express = require('express')
const Usuario = require('../models/Usuario')
const router = express.Router()

router.get('/cadastro', (req, res) => {
    res.render('usuarios/cadastrouser')
})
router.post('/cadastro', async (req,res)=>{

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
})
module.exports = router