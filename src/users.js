//User creation and deletion
var db = require("./db_manage");
var {pwdhash} = require("./auth");
var crypto = require("crypto");

async function newUser(name, pwd, isadmin) {
    var salt = crypto.randomBytes(45).toString("base64");
    var pwd_hash = pwdhash(pwd, salt).toString("base64");
    return await db.register(name, isadmin, pwd_hash, salt);
}

module.exports = {newUser};