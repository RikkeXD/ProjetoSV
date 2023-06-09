const express = require('express')
const router = express.Router()
const Cliente = require('../models/Cliente')
const Produto = require('../models/Produto')
const Vendas = require('../models/Venda')
const Pagamentos = require('../models/Pagamento')
const Venda_Produto = require('../models/Venda_Produto')
const moment = require('moment')
const { where } = require('sequelize')

async function BuscandoNomePorId(id) {
    try {
        const nome = await Cliente.findOne({ where: { id: id } })
        const nomeCliente = `${nome.nome} ${nome.sobrenome}`
        return nomeCliente
    } catch (err) {
        console.log('ERRO NA FUNÇÃO Bus')
    }

}

async function BuscandoPagamento(id) {
    try {
        const pagamento = await Pagamentos.findOne({ where: { id: id } })
        const nomePagamento = pagamento.nome
        return nomePagamento
    } catch (err) {
        console.log("ERRO NA FUNÇÃO BUSCANDOPAGAMENTO" + err)
    }

}

router.get('/', async (req, res) => {
    try {
        const pedidos = await Vendas.findAll({})
        const pedidosJSON = pedidos.map(pedido => pedido.toJSON())
        //console.log(pedidosJSON)
        const TodosPedidos = []
        for (const pedido of pedidosJSON) {
            const pedidoid = pedido.id
            const clienteId = pedido.cliente_id
            const Pagamentoid = pedido.pagamento_id
            const statusID = pedido.status
            const vlr_total = pedido.vlr_total
            var status = ''

            switch (statusID) {
                case 1:
                    status = "Envio Pendente"
                    break
                case 2:
                    status = "Pedido em transporte"
                    break
                case 3:
                    status = 'Pedido Entregue'
                    break
                default:
                    status = "Erro no Status do pedido"
            }


            //Formatando DATA
            const dataBD = pedido.createdAt
            const dataFormatada = moment(dataBD).format('DD/MM/YYYY')

            //Formatando Valor total
            const total_formatado = `R$ ${vlr_total.toFixed(2).replace('.', ',')}`


            //Buscando Nome, atraves do ID e Armazenando o NOME
            const NomeCliente = await BuscandoNomePorId(clienteId)
            const NomePagamento = await BuscandoPagamento(Pagamentoid)

            //Inserindo no OBJ
            TodosPedidos.push({
                id: pedidoid,
                nome: NomeCliente,
                pagamento: NomePagamento,
                data: dataFormatada,
                status: status,
                vlr_total: total_formatado
            })
        }




        const NomePagamento = await BuscandoPagamento(1)
        //console.log("Nome função" + NameFuction)
        res.render('vendas/vendas', { pedidos: TodosPedidos })
    } catch (err) {
        console.log(err)
        res.redirect('/home')
    }
})

router.get('/nova', async (req, res) => {
    try {
        const clientes = await Cliente.findAll({})
        const clientesJSON = clientes.map(cliente => cliente.toJSON())
        res.render('vendas/novavenda', { clientes: clientesJSON })
    } catch (err) {
        req.flash('erro_msg', 'Erro ao carregar os clientes')
        res.redirect('/home')
    }
})

router.get('/nova/cliente/:id', async (req, res) => {
    try {
        const cliente = await Cliente.findOne({ where: { id: req.params.id } })
        const clientesJSON = cliente.toJSON()
        const produtos = await Produto.findAll({})
        const JSONproduto = produtos.map(produto => produto.toJSON())
        res.render('vendas/novavenda', { cliente: clientesJSON, produtos: JSONproduto })
    } catch (err) {
        req.flash('error_msg', 'Erro ao carregar cliente')
        res.redirect('/home')
    }

})
router.post('/novopedido', async (req, res) => {
    const data = req.body

    const Clienteid = req.body.Clienteid
    const Pagamentoid = req.body.Pagamentoid
    let QntdParcela = parseInt(req.body.QntdParcela)
    let envio = req.body.envio
    const VlrFrete = req.body.VlrFrete
    const VlrTotal = req.body.VlrTotal
    const ProdutosSelecionados = req.body.ProdutosSelecionados

    var erros = []
    if (!Clienteid || typeof Clienteid == undefined || Clienteid == null) {
        erros.push({ texto: "Erro no ID do cliente" })
    }
    if (!Pagamentoid || typeof Pagamentoid == undefined || Pagamentoid == null) {
        erros.push({ texto: "Erro no pagamento" })
    }
    switch (envio) {
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
            erros.push({ texto: 'Erro modo de envio não selecionado' })
    }
    if (!VlrTotal || typeof VlrTotal == undefined || VlrTotal == null) {
        erros.push({ texto: "Erro no valor total" })
    }
    if (Pagamentoid == 1) {
        if (QntdParcela <= 0 || QntdParcela.length <= 0) {
            erros.push({ texto: "Erro na quantidade de parcela" })
        }
    }

    if (Pagamentoid > 1) {
        QntdParcela = 1
    }

    const camposPreenchidos = ProdutosSelecionados.every((produto) => {
        return produto.id && produto.nome && produto.vlr && produto.qntd && produto.idIndex;
    });



    if (!camposPreenchidos) {
        erros.push({ texto: 'Erro nos produtos' })
    }




    if (erros.length > 0) {
        res.status(400).json({ erros: erros })
    } else {
        const VendedorID = 1
        try {
            const vendas = await Vendas.create({
                vendedor_id: VendedorID,
                cliente_id: Clienteid,
                pagamento_id: Pagamentoid,
                qntd_parcela: QntdParcela,
                vlr_total: VlrTotal,
                frete: envio,
                vlr_frete: VlrFrete,
                status: 1
            })

            const idpedido = vendas.id

            for (const produto of ProdutosSelecionados) {
                const IdProduto = produto.id
                const qntd = produto.qntd
                const vlr_uni = produto.vlr

                const produtoDB = await Venda_Produto.create({
                    venda_id: idpedido,
                    produto_id: IdProduto,
                    quantidade: qntd,
                    vlr_uni: vlr_uni
                })


            }

            req.flash('success_msg', `Pedido Realizado - Numero do Pedido: ${idpedido}`)
            res.status(200).json({ mensagem: "Pedido Finalizado" })
        }
        catch (err) {
            console.log(err)
            res.status(400).json({ erros: err })
        }

    }

})

