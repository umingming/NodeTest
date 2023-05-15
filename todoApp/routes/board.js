var router = require("express").Router();
router.use("/sub", require("./board/sub"));
module.exports = router;
