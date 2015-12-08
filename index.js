var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var config = require("./config.json");
var Chat = require("chat");

app.use(express.static('static'));

app.set("config", config);
app.set("chat", new Chat(io));

Chat.init();

http.listen(config.port || 80, function(){
    console.log('listening on *:' + (config.port || 80));
});