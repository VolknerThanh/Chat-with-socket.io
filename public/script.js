// call from this client to server
var socket = io("http://localhost:20120");

// client listen contents from server
socket.on("server-send-data", function(data){
	var addLine = "<tr id='this_row'><td id='td_username'><h4 id='UserID'>"+ data.un +" : </h4></td><td id='td_content'><div id='msgContainer'><p id='msgContents'>" + data.contents + "</p></div></td></tr>";
	$("#msg").append(addLine);
	var thisDiv = document.getElementById('listMsg');
	thisDiv.scrollTop = thisDiv.scrollHeight;
});

// client action when Sign up fail
socket.on("server-send-regFail", function(){
	alert('username has been using by another user !');
});

// client action when Sign up success
socket.on("server-send-regSuccess", function(data){
	$('.Username').html(data);
	// show chat box
	$('.chat-form').show(1000);
	$('#SignUpBox').hide(1000);
});

// send to all clients an users online array
socket.on('server-send-ListUsers', function(data){
	// clear content
	$('.ListUsers').html("");
	// load array by 'foreach'
	data.forEach( function(i) {
		// add new line of online users
		var str = "<li class='User'>" + i + "</li>";
		$('.ListUsers').append(str);
	});
});

// send to all clients an group array
socket.on('server-send-listrooms', function(data){
	$('.ListGroups').html("");
	data.forEach(function(i){
		if(i.length <= 10 && i.length > 0){
			var roomname = "<div class='Room'><a> - " + i + "</a></div>";
			$('.ListGroups').append(roomname);
		}
	});
});

// display group name
socket.on('server-send-room-name', function(data){
	$('.RoomName').html(data);
});

// listening someone is typing
socket.on('someone-is-typing', function(data){
	$(".typing").html(data);
});

socket.on('someone-stops-typing', function(){
	$(".typing").html("");
});

socket.on('server-send-msgCount', function(data){
	$('#count').html(data);
});

// send text content when click button 'send'
function SendData(){
	var txt = document.getElementById('textfield').value;
	socket.emit("client-send-data", txt);
	document.getElementById('textfield').value = null;
}

$(document).ready(function() {
	
	$('.btn-signup').click(function(){
		if($('#SignUp').val() == "" || $('#SignUp').val() == null)
			alert('Please enter username !');
		else {
		// client send the username to server
		socket.emit("client-send-username", $('#SignUp').val() );
		}
	});

	//log out user
	$('.btn-LogOut').click(function() {
		socket.emit('client-send-username-logout');
		$('.chat-form').hide();
		$('#SignUpBox').show();
	});

	// Click to JOIN chat room
	$('.btn-CreateGroup').click(function() {
		socket.emit('client-join-chatroom', $('#group-txt').val());
		document.getElementById('group-txt').value = "";
	});

	// Click event
	$('.btn-send').click(function() {
		SendData();
	});

	// Typing effect
	$('#textfield').focusin(function(event) {
		socket.emit("client-is-typing");
	});

	$('#textfield').focusout(function(event) {
		socket.emit('client-stop-typing');
	});
});