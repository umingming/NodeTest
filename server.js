const express = require("express");
const app = express();
//HTML 데이터를 해석할 수 있음.
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const MongoClient = require("mongodb").MongoClient;
var db;
MongoClient.connect(
    "mongodb+srv://u13040035:java1234@cluster0.rrl2jwu.mongodb.net/?retryWrites=true&w=majority",
    function (err, client) {
        //node server.js 로 서버 켰을 떄, 해당 콘솔 띄워줌.
        if (err) return console.log(err);
        db = client.db("todoapp");
        db.collection("post").insertOne(
            { 이름: "John", 나이: 20 },
            (err, result) => {
                console.log(err || result);
            }
        );
        app.listen(8080, () => {
            console.log(client);
        });
    }
);

// 누군가가 /pet path 입력하면 해당 안내문을 띄워줌.
app.get("/pet", (req, res) => {
    res.send("펫용품");
});
// /하나만 쓰면 홈임.
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.get("/write", (req, res) => {
    res.sendFile(__dirname + "/write.html");
});
// /add로 post 요청 하면...
app.post("/add", function (req, res) {
    res.send("전송완료");
    db.collection("post").insertOne(req.body, (err, result) => {
        console.log(err || result);
    });
});
/*
    restAPI란? 
    1. Unifrom interface
        - 하나의 자료는 하나의 URL로
        - URL은 예측 가능해야 함. (/products/66523)
    2. client-server 역할 구분
    3. Stateless
        - 요청1과 요청2는 의존성이 없어야 함.
    4. Cacheable (캐싱이 가능해야 함)
    5. Layered System
    6. Code on demand
*/

//list 목록 보여주기 실제 db 저장 데이터 바탕
app.get("/list", (req, res) => {
    //저장된 모든 데이터 가져올 수 있음.
    db.collection("post")
        .find()
        .toArray((err, result) => {
            console.log(err || result);
            res.render("list.ejs", { posts: result });
        });
});
