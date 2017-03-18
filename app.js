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
app.locals.pretty = true;

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
var Task = mongoose.model('tasl',
    {
        name:String,
        xp:Number,
        gold:Number,
        owner:String
    })

// app.get('/view/',(req,res)=>{
//     User.find({},(err,users)=>
//         {
//             if(err)
//                 throw err
//             res.send(users)
//         })
// })
// API stuff
app.post('/api/add',ensure, (req,res)=>
    {
        var name = req.body.name
        var xp = req.body.hours * 10
        var gold = req.body.gold
        var sesh = req.session
        var owner = sesh.user._id
    })




// End of api stuff
// User pages
app.get('/me', ensure ,(req,res)=>{
    var sesh = req.session
    User.findOne({mail:sesh.user.mail}, (err,tmpUser) => {
        console.log(sesh.user)
        res.render('profile',{user:sesh.user})
    })
})

app.get('/manage', (req, res)=>{
    res.render('manage');
});

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
                    login(req, tmpUser,()=> res.redirect("/me"))
                else
                    res.send("Lol try again")
            }
            else
            {
                res.send("User not even found")
            }
        })
    })
app.post('/signup',(req,res)=>
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
            login(req, tmp,()=> res.redirect("/me"))
        })
    })
//Routes
app.use(express.static('static'))
app.all('/',(req,res)=>{
    res.render('login')
})
app.get('/signup',(req,res)=>{
    res.render('register')
})

app.listen(3000,()=>console.log("Server listening on port 3000"))
