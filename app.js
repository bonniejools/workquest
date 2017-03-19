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
var Task = mongoose.model('task',
    {
        name:String,
        xp:Number,
        gold:Number,
        owner:String,
        doneBy:String,
        priority:Number
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
app.post('/api/add', (req,res)=>
    {
        if (!req.body.name)
        {
            res.send("Request failed")
        }
        else
        {
            var name = req.body.name
            var xp = req.body.hours * 10
            var gold = xp
            var priority = req.body.priority
            var sesh = req.session
            // var owner = sesh.user._id

            var tmp = new Task()
            tmp.name = name
            tmp.xp = xp
            tmp.gold = gold
            tmp.owner = 0
            tmp.priority = priority
            tmp.doneBy = 0
            tmp.save(()=>
                {
                    res.send("Task: "+ name + " has been added")
                })
        }
    })
app.post('/api/complete/', (req,res)=>
    {
        var user = req.session.user
        var tId = req.body.tId
        Task.findByIdAndUpdate(tId, {owner:1,doneBy:user.id},(err,doc)=>{
            if (err)
                throw err
            var xp = doc.xp
            var gold = doc.gold
            res.send('Task ' + doc.name + ' completed' )
        })

    })
app.post('/api/take/', (req,res)=>
    {
        var user = req.session.user
        // var user = req.body.uId
        var tId = req.body.tId
        Task.findByIdAndUpdate(tId, {owner:user.id},(err,doc)=>{
            if (err)
                throw err
            res.send('Task ' + doc.name + ' taken by ' + user.id )
        })
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
    User.find((err, users) => {
        Task.find((err, tasks) => {
            res.render('manage', {tasks: tasks, users: users});
        });
    });
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
        res.redirect("/")
    // throw err
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
                    res.redirect("/")
            }
            else
            {
                res.redirect("/")
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
    if(req.session.logged)
        res.redirect('/me')
    else
        res.render('login')
})
app.get('/signup',(req,res)=>{
    res.render('register')
})

app.listen(3000,()=>console.log("Server listening on port 3000"))
