var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var url = require('url');
var fs = require('fs');
var xml2js = require('xml2js');
var xmlwriter = require('xml-writer');

app.get('/',function(req,res){
	res.sendFile(__dirname+'/index.html');
});

var username;


app.get('/chat',function(req,res){
	username=url.parse(req.url,true).query.username;
	res.sendFile(__dirname+'/chat_GUI.html');
});

var userlist=new Map();


io.on('connection',function(socket){
	console.log('new user '+username);
	userlist[socket.id]=username;
	socket.on('msg',function(data){
		console.log(userlist[socket.id]+' '+data);
		io.emit('msg',userlist[socket.id],data);
	});
});


http.listen(80,function(){
	console.log('listening on *:80. . .');
});