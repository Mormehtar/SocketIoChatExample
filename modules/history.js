function History (chatRoom) {
    this.history = [];
    this.chatRoom = chatRoom;
}

module.exports = History;

History.prototype.addEvent = function (type, data) {
    this.history.push({type: type, data: data});
    this.chatRoom.emit("loggedIn", loginObject);
};

History.prototype.getEvents = function () {
    return this.history;
};