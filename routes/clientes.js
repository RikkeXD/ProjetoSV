const express = require('express')
const router = express.Router()
const Cliente = require('../models/Cliente')

router.get('/cadastro', (req,res) =>{
    res.render('clientes/cadastroclientes')
})

router.post('/cadastro', async (req, res)=>{
    var erros = []
    const {nome , sobrenome, telefone, cpf, endereco, numero, bairro, cidade, estado, cep, complemento, email} = req.body
    //Validação de dados

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome invalido!'})
    }
    if(!req.body.sobrenome || typeof req.body.sobrenome == undefined || req.body.sobrenome == null){
        erros.push({texto: 'Sobrenome invalido!'})
    }
    if(!req.body.telefone || typeof req.body.telefone == undefined || req.body.telefone == null || req.body.telefone.length < 10){
        erros.push({texto: 'Telefone invalido!'})
    }
    if(!req.body.cpf || typeof req.body.cpf == undefined || req.body.cpf == null){
        erros.push({texto: 'CPF invalido!'})
    }
    if(!req.body.endereco || typeof req.body.endereco == undefined || req.body.endereco == null){
        erros.push({texto: 'Endereço Invalido!'})
    }
    if(!req.body.numero || typeof req.body.numero == undefined || req.body.numero == null){
        erros.push({texto: 'Numero do endereço invalido!'})
    }
    if(!req.body.bairro || typeof req.body.bairro == undefined || req.body.bairro == null){
        erros.push({texto: 'Bairro invalido!'})
    }
    if(!req.body.cidade || typeof req.body.cidade == undefined || req.body.cidade == null){
        erros.push({texto: 'Cidade invalido!'})
    }
    if(!req.body.cep || typeof req.body.cep == undefined || req.body.cep == null){
        erros.push({texto: 'CEP invalido'})
    }
    if(!req.body.estado || typeof req.body.estado == undefined || req.body.estado == null){
        erros.push({texto: 'Estado invalido!'})
    }
    if(erros.length >0){
        res.render('clientes/cadastroclientes', {erros: erros, nome: nome, sobrenome: sobrenome, telefone: telefone, cpf: cpf, endereco: endereco, numero: numero, bairro: bairro, cidade: cidade, estado: estado, cep:cep, complemento: complemento, email: email})
    }else{
        const cliente = await Cliente.create({
            nome: req.body.nome,
            sobrenome: req.body.sobrenome,
            telefone: req.body.telefone,
            cpf: req.body.cpf,
            endereco: req.body.endereco,
            numero: req.body.numero,
            bairro: req.body.bairro,
            cidade: req.body.cidade,
            cep: req.body.cep,
            uf: req.body.estado
        }).then(()=>{
            req.flash('success_msg','Cliente cadastrada com sucesso!')
            res.redirect('/home')
        }).catch((err)=>{
            req.flash('error_msg', 'Ocorreu um erro ao cadastrar o cliente')
            res.redirect('/home')
        })
    }
})

module.exports = router