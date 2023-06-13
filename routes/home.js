const express = require('express')
const router = express.Router()

const salesData = [
    { id: 1, date: '2023-01-01', amount: 100 },
    { id: 2, date: '2023-01-02', amount: 150 },
    { id: 3, date: '2023-01-03', amount: 200 },
  ];

router.get('/', (req, res)=>{
    res.render('home/home', {sales: salesData})
})

module.exports = router