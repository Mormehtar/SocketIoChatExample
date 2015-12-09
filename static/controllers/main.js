var socket = io();

function logInButtonHandler () {
    var dialogContainer = document.getElementsByClassName("main_dialog_container")[0];
    var text = dialogContainer.getElementsByClassName("log_in_input")[0].value;
    dialogContainer.parentElement.removeChild(dialogContainer);
    socket.emit("logIn", text);
}

var messagesContainer = document.getElementById("messages_container");
var usernamesContainer = document.getElementById("user_list");

function createUserNameElement (username) {
    var span = document.createElement("span");
    span.className = "username";
    span.name = username;
    span.appendChild(document.createTextNode(username));
    return span;
}

function userMove(dataObject, actionText) {
    var time = document.createElement("span");
    time.className = "message_time";
    time.appendChild(document.createTextNode(new Date(dataObject.date).toLocaleString()));
    var username = createUserNameElement(dataObject.username);
    var text = document.createElement("span");
    text.appendChild(document.createTextNode(": " + actionText + " "));
    var container = document.createElement("div");
    container.className = "message_container";
    container.appendChild(time);
    container.appendChild(text);
    container.appendChild(username);
    return container;
}
var actions = {
    logIn: function (dataObject) {
        var background = document.createElement("div");
        background.className = "dialog_background";

        var dialogContainer = document.createElement("div");
        dialogContainer.className = "dialog_container";

        var text = document.createElement("div");
        text.className = "log_in_text";
        text.appendChild(document.createTextNode(dataObject.text));

        var input = document.createElement("input");
        input.type = "text";
        input.className = "log_in_input";

        var button = document.createElement("button");
        button.className = "log_in_button";
        button.appendChild(document.createTextNode("OK"));
        button.addEventListener("click", logInButtonHandler);

        dialogContainer.appendChild(text);
        dialogContainer.appendChild(input);
        dialogContainer.appendChild(button);

        var mainContainer = document.createElement("div");
        mainContainer.className = "main_dialog_container";
        mainContainer.appendChild(background);
        mainContainer.appendChild(dialogContainer);

        document.body.appendChild(mainContainer);
    },
    loggedIn: function (dataObject, history) {
        var container = userMove(dataObject, "в комнату вошёл");
        if (history) {
            return container;
        }
        messagesContainer.appendChild(container);
        var usernameContainer = document.createElement("div");
        usernameContainer.className = "username_list";
        usernameContainer.appendChild(createUserNameElement(dataObject.username));
        var elementFound = false;
        for (var i=0; i < usernamesContainer.children.length; ++i) {
            var element = usernamesContainer.children[i];
            if (element.firstChild.textContent > dataObject.username) {
                usernamesContainer.insertBefore(usernameContainer, element);
                elementFound = true;
                break;
            }
        }
        if (!elementFound) {
            usernamesContainer.appendChild(usernameContainer);
        }
    },
    loggedOut: function (dataObject, history) {
        var container = userMove(dataObject, "из комнаты вышел");
        if (history) {
            return container;
        }
        messagesContainer.appendChild(container);
        var usernameContainer = usernamesContainer.getElementsByName(dataObject.username)[0];
        if (usernameContainer) {usernamesContainer.removeChild(usernameContainer);}
    },
    message: function (dataObject) {},
    loadHistory: function (dataObject) {},
    userList: function (dataObject) {}
};

Object.keys(actions).forEach(function (action) {
    socket.on(action, actions[action]);
});

