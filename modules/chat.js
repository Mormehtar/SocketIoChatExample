var util = require("util");
var Users = require("./users");
var History = require("./history");

var MAIN_ROOM = "loggedIn";

function Chat (io) {
    this.io = io;
    this.users = new Users();
    this.history = new History(io.to(MAIN_ROOM));

    this.io.on("connect", this.askLogin.bind(this));
}

module.exports = Chat;

Chat.prototype.askLogin = function (socket) {
    socket.on("disconnect", this.logOut.bind(this, socket));
    socket.on("logIn", this.logIn.bind(this, socket));
    socket.emit("logIn", {text: "Введите предпочитаемое имя пользователя."});
};

Chat.prototype.logIn = function (socket, username) {
    if (!username || socket.username) { return; }
    if (!this.users.logIn(username)) {
        socket.emit("logIn", {text: util.format("Имя %s занято. Введите другое предпочитаемое имя пользователя.", username)});
        return;
    }
    socket.username = username;
    this.history.addEvent("loggedIn", {username: username, date: new Date()});
    socket.emit("loadHistory", this.history.getEvents());
    socket.emit("userList", this.users.getUserList());
    socket.on("message", this.sendMessage.bind(this, socket));
    socket.join(MAIN_ROOM);
};

Chat.prototype.sendMessage = function (socket, message) {
    this.history.addEvent(
        "message",
        {
            date: new Date(),
            username: socket.username,
            message: message
        }
    );
};

Chat.prototype.logOut = function (socket) {
    this.history.addEvent(
        "loggedOut",
        {
            date: new Date(),
            username: socket.username
        }
    );
    this.users.logOut(socket.username);
};