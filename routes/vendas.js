const express = require('express')
const router = express.Router()
const Cliente = require('../models/Cliente')
const Produto = require('../models/Produto')
const Vendas = require('../models/Venda')

router.get('/', async(req,res)=>{
    try{
        const pedidos = await Vendas.findAll({})
        const pedidosJSON = pedidos.map(pedido => pedido.toJSON())
        res.render('vendas/vendas', {pedidos: pedidosJSON})
    }catch (err){
        console.log(err)
        res.redirect('/home')
    }
})

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
router.post('/novopedido', async(req,res)=>{
    const data = req.body

    const Clienteid = req.body.Clienteid
    const Pagamentoid = req.body.Pagamentoid
    let QntdParcela = req.body.QntdParcela
    let envio = req.body.envio
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
    if (Pagamentoid == 1){
        if (QntdParcela <= 0 || QntdParcela.length <= 0){
            erros.push({texto: "Erro na quantidade de parcela"})
        }
    }
    if (Pagamentoid > 1){
        QntdParcela = 1 
    }

    const camposPreenchidos = ProdutosSelecionados.every((produto) => {
        return produto.id && produto.nome && produto.vlr && produto.qntd && produto.idIndex;
      });
      
      if (!camposPreenchidos) {
        erros.push({texto: 'Erro nos produtos'})
      }
      if(erros.length > 0){
        res.status(400).json({erros: erros})
      }else{
        const VendedorID = 1
        try{
            const vendas = await Vendas.create({
                vendedor_id: VendedorID,
                cliente_id: Clienteid,
                pagamento_id: Pagamentoid,
                vlr_total: VlrTotal,
                frete: envio,
                vlr_frete: VlrFrete,
            })
            
            const idpedido = vendas.id

            req.flash('success_msg',`Pedido Realizado - Numero do Pedido: ${idpedido}`)
            res.status(200).json({mensagem: "Pedido Finalizado"})
        }
        catch (err){
            console.log(err)
            res.status(400).json({erros: err})
        }
        
      }
    
})
module.exports = router