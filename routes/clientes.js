const express = require('express')
const router = express.Router()
const Cliente = require('../models/Cliente')

router.get('/cadastro', (req, res) => {
    res.render('clientes/cadastroclientes')
})

router.post('/cadastro', async (req, res) => {
    var erros = []
    const { nome, sobrenome, telefone, cpf, endereco, numero, bairro, cidade, estado, cep, complemento, email } = req.body //Coletando as informações em caso de erro, não serem apagadas

    // Validação de dados

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: 'Nome invalido!' })
    }
    if (!req.body.sobrenome || typeof req.body.sobrenome == undefined || req.body.sobrenome == null) {
        erros.push({ texto: 'Sobrenome invalido!' })
    }
    if (!req.body.telefone || typeof req.body.telefone == undefined || req.body.telefone == null || req.body.telefone.length < 10) {
        erros.push({ texto: 'Telefone invalido!' })
    }
    if (!req.body.cpf || typeof req.body.cpf == undefined || req.body.cpf == null) {
        erros.push({ texto: 'CPF invalido!' })
    }
    if (!req.body.endereco || typeof req.body.endereco == undefined || req.body.endereco == null) {
        erros.push({ texto: 'Endereço Invalido!' })
    }
    if (!req.body.numero || typeof req.body.numero == undefined || req.body.numero == null) {
        erros.push({ texto: 'Numero do endereço invalido!' })
    }
    if (!req.body.bairro || typeof req.body.bairro == undefined || req.body.bairro == null) {
        erros.push({ texto: 'Bairro invalido!' })
    }
    if (!req.body.cidade || typeof req.body.cidade == undefined || req.body.cidade == null) {
        erros.push({ texto: 'Cidade invalido!' })
    }
    if (!req.body.cep || typeof req.body.cep == undefined || req.body.cep == null) {
        erros.push({ texto: 'CEP invalido' })
    }
    if (!req.body.estado || typeof req.body.estado == undefined || req.body.estado == null) {
        erros.push({ texto: 'Estado invalido!' })
    }
    if (erros.length > 0) {
        res.render('clientes/cadastroclientes', { erros: erros, nome: nome, sobrenome: sobrenome, telefone: telefone, cpf: cpf, endereco: endereco, numero: numero, bairro: bairro, cidade: cidade, estado: estado, cep: cep, complemento: complemento, email: email })
    } else {
        const cliente = await Cliente.create({
            nome: req.body.nome,
            sobrenome: req.body.sobrenome,
            telefone: req.body.telefone,
            email: req.body.email,
            cpf: req.body.cpf,
            endereco: req.body.endereco,
            numero: req.body.numero,
            bairro: req.body.bairro,
            cidade: req.body.cidade,
            cep: req.body.cep,
            uf: req.body.estado
        }).then(() => {
            req.flash('success_msg', 'Cliente cadastrada com sucesso!')
            res.redirect('/home')
        }).catch((err) => {
            req.flash('error_msg', 'Ocorreu um erro ao cadastrar o cliente')
            res.redirect('/home')
        })
    }
})
router.get('/', async (req, res) => {
    const cliente = await Cliente.findAll({})
        .then((clientes) => {
            const clientesJSON = clientes.map(cliente => cliente.toJSON());
            res.render('clientes/clientes', { clientes: clientesJSON })
        })
        .catch((err) => {
            req.flash('error_msg', 'Erro ao listar as clientes')
            res.redirect('/home')
        })

})

router.get('/edit/:id', async (req, res) => {
    try {
        const clienteup = await Cliente.findOne({ where: { id: req.params.id } })
        const upJSON = clienteup.toJSON()
        res.render('clientes/update', {cliente: upJSON})
    }
    catch (err) {
        console.log(`Cliente não encontrada`)
    }
    
})

router.post('/edit', async (req, res) => {

    var erros = []
    const cliente = req.body
    console.log(cliente)
    const { nome, sobrenome, telefone, cpf, endereco, numero, bairro, cidade, estado, cep, complemento, email } = req.body //Coletando as informações em caso de erro, não serem apagadas

    // Validação de dados

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: 'Nome invalido!' })
    }
    if (!req.body.sobrenome || typeof req.body.sobrenome == undefined || req.body.sobrenome == null) {
        erros.push({ texto: 'Sobrenome invalido!' })
    }
    if (!req.body.telefone || typeof req.body.telefone == undefined || req.body.telefone == null || req.body.telefone.length < 10) {
        erros.push({ texto: 'Telefone invalido!' })
    }
    if (!req.body.cpf || typeof req.body.cpf == undefined || req.body.cpf == null) {
        erros.push({ texto: 'CPF invalido!' })
    }
    if (!req.body.endereco || typeof req.body.endereco == undefined || req.body.endereco == null) {
        erros.push({ texto: 'Endereço Invalido!' })
    }
    if (!req.body.numero || typeof req.body.numero == undefined || req.body.numero == null) {
        erros.push({ texto: 'Numero do endereço invalido!' })
    }
    if (!req.body.bairro || typeof req.body.bairro == undefined || req.body.bairro == null) {
        erros.push({ texto: 'Bairro invalido!' })
    }
    if (!req.body.cidade || typeof req.body.cidade == undefined || req.body.cidade == null) {
        erros.push({ texto: 'Cidade invalido!' })
    }
    if (!req.body.cep || typeof req.body.cep == undefined || req.body.cep == null) {
        erros.push({ texto: 'CEP invalido' })
    }
    if (!req.body.estado || typeof req.body.estado == undefined || req.body.estado == null) {
        erros.push({ texto: 'Estado invalido!' })
    }
    if (erros.length > 0) {
        res.render(`clientes/update`, { erros: erros,cliente:cliente })
    }else{

        //Update caso os requisitos sejam atendidos
        const updateCliente = await Cliente.update({
            nome: req.body.nome,
            sobrenome: req.body.sobrenome,
            telefone: req.body.telefone,
            email: req.body.email,
            cpf: req.body.cpf,
            endereco: req.body.endereco,
            numero: req.body.numero,
            bairro: req.body.bairro,
            cidade: req.body.cidade,
            cep: req.body.cep,
            uf: req.body.estado
        }, {where: {id: req.body.id}}).then(()=>{
            req.flash('success_msg', 'Alteração atualizada com sucesso!')
            res.redirect('/clientes')
        }).catch((err)=>{
            req.flash('error_msg', 'Erro ao atualizar os dados')
            res.redirect('/clientes')
        })
    }
})

router.post('/delete', async(req,res)=>{
    console.log(req.params.id)
    const deleteCliente = await Cliente.destroy({where: {id: req.body.deleteid}}).then(()=>{
        req.flash('success_msg', 'Cliente deletado com sucesso! ')
        res.redirect('/clientes')
    }).catch((err)=>{
        req.flash('error_msg', 'Erro ao deletar o cliente')
        res.redirect('/clientes')
    })
})

module.exports = router