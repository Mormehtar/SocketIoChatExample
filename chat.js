var util = require("util");

function Chat (io) {
    this.io = io;
    this.messages = [];
    this.users = {};
}

module.exports = Chat;

Chat.prototype.init = function() {
    this.io.on("connect", this.askLogin.bind(this));
    this.io.on("disconnect", this.logOut.bind(this));
};

Chat.prototype.askLogin = function (socket) {
    socket.on("login", this.logIn.bind(this, socket));
    socket.emit("login", {text: "Введите предпочитаемое имя пользователя."});
};

Chat.prototype.logIn = function (socket, username) {
    if (this.users[username]) {
        socket.emit("login", {text: util.format("Имя %s занято. Введите другое предпочитаемое имя пользователя.", username)});
        return;
    }
    this.users[username] = socket;
    socket.username = username;
    var loginObject = {username: username, date: new Date()};
    socket.broadcast.emit("loggedIn", loginObject);
    this.history.push({type: "loggedIn", data: loginObject});
    socket.emit("loadHistory", this.history);
    socket.on("message", this.sendMessage.bind(this, socket));
};

Chat.prototype.sendMessage = function (socket, message) {
    var messageObject = {
        date: new Date(),
        username: socket.username,
        message: message
    };
    this.history.push({type: "message", data: messageObject});
    socket.broadcast.emit("message", messageObject);
};

Chat.prototype.logOut = function (socket) {
    var logOutObject = {
        date: new Date(),
        username: socket.username
    };
    this.history.push({type:"loggedOut", data: logOutObject});
    delete this.users[socket.username];
    socket.broadcast.emit("loggedOut", logOutObject);
};