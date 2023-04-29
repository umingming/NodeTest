const express = require("express");
const app = express();

//node server.js 로 서버 켰을 떄, 해당 콘솔 띄워줌.
app.listen(8080, () => {
    console.log("listening on 8080");
});

// 누군가가 /pet path 입력하면 해당 안내문을 띄워줌.
app.get("/pet", (req, res) => {
    res.send("펫용품");
});
// /하나만 쓰면 홈임.
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
