const express = require('express')
const router = express.Router()
const Cliente = require('../models/Cliente')
const Produto = require('../models/Produto')
const Vendas = require('../models/Venda')
const Pagamentos = require('../models/Pagamento')
const Venda_Produto = require('../models/Venda_Produto')
const moment = require('moment')
const { where } = require('sequelize')
const PDFdocument = require('pdfkit')
const fs = require('fs')
const path = require('path')
const { checkToken } = require('../app')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const { error } = require('console')

async function BuscandoNomePorId(id) {
    try {
        const nome = await Cliente.findOne({ where: { id: id } })
        const nomeCliente = `${nome.nome} ${nome.sobrenome}`
        return nomeCliente
    } catch (err) {
        console.log('ERRO NA FUNÇÃO BuscandoNomePorId >>> ', err)
    }

}

async function BuscandoPagamento(id) {
    try {
        const pagamento = await Pagamentos.findOne({ where: { id: id } })
        const nomePagamento = pagamento.nome
        return nomePagamento
    } catch (err) {
        console.log("ERRO NA FUNÇÃO BuscandoPagamento >>> ", err)
    }

}

router.get('/', async (req, res) => {
    try {
        const pedidos = await Vendas.findAll({})
        const pedidosJSON = pedidos.map(pedido => pedido.toJSON())
    
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
                    status = 'Pedido Finalizado'
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
    if (Pagamentoid == 1 || Pagamentoid == 2) {
        if (QntdParcela <= 0 || QntdParcela.length <= 0) {
            erros.push({ texto: "Erro na quantidade de parcela" })
        }
    }

    if (Pagamentoid > 2) {
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

        //Buscando ID do usuario
        const token = req.session.token
        const secret = process.env.SECRET

        const decodedToken = jwt.verify(token, secret)
        const userId = decodedToken.id
        try {
            const vendas = await Vendas.create({
                vendedor_id: userId,
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


async function BuscaPedido(Idvenda) {
    try {
        //Coletando dados da venda
        const pedidoBD = await Vendas.findOne({ where: { id: Idvenda } })
        const pedidoJSON = pedidoBD.toJSON()

        //Coletando dados do Cliente
        const clienteid = pedidoJSON.cliente_id
        const clienteBD = await Cliente.findOne({ where: { id: clienteid } })
        const infoclientes = clienteBD.toJSON()

        //Coletando informações de pagamento
        const pagamentoid = pedidoJSON.pagamento_id
        const pagamentoBD = await Pagamentos.findOne({ where: { id: pagamentoid } })
        const infopagamento = pagamentoBD.toJSON()
        const nomepagamento = infopagamento.nome

        //Verificando se é Parcelado para informar o Front-End e habilitar o campo parcela
        if (pedidoJSON.qntd_parcela > 1) {
            parcela = pedidoJSON.qntd_parcela
            vlr_parcela = pedidoJSON.vlr_total / pedidoJSON.qntd_parcela
        } else {
            vlr_parcela = pedidoJSON.vlr_total
        }

        //Coletando dados da DATA e formatando
        const dataBD = pedidoJSON.createdAt
        const dataFormatada = moment(dataBD).format('DD/MM/YYYY')

        //Criando Pedido
        let pedido = []
        pedido.push({
            numpedido: Idvenda,
            pagamento: nomepagamento,
            parcela: pedidoJSON.qntd_parcela,
            frete: pedidoJSON.frete,
            vlr_parcela: vlr_parcela ? vlr_parcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : null,
            vlr_frete: pedidoJSON.vlr_frete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            vlr_total: pedidoJSON.vlr_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            cod_rastreio: pedidoJSON.cod_rastreio,
            status: pedidoJSON.status,
            data: dataFormatada
        })

        //Coletando Todos os produtos do pedido

        let listprodutos = []
        const produtosBD = await Venda_Produto.findAll({ where: { venda_id: Idvenda } })
        const produtosJSON = produtosBD.map(produto => produto.toJSON())
        for (produtos of produtosJSON) {
            const NomeProduto = await Produto.findOne({ where: { id: produtos.produto_id } })
            const NomeProdutoJSON = NomeProduto.toJSON()
            const total = produtos.quantidade * produtos.vlr_uni
            listprodutos.push({
                id: produtos.produto_id,
                produto: NomeProdutoJSON.nome,
                qntd: produtos.quantidade,
                vlr_uni: produtos.vlr_uni.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                total: total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            })
        }

        return {
            pedido: pedidoJSON,
            cliente: infoclientes,
            pedido: pedido,
            listprodutos: listprodutos,
            vlr_parcela: vlr_parcela
        }
    } catch (err) {
        console.log("Ocorreu o erro: " + err)
    }
}


router.get('/pedido/:id', async (req, res) => {
    try {
        const pedidoInfo = await BuscaPedido(req.params.id)
        const infoclientes = pedidoInfo.cliente
        const pedido = pedidoInfo.pedido
        const listprodutos = pedidoInfo.listprodutos
        const vlr_parcela = pedidoInfo.vlr_parcela

        res.render('vendas/pedido', { produtos: listprodutos, cliente: infoclientes, pedido: pedido, vlr_parcela: vlr_parcela })
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
        }, { where: { id: idpedido } }).then(() => {
            req.flash('success_msg', 'Rastreio atualizado com sucesso')
            res.redirect(`/vendas/pedido/${idpedido}`)
        }).catch((err) => {
            console.log(err)
            req.flash('error_msg', 'ERRO AO ATUALIZAR O STATUS')
            res.redirect(`/vendas/pedido/${idpedido}`)
        })


    } else {
        console.log("ERRO AO ATUALIZAR O STATUS")
        req.flash('error_msg', 'ERRO AO ATUALIZAR O STATUS')
        res.redirect(`/vendas/pedido/${idpedido}`)
    }
})



//Criação do PDF
router.get('/:id/download', async (req, res) => {
    try {
        const pedido = await Vendas.findOne({ where: { id: req.params.id } })
        if (!pedido) {
            req.flash('error_msg', 'Pedido não encontrado !')
            res.redirect('/vendas')
        }

        //Coletando dados do pedido
        const DadosPedido = await BuscaPedido(req.params.id)
        const produtos = DadosPedido.listprodutos
        const cliente = DadosPedido.cliente
        const Infopedido = DadosPedido.pedido[0]

        //Criando um novo documento PDF
        const doc = new PDFdocument()
        const stream = fs.createWriteStream('pedido.pdf');
        // Inicia o documento e define as configurações iniciais
        doc.pipe(stream);


        doc.page.margins = { top: 50, bottom: 50, left: 50, right: 50 };
        doc.font('Helvetica');
        doc.fontSize(10);

        function createCellWithLabel(label, value, x, y, width, height) {
            doc.text(label, x + 1.5, y + 2, { align: 'left' });
            doc.text(value, x + 2, y + 15, { align: 'left' });
            doc.rect(x, y, width, height).stroke();
        }

        function createCellWithLabelTitulo(label, value, x, y, width, height) {
            doc.text(label, x + 3, y + 6, { align: 'left' });
            doc.text(value, x + 5, y + 15, { align: 'left' });
            doc.rect(x, y, width, height).stroke();
        }

        function createCellWithLabelProduto(label, value, x, y, width, height) {
            doc.text(label, x + 3, y + 6, { align: 'left' });
            doc.text(value, x + 5, y + 15, { align: 'left' });
            doc.rect(x, y, width, height).stroke();
        }

        function createCellWithLabelTotal(label, value, x, y, width, height) {
            doc.text(label, x + 3, y + 2, { align: 'left' });
            doc.text(value, x + 5, y + 15, { align: 'left' });
            doc.rect(x, y, width, height).stroke();
        }

        function createBorderedCell(x, y, width, height) {
            doc.rect(x, y, width, height).stroke();
        }

        doc.text('M.A SAUDE E VIDA', 50, 50, { align: 'left' });
        doc.text('CNPJ:13.822.074/0001-55', 50, 65, { align: 'left' });

        //Imagem
        const imageX = 430; // Posição X da imagem
        const imageY = 40; // Posição Y da imagem
        const imagePath = path.join(__dirname, "../media/logo-sv.png");

        // Verifica se o arquivo da imagem existe
        if (fs.existsSync(imagePath)) {
            doc.image(imagePath, imageX, imageY, { width: 400 });
        }

        const destinatarioHeight = 20;
        const destinatarioY = 80;
        const destinatarioX = 50;
        const espacoVertical = 10;
        const novaPosicaoY = destinatarioY + destinatarioHeight + espacoVertical;

        doc.y = novaPosicaoY;

        const nomeY = novaPosicaoY;
        const nomeWidth = 200;
        const nomeHeight = 28; //Altura das Bordas

        doc.text('Destinatário/Remetente', destinatarioX, novaPosicaoY - 12, { align: 'left' });
        doc.text(`Pedido ${Infopedido.numpedido} /`, destinatarioX + 350, novaPosicaoY - 12, { align: 'left' });
        doc.text(`Emissão ${Infopedido.data}`, destinatarioX + 400, novaPosicaoY - 12, { align: 'left' });
        createCellWithLabel('Nome:', `${cliente.nome} ${cliente.sobrenome}`, destinatarioX, nomeY, nomeWidth, nomeHeight);
        createCellWithLabel('Telefone:', `${cliente.telefone}`, destinatarioX + 200, nomeY, 130, nomeHeight);
        createCellWithLabel('CPF:', `${cliente.cpf}`, destinatarioX + 330, nomeY, 170, nomeHeight);
        createCellWithLabel('Endereço:', `${cliente.endereco}`, destinatarioX, nomeY + 30, 330, nomeHeight);
        createCellWithLabel('Número:', `${cliente.numero}`, destinatarioX + 330, nomeY + 30, 170, nomeHeight);
        createCellWithLabel('Bairro:', `${cliente.bairro}`, destinatarioX, nomeY + 60, 260, nomeHeight);
        createCellWithLabel('CEP:', `${cliente.cep}`, destinatarioX + 260, nomeY + 60, 140, nomeHeight);
        createCellWithLabel('UF:', `${cliente.uf}`, destinatarioX + 400, nomeY + 60, 100, nomeHeight);
        if (!cliente.complemento || cliente.complemento == null || cliente.complemento == undefined) {
            createCellWithLabel('Complemento:', ``, destinatarioX, nomeY + 90, 500, nomeHeight);
        } else {
            createCellWithLabel('Complemento:', `${cliente.complemento}`, destinatarioX, nomeY + 90, 500, nomeHeight);
        }


        doc.text('Dados da Compra', destinatarioX, novaPosicaoY + 130, { align: 'left' });
        createCellWithLabel('Forma de Pgto:', `${Infopedido.pagamento}`, destinatarioX, novaPosicaoY + 141, 200, nomeHeight);
        if (Infopedido.parcela > 1) {
            createCellWithLabel('Parcelas:', `${Infopedido.parcela}`, destinatarioX + 200, novaPosicaoY + 141, 100, nomeHeight);
        } else {
            createCellWithLabel('Parcelas:', ``, destinatarioX + 200, novaPosicaoY + 141, 100, nomeHeight);
        }

        createCellWithLabel('Modo de Envio:', `${Infopedido.frete}`, destinatarioX + 300, novaPosicaoY + 141, 200, nomeHeight);

        const tituloX = destinatarioX;
        const tituloY = novaPosicaoY + 190;
        const tituloWidth = 30;
        const tituloHeight = 20;

        createCellWithLabelTitulo('Cod', null, tituloX, tituloY, tituloWidth, tituloHeight);
        createCellWithLabelTitulo('Produto', null, tituloX + tituloWidth, tituloY, 150, tituloHeight);
        createCellWithLabelTitulo('Qtd', null, tituloX + tituloWidth + 150, tituloY, 40, tituloHeight);
        createCellWithLabelTitulo('Valor Unitário', null, tituloX + tituloWidth + 150 + 40, tituloY, 130, tituloHeight);
        createCellWithLabelTitulo('Valor Total', null, tituloX + tituloWidth + 150 + 40 + 130, tituloY, 150, tituloHeight);

        const produtosX = destinatarioX;
        const produtosY = novaPosicaoY + 215;
        const produtoHeight = 20;
        const espacoVerticalProdutos = 5;

        //Cria a borda para os produtos
        createBorderedCell(produtosX, produtosY, 500, produtoHeight);

        //Cria as células para cada produto
        produtos.forEach((produto, index) => {
            const produtoX = produtosX;
            const produtoCellY = produtosY + index * (produtoHeight + espacoVerticalProdutos);

            createCellWithLabelProduto(produto.id, null, produtoX, produtoCellY, tituloWidth, produtoHeight);
            createCellWithLabelProduto(produto.produto, null, produtoX + tituloWidth, produtoCellY, 150, produtoHeight);
            createCellWithLabelProduto(produto.qntd, null, produtoX + tituloWidth + 150, produtoCellY, 40, produtoHeight);
            createCellWithLabelProduto(produto.vlr_uni, null, produtoX + tituloWidth + 150 + 40, produtoCellY, 130, produtoHeight);
            createCellWithLabelProduto(produto.total, null, produtoX + tituloWidth + 150 + 40 + 130, produtoCellY, 150, produtoHeight);
        });

        //Valor Frete
        createCellWithLabelTotal('Frete:', `${Infopedido.vlr_frete}`, produtosX + tituloWidth + 150 + 40 + 130, produtosY + produtos.length * (produtoHeight + espacoVerticalProdutos + 2), 150, produtoHeight + 5);

        if (Infopedido.parcela > 1) {
            //Valor Parcela
            createCellWithLabelTotal('Parcela:', `${Infopedido.vlr_parcela}`, produtosX + tituloWidth + 150 + 40 + 130, produtosY + (produtos.length + 1) * (produtoHeight + espacoVerticalProdutos + 2), 150, produtoHeight + 5);

            //Valor Total
            createCellWithLabelTotal('Valor Total:', `${Infopedido.vlr_total}`, produtosX + tituloWidth + 150 + 40 + 130, produtosY + (produtos.length + 2) * (produtoHeight + espacoVerticalProdutos + 2), 150, produtoHeight + 5);
        } else {
            //Valor Total
            createCellWithLabelTotal('Valor Total:', `${Infopedido.vlr_total}`, produtosX + tituloWidth + 150 + 40 + 130, produtosY + (produtos.length + 1) * (produtoHeight + espacoVerticalProdutos + 2), 150, produtoHeight + 5);
        }


        //Pagina 2 do PDF
        doc.addPage()
        doc.text('M.A SAUDE E VIDA', 50, 50, { align: 'left' });
        doc.text('CNPJ:13.822.074/0001-55', 50, 65, { align: 'left' });


        // Verifica se o arquivo da imagem existe
        if (fs.existsSync(imagePath)) {
            doc.image(imagePath, imageX, imageY, { width: 400 });
        }

        doc.y = novaPosicaoY;

        doc.text('Destinatário/Remetente', destinatarioX, novaPosicaoY - 12, { align: 'left' });
        doc.text(`Pedido ${Infopedido.numpedido} /`, destinatarioX + 345, novaPosicaoY - 12, { align: 'left' });
        doc.text(`Emissão ${Infopedido.data}`, destinatarioX + 395, novaPosicaoY - 12, { align: 'left' });
        createCellWithLabel('Nome:', `${cliente.nome} ${cliente.sobrenome}`, destinatarioX, nomeY, nomeWidth, nomeHeight);
        createCellWithLabel('Telefone:', `${cliente.telefone}`, destinatarioX + 200, nomeY, 130, nomeHeight);
        createCellWithLabel('CPF:', `${cliente.cpf}`, destinatarioX + 330, nomeY, 170, nomeHeight);
        createCellWithLabel('Endereço:', `${cliente.endereco}`, destinatarioX, nomeY + 30, 330, nomeHeight);
        createCellWithLabel('Número:', `${cliente.numero}`, destinatarioX + 330, nomeY + 30, 170, nomeHeight);
        createCellWithLabel('Bairro:', `${cliente.bairro}`, destinatarioX, nomeY + 60, 260, nomeHeight);
        createCellWithLabel('CEP:', `${cliente.cep}`, destinatarioX + 260, nomeY + 60, 140, nomeHeight);
        createCellWithLabel('UF:', `${cliente.uf}`, destinatarioX + 400, nomeY + 60, 100, nomeHeight);
        if (!cliente.complemento || cliente.complemento == null || cliente.complemento == undefined) {
            createCellWithLabel('Complemento:', ``, destinatarioX, nomeY + 90, 500, nomeHeight);
        } else {
            createCellWithLabel('Complemento:', `${cliente.complemento}`, destinatarioX, nomeY + 90, 500, nomeHeight);
        }

        doc.text('Dados da Compra', destinatarioX, novaPosicaoY + 130, { align: 'left' });
        createCellWithLabel('Forma de Pgto:', `${Infopedido.pagamento}`, destinatarioX, novaPosicaoY + 141, 200, nomeHeight);
        if (Infopedido.parcela > 1) {
            createCellWithLabel('Parcelas:', `${Infopedido.parcela}`, destinatarioX + 200, novaPosicaoY + 141, 100, nomeHeight);
        } else {
            createCellWithLabel('Parcelas:', ``, destinatarioX + 200, novaPosicaoY + 141, 100, nomeHeight);
        }
        createCellWithLabel('Modo de Envio:', `${Infopedido.frete}`, destinatarioX + 300, novaPosicaoY + 141, 200, nomeHeight);


        createCellWithLabelTitulo('Cod', null, tituloX, tituloY, tituloWidth, tituloHeight);
        createCellWithLabelTitulo('Produto', null, tituloX + tituloWidth, tituloY, 150, tituloHeight);
        createCellWithLabelTitulo('Qtd', null, tituloX + tituloWidth + 150, tituloY, 40, tituloHeight);
        createCellWithLabelTitulo('Valor Unitário', null, tituloX + tituloWidth + 150 + 40, tituloY, 130, tituloHeight);
        createCellWithLabelTitulo('Valor Total', null, tituloX + tituloWidth + 150 + 40 + 130, tituloY, 150, tituloHeight);


        //Cria a borda para os produtos
        createBorderedCell(produtosX, produtosY, 500, produtoHeight);

        //Cria as células para cada produto
        produtos.forEach((produto, index) => {
            const produtoX = produtosX;
            const produtoCellY = produtosY + index * (produtoHeight + espacoVerticalProdutos);

            createCellWithLabelProduto(produto.id, null, produtoX, produtoCellY, tituloWidth, produtoHeight);
            createCellWithLabelProduto(produto.produto, null, produtoX + tituloWidth, produtoCellY, 150, produtoHeight);
            createCellWithLabelProduto(produto.qntd, null, produtoX + tituloWidth + 150, produtoCellY, 40, produtoHeight);
            createCellWithLabelProduto(produto.vlr_uni, null, produtoX + tituloWidth + 150 + 40, produtoCellY, 130, produtoHeight);
            createCellWithLabelProduto(produto.total, null, produtoX + tituloWidth + 150 + 40 + 130, produtoCellY, 150, produtoHeight);
        });

        //Valor Frete
        createCellWithLabelTotal('Frete:', `${Infopedido.vlr_frete}`, produtosX + tituloWidth + 150 + 40 + 130, produtosY + produtos.length * (produtoHeight + espacoVerticalProdutos + 2), 150, produtoHeight + 5);

        if (Infopedido.parcela > 1) {
            //Valor Parcela
            createCellWithLabelTotal('Parcela:', `${Infopedido.vlr_parcela}`, produtosX + tituloWidth + 150 + 40 + 130, produtosY + (produtos.length + 1) * (produtoHeight + espacoVerticalProdutos + 2), 150, produtoHeight + 5);

            //Valor Total
            createCellWithLabelTotal('Valor Total:', `${Infopedido.vlr_total}`, produtosX + tituloWidth + 150 + 40 + 130, produtosY + (produtos.length + 2) * (produtoHeight + espacoVerticalProdutos + 2), 150, produtoHeight + 5);
        } else {
            //Valor Total
            createCellWithLabelTotal('Valor Total:', `${Infopedido.vlr_total}`, produtosX + tituloWidth + 150 + 40 + 130, produtosY + (produtos.length + 1) * (produtoHeight + espacoVerticalProdutos + 2), 150, produtoHeight + 5);
        }

        doc.text('Assinatura', 50, 520, { align: 'left' });

        doc.moveTo(50, 540) // Coordenadas do ponto de partida
            .lineTo(550, 540) // Coordenadas do ponto de destino
            .stroke();

        // Evento de conclusão do stream
        stream.on('finish', () => {
            // Lê o arquivo PDF e envia como resposta de download
            fs.readFile('pedido.pdf', (err, data) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Erro ao gerar o PDF');
                }

                // Define os cabeçalhos de resposta para abrir o PDF no navegador
                res.setHeader('Content-Disposition', 'inline; filename="pedido.pdf"');
                res.setHeader('Content-Type', 'application/pdf');

                // Envia o arquivo PDF como resposta
                res.send(data);
            });
        });

        // Encerra o documento e finaliza o stream
        doc.end();
    }

    catch (err) {
        req.flash('error_msg', 'Erro ao baixar o pedido')
        console.log("ERRO: ++++++++++++++++++++++ " + err)
        res.redirect('/vendas')
    }

})

//Mudando o Status do pedido para finalizado
router.get('/:id/finalizar', async (req, res) => {
    const status = await Vendas.update({
        status: 3
    }, { where: { id: req.params.id } }).then(() => {
        req.flash('success_msg', 'Pedido finalizado com sucesso!')
        res.redirect(`/vendas/pedido/${req.params.id}`)
    }).catch((err) => {
        console.log('ERRO AO FINALIZAR O PEDIDO ROTA /:ID/FINALIZAR' + err)
        req.flash('error_msg', "Erro ao finalizar o pedido")
        res.redirect(`/vendas/pedido/${req.params.id}`)
    })
})
module.exports = router