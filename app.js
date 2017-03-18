const express = require('express'),
      app = express(),
      pug = require('pug'),
      mongo = require('mongodb').MongoClient

//Express set up
app.set('view engine', 'pug')

//Routes 
app.use(express.static('static'))
app.all('/',(req,res)=>{
    res.send("Hello World!")
})

app.listen(3000,()=>console.log("Server listening on port 3000"))
