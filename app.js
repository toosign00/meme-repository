const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./src/routes/userRoutes');
const User = require('./src/models/user'); // User 모델 추가
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 환경 변수 검증
if (!process.env.MONGODB_URI || !process.env.SESSION_SECRET) {
    console.error('필수 환경 변수가 설정되지 않았습니다.');
    process.exit(1);
}

// Body parser 설정
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

// EJS 템플릿 엔진 설정
app.set('view engine', 'ejs');
app.set('views', __dirname + '/src/views');

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB 연결 성공'))
    .catch((err) => console.error('MongoDB 연결 실패:', err));

// 정적 파일 제공 설정
app.use(express.static(path.join(__dirname, 'public')));

// 세션 설정
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true, 
        sameSite: 'strict'
    }
}));

// 모든 템플릿에서 session을 전역적으로 사용할 수 있도록 설정
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// 메인 페이지
app.get('/', (req, res) => {
    res.render('index');
});

// 회원가입 페이지
app.get('/signup', (req, res) => {
    res.render('signup');
});

// 로그인 페이지
app.get('/login', (req, res) => {
    res.render('login');
});

// 로그아웃 라우트
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('로그아웃 중 오류 발생:', err);
            return res.status(500).send('로그아웃 중 오류가 발생했습니다.');
        }
        res.redirect('/');
    });
});

// 보안 페이지
app.get('/security', async (req, res) => {
    try {
        const users = await User.find({});
        res.render('security', {
            users: users
        });
    } catch (error) {
        console.error('사용자 데이터 조회 실패:', error);
        res.render('security', {
            users: []
        });
    }
});

// 사용자 관련 라우트 연결
app.use('/', userRoutes);

// 서버 실행
app.listen(port, () => {
    console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});