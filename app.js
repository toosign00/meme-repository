const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const userRoutes = require('./src/routes/userRoutes');
const viewRoutes = require('./src/routes/viewRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const likeRoutes = require('./src/routes/likeRoutes');
const User = require('./src/models/user');
const methodOverride = require('method-override');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 환경 변수 검증
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    console.error('필수 환경 변수가 설정되지 않았습니다.');
    process.exit(1);
}

// Method Override 설정
app.use(methodOverride('_method'));

// Body parser 설정
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

// Cookie Parser 설정
app.use(cookieParser());

// EJS 템플릿 엔진 설정
app.set('view engine', 'ejs');
app.set('views', __dirname + '/src/views');

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB 연결 성공'))
    .catch((err) => console.error('MongoDB 연결 실패:', err));

// 정적 파일 제공 설정
app.use(express.static(path.join(__dirname, 'public')));

// 사용자 관련 라우트 연결
app.use('/', userRoutes);

// 뷰 관련 라우트 연결
app.use('/', viewRoutes);

// 업로드 관련 라우트 연결
app.use('/upload', uploadRoutes);

// 좋아요 관련 라우트 연결
app.use(likeRoutes);

// 서버 실행
app.listen(port, () => {
    console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});