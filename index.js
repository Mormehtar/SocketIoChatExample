var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var Chat = require("./modules/chat");

app.use(express.static('static'));

app.set("chat", new Chat(io));

http.listen(process.env.PORT || 5000, function(){
    console.log('listening on *:' + (process.env.PORT || 5000));
});