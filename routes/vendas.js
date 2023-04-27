const express = require('express')
const router = express.Router()

router.get('/nova',(req,res)=>{
    res.render('vendas/novavenda')
})
module.exports = router