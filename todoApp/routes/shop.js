var router = require("express").Router(); //require는 이런 파일 가져다 쓸 거임

// router.get("/shop/shirts", (req, res) => {
//     res.send("셔츠");
// });
router.get("/shirts", (req, res) => {
    res.send("셔츠");
});
router.get("/pants", (req, res) => {
    res.send("바지");
});

module.exports = router; //자바스크립트 파일을 다른 파일에서 가져다 쓸 거임/
