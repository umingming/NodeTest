const express = require("express");
const app = express();
//HTML 데이터를 해석할 수 있음.
const methodOverride = require("method-override");
const cors = require("cors");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(cors());
require("dotenv").config();

const MongoClient = require("mongodb").MongoClient;
var db;
MongoClient.connect(process.env.DB_URL, function (err, client) {
    if (err) return console.log(err);

    db = client.db("todoapp");
    console.log("Connected to database");

    const loginRouter = require("./routes/login");
    app.use("/api", loginRouter);

    app.listen(process.env.PORT, () => {
        console.log("Server is running on port", process.env.PORT);
    });
});

// 누군가가 /pet path 입력하면 해당 안내문을 띄워줌.
app.get("/pet", (req, res) => {
    res.send("펫용품");
});
// /하나만 쓰면 홈임.
app.get("/write", (req, res) => {
    res.sendFile(__dirname + "/write.html");
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
const flash = require("express-flash");
// 세션만들때 비밀 코드를 secret에 입력
app.use(session({ secret: "1234", resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use(
    new LocalStrategy(
        {
            usernameField: "id",
            passwordField: "pw",
            session: true,
            passReqToCallback: false,
        },
        (id, pw, done) => {
            console.log(id, pw);
            db.collection("login").findOne({ id: id }, (err, result) => {
                if (err) return done(err);

                if (!result) {
                    const message = "유효하지 않은 아이디";
                    console.log("로그인 실패:", message);
                    return done(null, false, { message });
                } else if (pw !== result.pw) {
                    const message = "유효하지 않은 비밀번호";
                    console.log("로그인 실패:", message);
                    return done(null, false, { message });
                }

                console.log("로그인 성공");
                return done(null, result);
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
    db.collection("login").findOne({ id: id }, (err, result) => {
        done(null, result);
    });
});

//미들웨더는 가운데에 넣으면 됨.
app.get("/mypage", isLoggedin, (req, res) => {
    //짱신기.... DeserializeUser로 찾은 정보
    const { user } = req;
    res.render("mypage.ejs", { user });
});

//마이페이지 접속 전 실행할 미들웨어
function isLoggedin(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.send("로그인 안 하셨는데요?");
    }
}

app.get("/search", (req, res) => {
    //입력한 검색어 꺼내서 쓸 수 있음
    const { value } = req.query;
    // db.collection("post")
    //     .find({ $text: { $search: value } }) //인덱스 있어야 함. 대신 한글 호환성 떨어짐.
    //     .toArray((err, result) => {
    //         console.log(err || result);
    //         res.render("list.ejs", { posts: result });
    //     });
    const conditions = [
        {
            $search: {
                index: "titleSearch",
                text: {
                    query: value, //검색어
                    path: "title", //컬렉션 중 어떤 항목인지, 여러 개 동시에 찾고 싶으면 ['title', 'date'] 와 같이 배열 사용
                },
            },
        },
        //정렬
        {
            $sort: { date: -1 },
        },
        //제한
        {
            $limit: 10,
        },
        //검색 조건 필터
        {
            $project: {
                title: 1,
                _id: 0, //안 가져 옴
                score: {
                    $meta: "searchScore", //얼마나 관련 있는지
                },
            },
        },
    ];
    db.collection("post")
        .aggregate(conditions) //searchIndex사용하기 위한 메소드
        .toArray((err, result) => {
            console.log(err || result);
            res.render("list.ejs", { posts: result });
        });
});

app.post(
    "/register", //passport 세팅이 위에 위치해야 함.
    (req, resp) => {
        const { id, pw } = req.body;
        db.collection("login").findOne({ id }, (err, result) => {
            console.log(err || result);
            if (!result) {
                db.collection("login").insertOne({ id, pw }, (err, result) => {
                    console.log(err || result);
                    resp.redirect("/");
                });
            } else {
                resp.send("존재하는 아이디입니다.");
            }
        });
    }
);

// /add로 post 요청 하면...
app.post("/add", function (req, res) {
    res.send("전송완료");
    db.collection("counter").findOne({ name: "게시물갯수" }, (err, result) => {
        const { totalPost } = result;
        const data = {
            _id: totalPost,
            title: req.body.title,
            date: req.body.date,
            user_id: req.user._id, //req.user로 유저 정보 접근할 수 있음. passport 밑으로 내려야 할 수 있음.
            //작성자 이름 같은 부가 정보 다 넣어도 됨.
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

app.delete("/delete", (req, res) => {
    // parseInt로 하던 숫자로 변환해야 됨.
    console.log(req.body);
    const _id = +req.body._id;
    const user_id = req.user._id;
    db.collection("post").deleteOne({ _id, user_id }, (err, result) => {
        console.log(err || result);
        //이렇게만 하면 삭제만 돼서 목록은 그대로 남아 있음.
        //성공인지 실패인지 알려줘야 함.
        res.status(200).send({ message: "성공했습니다." });
    });
});

// app.use("/", require("./routes/shop")); //app.use는 미들웨어 사용을 위한 것
app.use("/shop", require("./routes/shop")); //app.use는 미들웨어 사용을 위한 것
app.use("/board", require("./routes/board")); //app.use는 미들웨어 사용을 위한 것

app.get("/", (req, res) => {
    if (req.user) {
        res.sendFile(__dirname + "/index.html");
    } else {
        res.render("login.ejs");
    }
});
app.get("/register", (req, res) => {
    if (req.user) {
        res.redirect("/");
    } else {
        res.render("register.ejs");
    }
});

app.get("/fail", (req, res) => {
    const message = req.flash("error")[0];
    res.render("fail.ejs", { message });
});
