const express = require('express')
const router = express.Router()

router.get('/cadastro', (req, res) => {
    res.render('usuarios/cadastrouser')
})

module.exports = router