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
        createCellWithLabel('Nome:', 'John Doe', destinatarioX, nomeY, nomeWidth, nomeHeight);
        createCellWithLabel('Telefone:', '(123) 456-7890', destinatarioX + 200, nomeY, 130, nomeHeight);
        createCellWithLabel('CPF:', '506.207.738-98', destinatarioX + 330, nomeY, 170, nomeHeight);
        createCellWithLabel('Endereço:', '1234 Main St', destinatarioX, nomeY + 30, 330, nomeHeight);
        createCellWithLabel('Número:', '123', destinatarioX + 330, nomeY + 30, 170, nomeHeight);
        createCellWithLabel('Bairro:', 'Centro', destinatarioX, nomeY + 60, 260, nomeHeight);
        createCellWithLabel('CEP:', '12345-678', destinatarioX + 260, nomeY + 60, 140, nomeHeight);
        createCellWithLabel('UF:', 'SP', destinatarioX + 400, nomeY + 60, 100, nomeHeight);
        createCellWithLabel('Complemento', 'CASA 2 Verde', destinatarioX, nomeY + 90, 500, nomeHeight);

        doc.text('Dados da Compra', destinatarioX, novaPosicaoY + 130, { align: 'left' });
        createCellWithLabel('Forma de Pgto:', 'Cartão de Crédito', destinatarioX, novaPosicaoY + 141, 200, nomeHeight);
        createCellWithLabel('Parcelas:', '3', destinatarioX + 200, novaPosicaoY + 141, 100, nomeHeight);
        createCellWithLabel('Modo de Envio:', 'Expresso', destinatarioX + 300, novaPosicaoY + 141, 200, nomeHeight);

        const tituloX = destinatarioX;
        const tituloY = novaPosicaoY + 190;
        const tituloWidth = 30;
        const tituloHeight = 20;

        createCellWithLabelTitulo('Cod', null, tituloX, tituloY, tituloWidth, tituloHeight);
        createCellWithLabelTitulo('Produto', null, tituloX + tituloWidth, tituloY, 150, tituloHeight);
        createCellWithLabelTitulo('Qtd', null, tituloX + tituloWidth + 150, tituloY, 40, tituloHeight);
        createCellWithLabelTitulo('Valor Unitário', null, tituloX + tituloWidth + 150 + 40, tituloY, 130, tituloHeight);
        createCellWithLabelTitulo('Valor Total', null, tituloX + tituloWidth + 150 + 40 + 130, tituloY, 150, tituloHeight);


        //Produtos:
        const produtos = [
            { cod: '001', produto: 'Produto 1', qtd: '2', valorUnitario: '10', valorTotal: '20' },
            { cod: '002', produto: 'Produto 2', qtd: '3', valorUnitario: '15', valorTotal: '45' },
            { cod: '003', produto: 'Produto 3', qtd: '1', valorUnitario: '20', valorTotal: '20' },
            // ... adicione mais produtos conforme necessário
        ];

        const produtoY = novaPosicaoY + 190;
        const produtoHeight = 20;
        const espacoVerticalProdutos = 5;

        // Cria a borda para os produtos
        const produtosX = destinatarioX;
        const produtosWidth = 500;
        const produtosHeight = (produtos.length + 1) * (produtoHeight + espacoVerticalProdutos);
        createBorderedCell(produtosX, produtoY, produtosWidth, produtosHeight);

        // Cria as células para cada produto
        produtos.forEach((produto, index) => {
            const produtoX = produtosX;
            const produtoCellY = produtoY + index * (produtoHeight + espacoVerticalProdutos);

            createCellWithLabelProduto(produto.cod, null, produtoX, produtoCellY, tituloWidth, produtoHeight);
            createCellWithLabelProduto(produto.produto, null, produtoX + tituloWidth, produtoCellY, 150, produtoHeight);
            createCellWithLabelProduto(produto.qtd, null, produtoX + tituloWidth + 150, produtoCellY, 40, produtoHeight);
            createCellWithLabelProduto(produto.valorUnitario, null, produtoX + tituloWidth + 150 + 40, produtoCellY, 130, produtoHeight);
            createCellWithLabelProduto(produto.valorTotal, null, produtoX + tituloWidth + 150 + 40 + 130, produtoCellY, 150, produtoHeight);
        });

        //createCellWithLabelTitulo('Produto', null, tituloX + tituloWidth, tituloY + 25, 150, tituloHeight);

        // Inicia o stream
        //const stream = doc.pipe(fs.createWriteStream('pedido.pdf'));

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

module.exports = router