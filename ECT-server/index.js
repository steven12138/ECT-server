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

var olnum=0;

io.on('connection',function(socket){
	console.log('new user '+username);
	olnum+=1;
	io.emit('online',olnum);
	socket.on('username',function(data){
		username=data;
		userlist[socket.id]=username;
	});
	socket.on('msg',function(user,data1){
		console.log(user+' '+data1);

		io.emit('msg',user,data1);
		fs.readFile(__dirname+'/msglog.json','utf8',function(err,data){
			if(err){
				console.error(err);
			}	
			//console.log('msg:   '+data1);
			var list=JSON.parse(data);
			list.data.push({
				"username":user,
				"msg":data1
			});
			if(list.data.length>300){
				list.data.splice(0,1);
			}
			//console.log(list.data);
			var str=JSON.stringify(list);
			fs.writeFile(__dirname+'/msglog.json',str,'utf8',function(error){if(error){console.error(error);}});
		});
	});
	socket.on('get_msg_list',function(){
		fs.readFile(__dirname+'/msglog.json','utf8',function(err,data){
			if(err){
				console.error(err);
			}
			io.to(socket.id).emit('msg_list',data);
        });
	});
	socket.on('disconnect',function(){
		olnum-=1;
		console.log('disconnect');
		io.emit('online',olnum);
	});
});


http.listen(80,function(){
	console.log('listening on *:80. . .');
});