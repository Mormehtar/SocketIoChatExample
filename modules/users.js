function Users () {
    this.users = {};
}

module.exports = Users;

Users.prototype.logIn = function (username) {
    if (this.users[username]) {
        return false;
    }
    return this.users[username] = true;
};

Users.prototype.logOut = function (username) {
    delete this.users[username];
};

Users.prototype.getUserList = function () {
    return Object.keys(this.users).sort();
};