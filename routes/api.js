var express = require('express');
var router = express.Router();
var {restrict, sessionUser} = require("../src/auth");
var db = require("../src/db_manage");
var {newUser} = require("../src/users");
var subjects = require("../src/subject_selection");

router.post("/ping", (req, res, next) => {
    res.send("pong");
});

router.get("/selection", restrict("user"), async (req, res, next) => {
    var user = sessionUser(req);
    var uid = parseInt(req.query.uid);
    if (!user.isadmin && user.uid != uid) {res.status(504);res.end();return;}
    var qres = (await db.get_selection(uid));
    if (qres === undefined) {res.send("Not found");return;}
    let ans = {selected: []};
    subjects.subject_ordered.forEach(sub => {
        if (qres[sub]) {
            ans.selected.push(sub);
        }
    });
    res.send(ans);
});

module.exports = router;
