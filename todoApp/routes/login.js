var router = require("express").Router();
var passport = require("passport");

router.get("/login", (req, resp) => {
    resp.render("login.ejs");
});

//
router.post(
    "/login",
    passport.authenticate("local", {
        //로그인 실패하면 이 경로로 이동시켜줘
        failureFlash: true,
        failureRedirect: "/fail",
    }),
    (req, resp) => {
        resp.redirect("/");
    }
);
module.exports = router;
