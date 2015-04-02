'use strict'
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


//var userPool = [];
var rooms = [];
var connected = {};
var groups = [];
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
var name = '';
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
var username;
app.post('/createGroup', function(req,res){
    var groupName = req.body.group;
    username = req.body.username;
    res.redirect('/group/'+groupName);
});

app.get('/group/:name', function(req,res){
    name = req.param('name');
    res.render("public",name);
});

app.get('/getGroup', function(req,res){
    console.log(groups);
    res.json(groups);
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
    this.otherId = null;
}

function Group(id, name){
    this.id = id;
    this.name = name;
    this.currMembers = 1;
}

//room helper functions
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

function findIndexRoom(id){
    console.log("finding index for "+id);
    console.log("\n"+rooms.length);
    if(rooms.length === 0){
        return -1;
    }else{
        for(var i = 0; i < rooms.length; i++){
            if(rooms[i].masterId === id || rooms[i].otherId === id){
                return i;
            }
        }
        return -1;
    }
}

//group helper
function findGroup(name){
    if(groups.length === 0){
        return 0;
    }else{
        for(var i = 0; i < groups.length; i++){
            if(groups[i].name === name){
                return groups[i];
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


var pri = io.of('/private');


pri.on('connection', function(socket){

    // helper functions
    function sendTo(room, message){
        socket.broadcast.to(room).emit(message);
    }
    function sendToBoth(room, message){
        socket.emit(message);
        socket.broadcast.to(room).emit(message);
    }
    
    // create a room for every 2 people that are connected
    // put people who join into a pool
    // if pool is not empty take a person from the pool and send him to latest joint person
    //temp = new People(socket.id,city,longitude,latitude);    
    tempRoom = findRoom();
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
        tempRoom.otherId = socket.id;
        sendToBoth(tempRoom.id, "connecting");
        socket.emit("myData", {"c":city,"lo":longitude,"la":latitude,"rm":tempRoom.id});
        sendToBoth(tempRoom.id, "joint");
        connected[tempRoom.id] = [socket.id, tempRoom.masterId];
        console.log(rooms);
    }

    socket.on("sendMessage", function(data){
        socket.broadcast.to(data.rId).emit("gotMessage", data);
    });

    socket.on("disconnect", function(data){
        console.log("in disconnected");        
        // I can also do rooms = rooms.filter(function(el){ return el.id!==socket.id});, it will return rooms
        // whose id is not the s
        var index = findIndexRoom(socket.id);
        // here we are removing room
        // we could replace the master/other id with the existing id
        // and make it available
        console.log(index);
        if(index!==-1){
            if(rooms[index].available){                
                //socket.broadcast.to(rooms[index].id).emit("disconnected", "You are disconnected!");
                socket.emit("disconnected", "You are disconnected!");
                socket.leave(rooms[index].id);
                //only one guy was there
                rooms.splice(index,1);    
            }else{
                // rooms is not available so not removing the room
                socket.emit("disconnected", "You are disconnected!");
                socket.broadcast.to(rooms[index].id).emit("finding");
                socket.leave(rooms[index].id);
                rooms[index].available = true;
            }
            
        }else{
            console.log("Room already gone!");
            //socket.emit("error","Cannot remove room as index is -1");
        }
        console.log(groups);
    });
    
    console.log("Connected");
});

var tempGroup = null;
var groupUuid = 0;
var groupObj;

var pub = io.of('/public');

pub.on('connection', function(socket){

    // helper functions
    function sendTo(room, message){
        socket.broadcast.to(room).emit(message);
    }
    function sendToBoth(room, message){
        socket.emit(message);
        socket.broadcast.to(room).emit(message);
    }
    // here if name is empty
    tempGroup = findGroup(name);
    if(tempGroup === 0){        
        console.log("creating a new group")
        groupUuid = uuid.v1();
        groupObj = new Group(groupUuid, name);
        groups.push(groupObj);
        socket.join(groupObj.id);
        socket.emit("finding");
        socket.emit("myData", {"username":username,"c":city,"lo":longitude,"la":latitude,"rm":groupUuid});
    }else{
        socket.join(tempGroup.id);
        // when found a room        
        sendToBoth(tempGroup.id, "connecting");
        socket.emit("myData", {"username":username,"c":city,"lo":longitude,"la":latitude,"rm":tempGroup.id});
        sendToBoth(tempGroup.id, "joint");
        tempGroup.currMembers+=1;
        //connected[tempGroup.id] = [socket.id, tempGroup.masterId];
        console.log(groups);
    }

    socket.on("sendMessage", function(data){
        socket.broadcast.to(data.rId).emit("gotMessage", data);
    });

    socket.on("disconnect", function(data){
        console.log("in disconnected");
        console.log(index);
        var index = findIndexRoom(socket.id);
        if(index!==-1){
            socket.broadcast.to(groups[index].id).emit("disconnected", "You are disconnected!");
            socket.leave(groups[index].id);            
            groups[index].currMembers-=1;
        }else{
            console.log("Room already gone!");
            //socket.emit("error","Cannot remove room as index is -1");
        }
    });
    
    console.log("Connected");
});

/*==========================
 *
 *	LISTENING ON PORT 3000
 *
==========================*/
http.listen(port, function(){

	console.log("listening on port "+port);
});
