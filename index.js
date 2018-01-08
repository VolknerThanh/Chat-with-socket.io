// import lib
var express = require("express");

var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

//create server
var server= require("http").Server(app);
var io = require("socket.io")(server);
//create port (localhost:20120)
server.listen(20120);
console.log("server is running at '127.0.0.1:20120' ...");

/* NOTES : 
	_on là lắng nghe
	_biến socket là do server tạo ra mỗi socket để quản lý mỗi người dùng
	_socket.id (là id của mỗi người dùng khi truy cập trang web)

	_client-send-data: nội dung của client gửi lên cho server
	_server-send-data: server gửi nội dung về cho client
	_Send methods :
		+ io.sockets.emit: gửi cho TẤT CẢ client (kể cả client gửi thông tin đó)
		+ socket.emit: chỉ gửi cho client nào gửi ( client A gửi thì mỗi A nhận, B,C,D không nhận được)
		+ socket.broadcast.emit: gửi cho TẤT CẢ client trừ client gửi (A gửi thì chỉ B,C,D nhận được)
		+ io.to("socketid").emit() là server gửi riêng tới id chỉ định (dùng cho trường hợp tuong tác riêng)
*/

var ListUsers =[];

var countMsg = 0;

// server discover CONNECTION from clients
io.on("connection", function(socket){

	console.log('[ ' +  socket.id + ' ] connected to the server !');
	// server discover DISCONNECTION from clients
	socket.on("disconnect", function(){
		console.log('[ ' + socket.id + ' ] disconnected with the server !');

		// remove username from ListUsers when he/she disconnect
		ListUsers.splice(ListUsers.indexOf(socket.username), 1);

		// notice other users this user logout
		socket.broadcast.emit('server-send-ListUsers', ListUsers);
	});

	// server receive username from clinets
	socket.on('client-send-username', function(data){
		
		// check exist username !?
		if(ListUsers.indexOf(data) >= 0){
			// existed
			socket.emit('server-send-regFail');
		}
		else {
			// else, push data to the list
			ListUsers.push(data);
			// create socket.username
			socket.username = data;
			socket.emit('server-send-regSuccess', data);
			io.sockets.emit('server-send-ListUsers', ListUsers);
		}
	});

	// server listen the name of room clients sent
	socket.on('client-join-chatroom', function(data){
		// join into the room named by user
		socket.join(data);
		socket.sk_room = data;

		var ListRoom = [];

		//add room name to list
		for(var room in socket.adapter.rooms){
			ListRoom.push(room);
		}
		io.sockets.emit('server-send-listrooms', ListRoom);

		socket.emit('server-send-room-name', data);


	});


	// receive notice when someone log out
	socket.on("client-send-username-logout", function(){
		// delete username which logout from the array
		ListUsers.splice(ListUsers.indexOf(socket.username), 1);
		// notice other users this user logout
		socket.broadcast.emit('server-send-ListUsers', ListUsers);
	})

	// catch content from clients
	socket.on("client-send-data", function(data){
		// server send the catched data to all clients
		// send the JSON
		io.sockets.emit("server-send-data", {un: socket.username, contents: data } );

		// count msg
		countMsg++;
		io.sockets.emit("server-send-msgCount", countMsg);
	});

	// listen someone typing
	socket.on('client-is-typing', function(){
		var typing = socket.username + ": ...";
		io.sockets.emit('someone-is-typing', typing);
	});

	socket.on('client-stop-typing', function(){
		io.sockets.emit('someone-stops-typing');
	});
})


app.get("/", function(req,res){
	res.render("homepage");
})