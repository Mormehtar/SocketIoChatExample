var socket = io();

var messageBox = document.getElementById("message_box");
var messagesContainer = document.getElementById("messages_container");
var usernamesContainer = document.getElementById("user_list");

function logInButtonHandler () {
    var dialogContainer = document.getElementsByClassName("main_dialog_container")[0];
    var text = dialogContainer.getElementsByClassName("log_in_input")[0].value;
    dialogContainer.parentElement.removeChild(dialogContainer);
    socket.emit("logIn", text);
}

function sendMessage () {
    var text = messageBox.value;
    messageBox.value = "";
    socket.emit("message", text);
}


function cleanupNode (node) {
    while (node.lastChild) {
        node.removeChild(node.lastChild);
    }
}

function createUserNameElement (username) {
    var span = document.createElement("span");
    span.className = "username";
    span.setAttribute("name", username);
    span.appendChild(document.createTextNode(username));
    return span;
}

function userDescribe(dataObject, actionText) {
    var time = document.createElement("span");
    time.className = "message_time";
    time.appendChild(document.createTextNode(new Date(dataObject.date).toLocaleString()));
    var username = createUserNameElement(dataObject.username);

    var text = document.createElement("span");
    text.appendChild(document.createTextNode(actionText ? ": " + actionText + " " : " "));

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

        cleanupNode(messagesContainer);
        cleanupNode(usernamesContainer);

        document.body.appendChild(mainContainer);
    },
    loggedIn: function (dataObject, history) {
        var container = userDescribe(dataObject, "в комнату вошёл");
        container.className += " system_message";
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
        var container = userDescribe(dataObject, "из комнаты вышел");
        container.className += " system_message";
        if (history) {
            return container;
        }
        messagesContainer.appendChild(container);
        var usernameContainer = usernamesContainer.querySelector("[name=" + dataObject.username + "]").parentNode;
        if (usernameContainer) {usernamesContainer.removeChild(usernameContainer);}
    },
    message: function (dataObject, history) {
        var container = userDescribe(dataObject);
        var text = document.createElement("span");
        text.appendChild(document.createTextNode(": " + dataObject.message));
        container.appendChild(text);
        if (history) { return container; }
        messagesContainer.appendChild(container);
    },
    loadHistory: function (dataObject) {
        var container = document.createDocumentFragment();
        dataObject.forEach(function (historyItem) {
            container.appendChild(actions[historyItem.type](historyItem.data, true));
        });
        cleanupNode(messagesContainer);
        messagesContainer.appendChild(container);
    },
    userList: function (dataObject) {
        var container = document.createDocumentFragment();
        dataObject.forEach(function (username) {
            var usernameContainer = document.createElement("div");
            usernameContainer.className = "username_list";
            usernameContainer.appendChild(createUserNameElement(username));
            container.appendChild(usernameContainer);
        });
        cleanupNode(usernamesContainer);
        usernamesContainer.appendChild(container);
    }
};

Object.keys(actions).forEach(function (action) {
    socket.on(action, function (dataObject) {console.log(action, dataObject); actions[action](dataObject)});
});

