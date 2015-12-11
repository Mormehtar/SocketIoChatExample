function History (chatRoom) {
    this.history = [];
    this.chatRoom = chatRoom;
}

module.exports = History;

History.prototype.addEvent = function (type, data) {
    this.history.push({type: type, data: data});
    this.chatRoom.emit(type, data);
};

History.prototype.getEvents = function () {
    return this.history;
};