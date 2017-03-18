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
        gold: Number,
        type: Number
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

app.get('/login', (req, res)=>
{
    res.render('login')
})

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
    })
app.post('/singup',(req,res)=>
    {
        var mail = req.body.mail
        var pass = req.body.pass
        var name = req.body.name

        var tmp = new User();
        tmp.name = name
        tmp.mail = mail
        tmp.hash = hash(pass)
        tmp.xp = 0
        tmp.gold = 0
        tmp.type = 0
        tmp.save(()=>{
            login(req, tmp,()=> res.redirect("/profile"))
        })
    })
//Routes
app.use(express.static('static'))
app.all('/',(req,res)=>{
    res.render('index')
})
app.get('/singup',(req,res)=>{
    res.render('register')
})

app.listen(3000,()=>console.log("Server listening on port 3000"))
