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


var userPool = [];
var rooms = [];
var connected = [];
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
var longitude = '';
var latitude = '';
app.post('/chat', function(req,res){
    var type = req.body.type;
    city = req.body.city;
    longitude = req.body.longitude;
    latitude = req.body.latitude;
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

//Constructor Functions

function People(id,city,lo,la){
    this.id = id;
    this.city = city;
    this.lo = lo;
    this.la = la;
}

function Room(id, masterId, available){
    this.id = id;
    this.masterId = masterId;
    this.available = available;
}

//helper functions
function findRoom(){
    if(rooms.length === 0){
        return 0;
    }else{
        for(var i = 0; i < rooms.length; i++){
            if(rooms[i].available){
                return rooms[i];
            }
        }
        return 0;
    }
}

/*==========================
 *
 *	socket.io	
 *
==========================*/



var roomUuid = 0;
var tempPerson = null;
var tempRoom = null;
var roomObj;
io.on('connection', function(socket){
    function sendTo(room, message){
        socket.broadcast.to(room).emit(message);
    }
    function sendToBoth(room, message){
        io.sockets.in(room).emit(message);
    }
    console.log(socket.id + " Joined!");
    console.log("From " + city);
    // create a room for every 2 people that are connected
    // put people who join into a pool
    // if pool is not empty take a person from the pool and send him to latest joint person
    console.log("Room is "+roomUuid);
    temp = new People(socket.id,city,longitude,latitude);
    userPool.push(temp);
    tempRoom = findRoom();
    console.log("tempRoom "+tempRoom);
    if(tempRoom === 0){
        // when odd no. of users, create a room as no room is available
        console.log("creating a new room")
        roomUuid = uuid.v1();
        roomObj = new Room(roomUuid, socket.id, true);
        rooms.push(roomObj);
        socket.join(roomObj.id);
        socket.emit("finding");
        socket.emit("myData", {"c":city,"lo":longitude,"la":latitude,"rm":roomUuid});
    }else{        
        socket.join(tempRoom.id);
        // when found a room
        tempRoom.available = false;
        sendToBoth(tempRoom.id, "connecting");
        socket.emit("myData", {"c":city,"lo":longitude,"la":latitude,"rm":tempRoom.id});
        sendToBoth(tempRoom.id, "joint");
    }

    //userPool[roomUuid] = [];
    //userPool[roomUuid].push({"id":socket.id,"c":city,"lo":longitude,"la":latitude});    
    socket.on("sendMessage", function(data){
        console.log(socket.id + " sent " + data.message);
        socket.broadcast.to(data.rId).emit("gotMessage", data);
    });
    console.log(rooms);
    console.log(userPool);
});

/*==========================
 *
 *	LISTENING ON PORT 3000
 *
==========================*/
http.listen(port, function(){

	console.log("listening on port "+port);
});