router.get('/pedido/:id', async (req, res) => {
    try {
        var pedido = []
        var listprodutos = []

        const pedidoBD = await Vendas.findOne({ where: { id: req.params.id } })
        const pedidoJSON = pedidoBD.toJSON()

        //Coletando informações do Usuarios
        const clienteid = pedidoJSON.cliente_id
        const clienteBD = await Cliente.findOne({ where: { id: clienteid } })
        const infoclientes = clienteBD.toJSON()


        //Coletando informações de pagamento
        const pagamentoid = pedidoJSON.pagamento_id
        const pagamentoBD = await Pagamentos.findOne({ where: { id: pagamentoid } })
        const infopagamento = pagamentoBD.toJSON()
        const nomepagamento = infopagamento.nome

        //Verificando se é Parcelado para informar o Front-End
        let vlr_parcela = null
        if (pedidoJSON.qntd_parcela > 1) {
            parcela = pedidoJSON.qntd_parcela
            vlr_parcela = pedidoJSON.vlr_total / pedidoJSON.qntd_parcela
        }

        // Criando um JSON para enviar para o Front-End
        pedido.push({
            numpedido: req.params.id,
            pagamento: nomepagamento,
            parcela: pedidoJSON.qntd_parcela,
            frete: pedidoJSON.frete,
            vlr_parcela: vlr_parcela ? vlr_parcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : null,
            vlr_frete: pedidoJSON.vlr_frete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            vlr_total: pedidoJSON.vlr_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            cod_rastreio: pedidoJSON.cod_rastreio,
            status: pedidoJSON.status
        })

        //Pegando todos os produtos do pedido
        const produtosBD = await Venda_Produto.findAll({ where: { venda_id: req.params.id } })
        const produtosJSON = produtosBD.map(produto => produto.toJSON())
        for (produtos of produtosJSON) {
            const NomeProduto = await Produto.findOne({ where: { id: produtos.produto_id } })
            const NomeProdutoJSON = NomeProduto.toJSON()
            const total = produtos.quantidade * produtos.vlr_uni
            listprodutos.push({
                produto: NomeProdutoJSON.nome,
                qntd: produtos.quantidade,
                vlr_uni: produtos.vlr_uni.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                total: total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            })
            //console.log(totalFormatado)
            //console.log(listprodutos)
            //console.log(pedidoJSON)
        }

        console.log(pedido)
        res.render('vendas/pedido', { produtos: listprodutos, cliente: infoclientes, pedido: pedido, vlr_parcela: vlr_parcela })
        //console.log(pedidoJSON)
    } catch (erro) {
        console.log("Ocorreu o seguinte erro: " + erro)
    }


})

//Atualizando o STATUS do envio

router.post('/pedido/:id/status', async (req, res) => {
    const idpedido = req.params.id
    let codstatus = ""
    if (req.body.motoboy || req.body.rastreio) {
        if (req.body.motoboy) {
            codstatus = 2
        } else {
            codstatus = 2
        }
            const status = await Vendas.update({
                status: codstatus,
                cod_rastreio: req.body.rastreio ? req.body.rastreio : "Motoboy"
            }, {where: {id: idpedido}}).then(()=>{
                req.flash('success_msg', 'Rastreio atualizado com sucesso')
                res.redirect(`/vendas/pedido/${idpedido}`)
            }).catch((err) => {
                console.log(err)
                req.flash('error_msg', 'ERRO AO ATUALIZAR O STATUS')
                res.redirect(`/vendas/pedido/${idpedido}`)
            })

            
        }else{
            console.log("ERRO AO ATUALIZAR O STATUS")
            req.flash('error_msg', 'ERRO AO ATUALIZAR O STATUS')
            res.redirect(`/vendas/pedido/${idpedido}`)
        }
})


    
    
module.exports = router