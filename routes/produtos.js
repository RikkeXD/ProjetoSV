const express = require('express')
const router = express.Router()
const Produto = require('../models/Produto')


router.get('/', (req,res)=>{
    res.render('produtos/produtos')
})

module.exports = router