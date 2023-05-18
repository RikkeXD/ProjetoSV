const express = require('express')
const router = express.Router()
const Cliente = require('../models/Cliente')
const Produto = require('../models/Produto')

router.get('/nova', async(req,res)=>{
    try{
        const clientes = await Cliente.findAll({})
        const clientesJSON = clientes.map(cliente => cliente.toJSON())
        console.log(clientesJSON)
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
        console.log(JSONproduto)
        res.render('vendas/novavenda', {cliente: clientesJSON, produtos:JSONproduto})
    } catch(err){
        req.flash('error_msg', 'Erro ao carregar cliente')
        res.redirect('/home')
    }
    
})
router.post('/novopedido', (req,res)=>{
    console.log(data)
    res.redirect('/vendas/nova')
})
module.exports = router