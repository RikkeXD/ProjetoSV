const express = require('express')
const router = express.Router()

router.get('/cadastro', (req,res) =>{
    res.render('clientes/cadastroclientes')
})

module.exports = router