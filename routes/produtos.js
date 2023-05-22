const express = require('express')
const router = express.Router()
const Produto = require('../models/Produto')


router.get('/', async (req, res) => {
    try {
        const produtosAll = await Produto.findAll({})
        const produtosJSON = produtosAll.map(produtos => produtos.toJSON())
        res.render('produtos/produtos', { produtos: produtosJSON })
    } catch (err) {
        req.flash('error_msg', 'Erro ao listar os produtos')
        res.redirect('/home')
    }


})

router.post('/cadastrar', async (req, res) => {

    var erro = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erro.push({ texto: 'Nome vazio ou invalido' })
    }
    if (!req.body.fornecedor || typeof req.body.fornecedor == undefined || req.body.fornecedor == null) {
        erro.push({ texto: 'Fornecedor vazio ou invalido' })
    }
    if (erro.length > 0) {
        res.render('produtos/produtos', { erro: erro })
    } else {
        const produtos = await Produto.create({
            nome: req.body.nome,
            fornecedor: req.body.fornecedor,
            cod_barras: req.body.codigo_barras
        }).then(() => {
            req.flash('success_msg', 'Produto cadastrado com sucesso!')
            res.redirect('/produtos')
        }).catch((err) => {
            req.flash('error_msg', 'Ocorreu um erro ao cadastrar o produto' + err)
            res.redirect('/produtos')
        })
    }

})

router.get('/editprod/:id', async (req, res) => {
    try {
        const produto = await Produto.findOne({ where: { id: req.params.id } })
        const produtoJSON = produto.toJSON()
        res.render("produtos/editprod", { produto: produtoJSON })
    } catch (err) {
        req.flash('error_msg', 'Erro ao carregar produto')
        res.redirect('/home')
    }

})

router.post('/editprod', async (req, res) => {

    var erros = []
    const produtos = req.body
    const {nome, fornecedor, cod_barras} = req.body
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: 'Nome vazio ou invalido' })
    }
    if (!req.body.fornecedor || typeof req.body.fornecedor == undefined || req.body.fornecedor == null) {
        erros.push({ texto: 'Fornecedor vazio ou invalido' })
    }
    if (erros.length > 0) {
        console.log(erros)
        res.render('produtos/editprod', { erros: erros, produto: produtos })
    } else {
        const update = await Produto.update({
            nome: req.body.nome,
            fornecedor: req.body.fornecedor,
            cod_barras: req.body.cod_barras
        }, { where: { id: req.body.id } }).then(() => {
            req.flash('success_msg', 'Produto alterado com sucesso!')
            res.redirect('/produtos')
        }).catch((err) => {
            console.log(err)
            req.flash('error_msg', 'Erro ao alterar o produto')
            res.redirect('/produtos')
        })
    }
})
router.post('/delete', async(req,res)=>{
    const deletarProd = await Produto.destroy({where: {id: req.body.id}}).then(()=>{
        req.flash('success_msg', 'Produto deletado com sucesso!')
        res.redirect('/produtos')
    }).catch((err)=>{
        req.flash('error_msg', 'Erro ao deletar o produto')
        res.redirect('/produtos')
    })
})
module.exports = router