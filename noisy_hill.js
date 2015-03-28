/*==========================
 *
 *	DEPENDENCIES & GLOBAL VARIABLES
 *
==========================*/

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http,{transport:['websocket','polling']});
var uuid = require('node-uuid');

//middleware
var bodyParser = require('body-parser');
var session = require('express-session');  

var port = process.env.PORT || 3000;
//routes
var index = require('./routes/index');
var room = require('./routes/room');
//var artbay = require('./routes/artbay');
var activeConnections = 0;
var myRoom = 0;
var roomLord = {};

/*==========================
 *
 * 	MIDDLEWARE
 *
==========================*/


//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:false}));

// parse application/json
app.use(bodyParser.json());

// session
app.use(session({
	secret: 'illusTraTions',
	cookie:{secure:true}
	}));

//js css img
app.use(express.static(__dirname+'/public'));

//jade
app.set('view engine','jade');

//views
app.set('views',__dirname+'/views');

/*==========================
 *
 *	ROUTES
 *
==========================*/

//root , home page

app.get('/',index.home);


//room , drawing area
// app.get('/room',room.gRoom);
// app.post('/room',room.pRoom);
// app.get('/usercheck',room.userCheck);
var city = '';
app.post('/chat', function(req,res){
    var type = req.body.type;
    city = req.body.city;
    req.session.body = city;
    res.redirect('/'+type);
});
app.get('/private',function(req,res){    
    if(city.length!==0){
        res.render('private',city);
    }else{
        res.send("Your city was not selected, <a href='/'>Back</a>")
    }
});
app.get('/group',function(req,res){
    if(city.length!==0){
        res.render('group',city);
    }else{
        res.send("Your city was not selected, <a href='/'>Back</a>")
    }
});


/*==========================
 *
 *	socket.io	
 *
==========================*/

io.on('connection', function(socket){
    console.log(socket.id + " Joined!");
    console.log("From " + city);
    var roomUuid = uuid.v1();
    // create a room for every 2 people that are connected
    // put people who join into a pool
    // if pool is not empty take a person from the pool and send him to latest joint person
    console.log("Room is "+roomUuid);
    socket.emit("myCity", city);
    socket.on("sendMessage", function(data){
        console.log(socket.id + " sent " + data.message )
        socket.broadcast.emit("gotMessage", data);
    });

});

/*==========================
 *
 *	LISTENING ON PORT 3000
 *
==========================*/
http.listen(port, function(){

	console.log("listening on port "+port);
});
