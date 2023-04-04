const express = require('express')
const router = express.Router()

router.get('/cadastro', (req,res) =>{
    res.render('clientes/cadastroclientes')
})

router.post('/cadastro', (req, res)=>{
    var erros = []

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
        res.render('clientes/cadastroclientes', {erros: erros})
    }else{
        
    }
})

module.exports = router