var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var config = require("./config.json");

app.use(express.static('static'));

io.on('connection', function(socket){
    console.log('a user connected');
});

http.listen(config.port || 80, function(){
    console.log('listening on *:' + (config.port || 80));
});