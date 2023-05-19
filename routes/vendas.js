const express = require('express')
const router = express.Router()
const Cliente = require('../models/Cliente')
const Produto = require('../models/Produto')

router.get('/nova', async(req,res)=>{
    try{
        const clientes = await Cliente.findAll({})
        const clientesJSON = clientes.map(cliente => cliente.toJSON())
        res.render('vendas/novavenda', {clientes: clientesJSON})
    } catch (err) {
        req.flash('erro_msg', 'Erro ao carregar os clientes')
        res.redirect('/home')
    }
})

router.get('/nova/cliente/:id', async(req,res)=>{
    try{
        const cliente = await Cliente.findOne({where:{id: req.params.id}})
        const clientesJSON = cliente.toJSON()
        const produtos = await Produto.findAll({})
        const JSONproduto = produtos.map(produto => produto.toJSON())
        res.render('vendas/novavenda', {cliente: clientesJSON, produtos:JSONproduto})
    } catch(err){
        req.flash('error_msg', 'Erro ao carregar cliente')
        res.redirect('/home')
    }
    
})
router.post('/novopedido', (req,res)=>{
    const data = req.body

    const Clienteid = req.body.Clienteid
    const Pagamentoid = req.body.Pagamentoid
    const QntdParcela = req.body.QntdParcela
    var envio = req.body.envio
    const VlrFrete = req.body.VlrFrete
    const VlrTotal = req.body.VlrTotal
    const ProdutosSelecionados = req.body.ProdutosSelecionados

    var erros = []
    if (!Clienteid || typeof Clienteid == undefined || Clienteid == null){
        erros.push({texto: "Erro no ID do cliente"})
    }
    if (!Pagamentoid || typeof Pagamentoid == undefined || Pagamentoid == null){
        erros.push({texto: "Erro no pagamento"})
    }
    switch (envio){
        case '1':
            envio = "Sedex"
            break
        case '2':
            envio = 'Pac'
            break
        case '3':
            envio = 'Motoboy'
            break
        default: 
            envio = 'Não selecionado'
            erros.push({texto: 'Erro modo de envio não selecionado'})
    }
    if (!VlrTotal || typeof VlrTotal == undefined || VlrTotal == null){
        erros.push({texto: "Erro no valor total"})
    }

    
    console.log(envio)
    res.redirect('/vendas/nova')
})
module.exports = router