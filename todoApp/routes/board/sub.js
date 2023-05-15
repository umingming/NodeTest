var router = require("express").Router();
// router.use(isLoggedin); // 따로 안 적어도 됨
router.use(["/sports", "/game"], isLoggedin); // 원하는 라우트에만 설정 가능
//미들웨어 사용 가능
// router.get("/sports", isLoggedin, (req, res) => {
//     res.send("스포츠");
// });
router.get("/sports", (req, res) => {
    res.send("스포츠");
});
router.get("/game", (req, res) => {
    res.send("게임");
});

module.exports = router;

function isLoggedin(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.send("로그인 안 하셨는데요?");
    }
}
