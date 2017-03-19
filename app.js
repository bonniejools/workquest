const express = require('express'),
    app = express(),
    pug = require('pug'),
    mongo = require('mongodb').MongoClient,
    mongoose = require('mongoose'),
    hash  = require('sha256'),
    session = require('express-session'),
    meka = require('./mekonix.js'),
    items = require('./items.json')
url = require('url')

//Express set up
app.use(require('body-parser').urlencoded({ extended: true }));
app.set('view engine', 'pug')
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 600000}}))
app.locals.pretty = true;

//Db stuff
mongoose.connect("mongodb://localhost/work")
var userSchema = mongoose.Schema(
    {
        mail: String,
        name: String,
        hash: String,
        xp:Number,
        gold: Number,
        type: Number,
        gear:
        {
            helmet:Number,
            legs:  Number,
            gloves:Number,
            chest: Number,
            weapon:Number
        }
    })

userSchema.methods.dmg = function()
{
    var dmg = items[this.gear.weapon].damage
    return dmg
}
userSchema.methods.hp = function()
{
    var hp = items[this.gear.helmet].hp +
        items[this.gear.legs].hp +
        items[this.gear.gloves].hp +
        items[this.gear.chest].hp
    return hp
}
function getDamage(thing){
    var dmg = items[thing.gear.weapon].damage
    return dmg
}
function getHp(thing)
{
    var hp = items[thing.gear.helmet].hp +
        items[thing.gear.legs].hp +
        items[thing.gear.gloves].hp +
        items[thing.gear.chest].hp
    return hp
}


function levelClass(level) {
    if (level < 5) {
        return "Peasant";
    }
    else if (level < 10) {
        return "Merchant"
    }
    else if (level < 15) {
        return "Knight"
    }
    else if (level < 20) {
        return "Nobleman"
    }
    else if (level < 25) {
        return "King"
    }
    else {
        return "Enlightened One"
    }
}

userSchema.methods.level = function() {
    var level = "Level " + meka.getLevel(this.xp);
    return level + " " + levelClass(meka.getLevel(this.xp));
}
userSchema.methods.levelClass = function() {
    return String(levelClass(meka.getLevel(this.xp)))
        .toLowerCase()
        .replace(/\s/g, '');
}

var taskSchema = mongoose.Schema(
    {
        name:String,
        xp:Number,
        gold:Number,
        owner:String,
        doneBy:String,
        priority:Number,
        completedAt:Date
    });
// Task status
taskSchema.methods.status = function() {
    if (this.owner == 0) {
        return "Available";
    }
    if (this.doneBy != 0) {
        return "Completed by " + this.doneBy;
    }
    return "Owned by " + this.owner;
}

var Task = mongoose.model('task', taskSchema);
var User = mongoose.model('user', userSchema);

// API stuff
app.get('/api/me', ensure,(req,res)=>
    {
        User.findOne({_id:req.session.user._id}, (err,user) => {
            var ret = {
                '_id': user._id,
                'dmg': user.dmg(),
                'hp': user.hp(),
                'mail': user.mail,
                'name': user.name,
                'xp': user.xp,
                'gold': user.gold,
                'type': user.type,
                'gear': {
                    'helmet': items[user.gear.helmet],
                    'chest': items[user.gear.chest],
                    'gloves': items[user.gear.gloves],
                    'weapon': items[user.gear.weapon],
                    'legs': items[user.gear.legs]
                },
                'level': user.level()
            }

            res.send(ret)
        });
    })

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
app.post('/api/complete/',ensure, (req,res)=>
    {
        var user = req.session.user
        var tId = req.body.tId
        Task.findByIdAndUpdate(tId, {owner:1,doneBy:user._id,completedAt:+ new Date()},(err,doc)=>{
            if (err)
                throw err
            var xp = doc.xp + user.xp
            var gold = doc.gold + user.gold

            User.findByIdAndUpdate(user._id,{gold:gold,xp:xp},(doc2)=>
                {
                    res.send('Task ' + doc.name + ' completed by ' + user.name)
                })
        })

    })
app.post('/api/take/',ensure, (req,res)=>
    {
        var user = req.session.user
        var tId = req.body.tId
        Task.findByIdAndUpdate(tId, {owner:user._id,doneBy:0},(err,doc)=>{
            if (err)
                throw err
            console.log(doc);
            res.send('Task ' + doc.name + ' taken by ' + user.name )
        })
    })
