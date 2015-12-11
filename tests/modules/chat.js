// TODO: cover Chat methods with spies and check handlers

var assert = require("chai").assert;
var sinon = require("sinon");

var IOMock = require("../mocks/ioMock");
var SocketMock = require("../mocks/socketMock");

var Chat = require("../../modules/chat");

describe("Chat", function () {

    it("Should expose chat object constructor", function () {
        assert.isFunction(Chat);
    });

    it("Should create chat object", function () {
        var ioMock = new IOMock();

        var chat = new Chat(ioMock);
        assert.instanceOf(chat, Chat);
        assert.ok(ioMock.on.calledOnce);

        assert.equal(ioMock.on.firstCall.args[0], "connect");
        assert.isFunction(ioMock.on.firstCall.args[1]);

        assert.ok(ioMock.to.calledOnce);
        assert.ok(ioMock.rooms["loggedIn"]);
    });

    describe("Methods", function () {

        describe("askLogin", function () {
            var ioMock = new IOMock();
            var socketMock = new SocketMock();
            var chat = new Chat(ioMock);

            chat.askLogin(socketMock);

            it("Should make handlers for disconnect and logIn", function () {
                assert.ok(socketMock.on.calledTwice);
                var events = socketMock.on.args.map(function (args) {
                    return args[0];
                });
                assert.sameMembers(events, ["disconnect", "logIn"]);
            });

            it("Should emit message for login", function () {
                assert.ok(socketMock.emit.calledOnce);
                assert.deepEqual(socketMock.emit.firstCall.args, ["logIn", {text: "Введите предпочитаемое имя пользователя."}]);
            });
        });

        describe("logIn", function () {
            it ("Should not modify socket on no name", function () {
                var ioMock = new IOMock();
                var socketMock = new SocketMock();
                var chat = new Chat(ioMock);
                chat.logIn(socketMock, "");
                assert.isUndefined(socketMock.username);
            });

            describe("Main scenario", function () {
                var ioMock = new IOMock();
                var socketMock = new SocketMock();
                var chat = new Chat(ioMock);

                chat.logIn(socketMock, "SomeUsername");

                it("Should login user", function () {
                    assert.sameMembers(chat.users.getUserList(), ["SomeUsername"]);
                });

                it("Should log login event", function () {
                    assert.equal(chat.history.getEvents()[0].type, "loggedIn");
                    assert.equal(chat.history.getEvents()[0].data.username, "SomeUsername");
                });

                it("Should save username to socket", function () {
                    assert.equal(socketMock.username, "SomeUsername");
                });

                it("Should emit history and users list", function () {
                    assert.ok(socketMock.emit.calledTwice);
                    var events = socketMock.emit.args.map(function (args) {
                        return [args[0], args[1][0].type || args[1]];
                    });
                    assert.sameDeepMembers(events, [["loadHistory", "loggedIn"], ["userList", ["SomeUsername"]]]);
                });

                it("Should make handler for messages", function () {
                    assert.ok(socketMock.on.calledOnce);
                    assert.equal(socketMock.on.firstCall.args[0], "message");
                });

                it("Should join room Logged In", function () {
                    assert.ok(socketMock.join.calledOnce);
                    assert.sameMembers(socketMock.join.firstCall.args, ["loggedIn"]);
                });
            });

            describe("Username already used", function () {
                var ioMock = new IOMock();
                var socketMock = new SocketMock();
                var socketMock2 = new SocketMock();
                var chat = new Chat(ioMock);

                chat.logIn(socketMock, "SomeUsername");
                chat.logIn(socketMock2, "SomeUsername");

                it("Should not modify socket username", function () {
                    assert.isUndefined(socketMock2.username);
                });

                it("Should emit demand of relogin", function () {
                    assert.ok(socketMock2.emit.calledOnce);
                    assert.deepEqual(socketMock2.emit.firstCall.args, ["logIn", {text: "Имя SomeUsername занято. Введите другое предпочитаемое имя пользователя."}])
                });
            });
        });

        //TODO test sendMessage

        //TODO test logOut

    });
});
