const express = require("express");
const app = express();
//HTML 데이터를 해석할 수 있음.
const methodOverride = require("method-override");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
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
    db.collection("counter").findOne({ name: "게시물갯수" }, (err, result) => {
        const { totalPost } = result;
        const data = {
            _id: totalPost,
            title: req.body.title,
            date: req.body.date,
        };
        db.collection("post").insertOne(data, (err, result) => {
            console.log(err || result);
            // 하나는 updateOne, 여러 개는 updateMany 수정 값은 operater($set) 써야 함.
            // set: 아예 바꿔주세요 연산자
            // inc: 증가시켜주세요
            db.collection("counter").updateOne(
                { name: "게시물갯수" },
                // { $set: { totalPost: totalPost + 1 } },
                { $inc: { totalPost: 1 } },
                (err, result) => {
                    console.log(err || result);
                }
            );
        });
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

app.delete("/delete", (req, res) => {
    // parseInt로 하던 숫자로 변환해야 됨.
    console.log(req.body);
    const _id = +req.body._id;
    db.collection("post").deleteOne({ _id }, (err, result) => {
        console.log(err || result);
        //이렇게만 하면 삭제만 돼서 목록은 그대로 남아 있음.
        //성공인지 실패인지 알려줘야 함.
        res.status(200).send({ message: "성공했습니다." });
    });
});

// detail 접속 시 보여줌. :이란 기호를 붙이면 이걸 인자로 보내줌.
app.get("/detail/:id", (req, res) => {
    //url 파라미터 중 id 값 얻기: req.params.id string으로 되므로 형변환 해주기
    db.collection("post").findOne({ _id: +req.params.id }, (err, result) => {
        console.log(err || result);
        res.render("detail.ejs", { data: result });
    });
});

app.get("/edit/:id", (req, res) => {
    //params는 기본적으로 문자
    db.collection("post").findOne({ _id: +req.params.id }, (err, result) => {
        console.log(err || result);
        res.render("edit.ejs", { data: result });
    });
});

app.post("/edit/:id", function (req, res) {
    console.log(req);
    db.collection("post").updateOne(
        { _id: +req.params.id },
        { $set: { title: req.body.title, date: req.body.date } },
        (err, result) => {
            console.log(err || result);
            res.send("전송완료");
        }
    );
});
app.put("/edit/:id", (req, res) => {
    console.log(req);
    db.collection("post").updateOne(
        { _id: +req.params.id },
        { $set: { title: req.body.title, date: req.body.date } },
        (err, result) => {
            console.log(err || result);
            //목록으로 가서 수정된 거 확인
            res.redirect("/list");
        }
    );
});

/*
    회원 인증
    1. session-based
        1) 로그인 하면 서버에서 쿠키를 보내줌.
        2) 브라우저는 쿠키를 저장
        - 사용자가 로그인했다는 정보를 서버에 다 저장함.
    2. token-based; JWT
        1) 로그인하면 서버에서 웹 토근 발행(json web token, 긴 문자열)
        2) 브라우저는 토큰을 저장
        - 웹토큰을 헤더에 전송을 해서 서버는 토큰을 검증함.
        - 사용자의 로그인 상태를 저장할 필요 없음.
    3. OAuth 사용자의 프로필 정보를 가져 옴.
        1) 로그인하면, 사이트의 팝업이 뜸.
        2) 소셜 아이디를 통해 서버에 정송해서 서버에서 토큰이나 뭐나 발행함.
        - 서버는 비밀번호를 다룰 필요 없음.
*/
/*
    - 세션 방식 로그인 구현
    1. 라이브러리 설치; passport, passport-local, express-session
*/

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
// 세션만들때 비밀 코드를 secret에 입력
app.use(session({ secret: "1234", resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", (req, resp) => {
    resp.render("login.ejs");
});

//
app.post(
    "/login",
    passport.authenticate("local", {
        //로그인 실패하면 이 경로로 이동시켜줘
        failureRedirect: "/fail",
    }),
    (req, resp) => {
        resp.redirect("/");
    }
);

passport.use(
    new LocalStrategy(
        {
            usernameField: "id",
            passwordField: "pw",
            session: true,
            passReqToCallback: false,
        },
        (id, pw, done) => {
            db.collection("login").findOne({ id: id }, (err, result) => {
                if (err) {
                    // done(서버에러, 성공사용자 데이터, )
                    return done(err);
                }
                if (!result) {
                    return done(null, false, {
                        message: "존재하지 않는 아이디",
                    });
                }
                if (id === result.pw) {
                    //serializeUser의 USER 인자에 들어감.
                    return done(null, result);
                } else {
                    return done(null, false, { message: "비번 틀림." });
                }
            });
        }
    )
);

//세선 저장 로그인 성공시
passport.serializeUser((user, done) => {
    done(null, user.id);
});

//나중에 호출 됨. 마이페이지 접속할 때
passport.deserializeUser((id, done) => {
    done(null, {});
});
