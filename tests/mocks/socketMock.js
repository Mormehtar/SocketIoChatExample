var sinon = require("sinon");

var SocketMock = function () {
    this.on = sinon.spy();
    this.emit = sinon.spy();
    this.join = sinon.spy();
};

module.exports = SocketMock;
