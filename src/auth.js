//Authentification module

var db = require("./db_manage");
var crypto = require("crypto");
var Tokens = require("csrf");
var tokens = new Tokens();

var sessions = {};

function sessionUser(req) {
    if (!("secret" in req.cookies)) {return undefined;}
    var secret = req.cookies["secret"];
    if (secret.length != 16) {return undefined;}
    return sessions[secret];
}

/**
 * Restricts acces to page to users depending on level
 * @param {String} level Entweder "all", "user" oder "admin"
 */
function restrict(level, with_csrf_token=false) {
    return function(req, res, next) {
        let user = sessionUser(req)
        let valid_user = user !== undefined
        if (!valid_user) {res.redirect("/login");return}
        res.locals.user = user
        let authorized_user = (level !== "admin" || user.isadmin)
        let token_valid = tokens.verify(user.csrf_secret, req.body._csrf)
        if (!authorized_user) {
            res.redirect("/login")
        }
        else if (with_csrf_token && !token_valid) {
            res.status(401)
            res.send("Failed to validate csrf token");
        }
        else {
            next()
        }
    };
}

/**
 * Validates user credentials and returns a session id if correct | **expensive**
 * @param {String} username 
 * @param {String} pwd 
 * @returns {Promise<String>} Session id
 */
async function createSession(username, pwd) {
    if (username.length > 50) {return undefined;}
    var user = await db.user_by_name(username);
    if (user === undefined) {return undefined;}
    var hash = pwdhash(pwd, user.salt);
    if (crypto.timingSafeEqual(hash, Buffer.from(user.pwd, "base64"))) {
        let session_id = crypto.randomBytes(8).toString("hex");
        let csrf_secret = await tokens.secret();
        sessions[session_id] = {uname: username, uid: user.userid, isadmin: user.isadmin, csrf_secret};
        return session_id;
    }
    return undefined;
}

function endSession(req) {
    var secret = req.cookies["secret"];
    if (secret in sessions) {
        delete sessions[secret];
    }
}

/**
 * Compute a 60 char hash from a password and a salt
 * @param {String} pwd 
 * @param {String} salt 
 * @returns 60 char hash buffer
 */
function pwdhash(pwd, salt) {
    return crypto.pbkdf2Sync(pwd, salt, 100000, 45, "sha512");
}

module.exports = {restrict, createSession, pwdhash, sessionUser, endSession, tokens};