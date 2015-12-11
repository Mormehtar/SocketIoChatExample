var sinon = require("sinon");

var IOMock = function () {
    this.on = sinon.spy();
    this.emit = sinon.spy();
    this.rooms = {};
    this.to = function (room) {
        if (!this.rooms[room]) { this.rooms[room] = new IOMock(); }
        return this.rooms[room];
    };
    sinon.spy(this, "to");
};

module.exports = IOMock;