app.post('/api/release/',ensure, (req,res)=>
    {
        var user = req.session.user
        var tId = req.body.tId
        Task.findByIdAndUpdate(tId, {owner:0,doneBy:0},(err,doc)=>{
            if (err)
                throw err
            console.log(doc);
            res.send('Task ' + doc.name + ' released by ' + user.name )
        })
    })
app.post('/api/delete/', (req,res)=>
    {
        var tId = req.body.tId
        Task.remove({_id:tId}, (err,doc)=>{
            if (err)
                throw err
            res.send('Task id: ' + tId + ' removed')
        })
    })
app.post('/api/upItem', (req,res)=>
    {
        var user = req.session.user
        var item = user.gear[req.body.piece]
        console.log(item)
        var newItem = items.indexOf(meka.canUpgrade(user.gold,item).item)
        console.log(newItem)
        if(meka.canUpgrade(user.gold, item).gold > 0)
        {
            User.findByIdAndUpdate(user._id, {gold:meka.canUpgrade(user.gold, item).gold},(doc)=>{
                var string = 'gear.' + req.body.piece
                var miniQuery = {}
                miniQuery[string] = newItem
                var query = {}
                query["$set"] = miniQuery
                User.findByIdAndUpdate(user._id, query,(doc)=>{
                    res.send("Item upgraded")
                })
            })
        }
        else
        {
            res.send("failed")
        }

    })

// Return an object returning three lists of tasks for the user
// (available, current and finished)
function getUserTasks(user_id, callback) {
    Task.find({"owner": 0 }, function(err, available_tasks) {
        Task.find({"owner": user_id }, function(err, current_tasks) {
            Task.find({"doneBy": user_id }, function(err, done_tasks) {
                var tasks = {
                    'available': available_tasks,
                    'current':   current_tasks,
                    'done':      done_tasks
                };
                callback(tasks);
            });
        });
    });
}

// End of api stuff
// User pages
app.get('/me', ensure ,(req,res)=>{
    var sesh = req.session
    User.findOne({_id:sesh.user._id}, (err,user) => {
        getUserTasks(user._id, (tasks) => {
            User.find((err,users)=>
                {
                    res.render('profile',{tasks: tasks, user:user, items: items,users:users})
                })
        });
    })
})

app.get('/manage', (req, res)=>{
    User.find((err, users) => {
        Task.find((err, tasks) => {
            Task.find({owner:0},(err,avaliable)=>
                {
                    res.render('manage', {tasks: tasks, users: users,avaliable:avaliable});
                })
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
        sync(req,()=> next())
    else
        res.redirect("/")
    // throw err
}
function sync(req,callback)
{
    var mail = req.session.user.mail
    User.findOne({mail:mail},(err,doc)=>
        {
            if(err)
            {
                throw err
            }
            req.session.user = doc
            req.session.save(()=> callback())
        })
}

app.get('/duel/:id',ensure ,(req,res)=>
    {
        User.findById(req.params.id, (err,doc)=>
            {
                if(err)
                    throw err
                var enemy =
                    {
                        name:doc.name,
                        xp : doc.xp,
                        dmg : doc.dmg(),
                        hp : doc.hp(),
                        gear : doc.gear,
                        pic : doc.levelClass()
                    }
                User.findById(req.session.user._id, (err,doc2)=>{
                    var nuser =
                        {
                            name:doc2.name,
                            xp : doc2.xp,
                            dmg : doc2.dmg(),
                            hp : doc2.hp(),
                            gear : doc2.gear,
                            pic : doc2.levelClass()
                        }
                    var string = nuser// + enemy
                    console.log(nuser.gear)
                    res.render('fight', {user:nuser, opponent:enemy,items:items})
                })
            })
    })

app.get('/login', (req, res)=>
    {
        res.render('login')
    })

app.get('/fight', ensure, (req, res)=> {
    var url_parts = url.parse(req.url, true);
    var opponent_id = url_parts.opponent;

    res.render('fight', {user: req.session.user, opponent: req.session.user, items: items});
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

        var tmp = new User
        ({
            name : name,
            mail : mail,
            hash : hash(pass),
            xp : 0,
            gold : 0,
            type : 0,
            gear:{
                helmet : meka.getItem('helmet1'),
                legs   : meka.getItem('legs1'),
                gloves : meka.getItem('gloves1'),
                chest  : meka.getItem('chest1'),
                weapon : meka.getItem('sword1')
            }
        });
        console.log(tmp)
        tmp.save(()=>{
            console.log(tmp)
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
