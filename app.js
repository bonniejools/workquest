const express = require('express'),
    app = express(),
    pug = require('pug'),
    mongo = require('mongodb').MongoClient,
    mongoose = require('mongoose'),
    hash  = require('sha256'),
    session = require('express-session')


//Express set up
app.use(require('body-parser').urlencoded({ extended: true }));
app.set('view engine', 'pug')
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

//Db stuff
mongoose.connect("mongodb://localhost/work")
var User = mongoose.model('user',
    {
        mail: String,
        name: String,
        hash: String,
        xp:Number,
        level: Number,
        gold: Number
    })

app.get('/add/:name',(req,res)=>{
    var tmp = new User();
    tmp.name = req.params.name
    tmp.mail = "peumendonca@gmail.com"
    tmp.hash = '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
    tmp.xp = 0
    tmp.level = 0
    tmp.gold = 0
    tmp.save(()=>{
        var sesh = req.session
        sesh.logged = true
        sesh.user = tmp
        res.send("Hello " + req.params.name)
    })
})
app.get('/view/',(req,res)=>{
    User.find({},(err,users)=>
        {
            if(err)
                throw err
            res.send(users)
        })
})
app.get('/profile', ensure ,(req,res)=>{
    var sesh = req.session
    console.log(sesh.user)
    res.send(sesh.user)
})
//User managment
function login(req, user, callback)
{
    var sesh = req.session
    sesh.logged = true
    sesh.user = user
    callback()
}
function ensure(req,res,next)
{
    var err = "User is not logged wtf"
    if(req.session.logged == true)
        next()
    else
        throw err
}

app.post('/login',(req,res)=>
    {
        var user = req.body.user
        var pass = req.body.pass

        User.findOne({mail:user}, (err,tmpUser) => {
            if(err)
                throw err
            if(tmpUser)
            {
                if (tmpUser.hash == hash(pass))
                    login(req, tmpUser,()=> res.redirect("/profile"))
                else
                    res.send("Lol try again")
            }
            else
            {
                res.send("User not even found")
            }
        })
        // res.send(user + pass)
    })
//Routes
app.use(express.static('static'))
app.all('/',(req,res)=>{
    res.render('index')
})

app.listen(3000,()=>console.log("Server listening on port 3000"))
