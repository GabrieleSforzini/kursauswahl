var express = require('express');
var router = express.Router();
var {restrict, validate, sessionUser, endSession} = require("../src/auth");
var db = require("../src/db");

router.get("/", (req, res, next) => {
    res.redirect("/login");
})

router.get('/login', function(req, res, next) {
    let user = sessionUser(req);
    res.clearCookie("lwrong", {sameSite: "strict"});
    if (user !== undefined) {
        res.redirect("/dashboard");
    }
    else {
        res.render('login', { title: 'Kursauswahl: Login', cwrong: ("lwrong" in req.cookies)});
    }
});

router.post("/login", async (req, res, next) => {
    var username = req.body.uname;
    var pwd = req.body.pwd;
    let sid = await validate(username, pwd);
    if (sid == undefined) {
        // Return error page
        res.cookie("lwrong", "true", {maxAge: 1000*10, sameSite: "strict"});
        res.redirect("/login");
    }
    else {
        console.log("User %s logged in", username);
        res.cookie("secret", sid, {maxAge: 43200000, sameSite: "strict", httpOnly: "true", secure: true});
        res.redirect("/dashboard");
    }
});

router.get("/logout", restrict("user"), (req, res, next) => {
    endSession(req);
    res.clearCookie("secret");
    res.redirect("/login");
});

router.get('/make_selection', restrict("user"), function(req, res, next) {
    var selectables = [{name: "Deutsch", id: "DE", h: "4"}, {name: "Italienisch", id: "IT", h: 4}];
    res.render('selection', { title: 'Kursauswahl: Auswahl', selectables});
});

router.post("/make_selection", restrict("user"), (req, res, next) => {
    res.send("Unimplemented");
    res.status(501);
});

router.get('/students', restrict("admin"), async function(req, res, next) {
    let users = (await db.query("SELECT username FROM userdata")).rows.map((val) => val["username"]);
    res.render('students', { title: 'Kursauswahl: User' , users});
});

router.get("/dashboard", restrict("user"), async function(req, res, next) {
    let user = sessionUser(req);
    res.render("dashboard", { title: "Dashboard" , show_admin: user[2]});
})

module.exports = router;
