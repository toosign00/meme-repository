require('dotenv').config(); // 환경 변수를 로드하는 dotenv 설정을 최상단에 위치
const mongoose = require('mongoose'); // Mongoose를 통해 MongoDB와 연결하기 위한 모듈 로드

// 비동기 함수로 MongoDB 연결 처리
const dbConnect = async () => {
    // MongoDB URI 환경 변수가 설정되어 있는지 확인
    if (!process.env.MONGODB_URI) {
        console.error('MongoDB URI가 설정되지 않았습니다.'); // URI가 없을 경우 에러 출력
        process.exit(1); // 환경 변수가 없으면 서버를 종료
    }

    try {
        // Mongoose를 사용하여 MongoDB에 연결
        const connect = await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB 연결 성공'); // 연결 성공 시 메시지 출력
    } catch (err) {
        // 연결 실패 시 에러 메시지 출력
        console.error('MongoDB 연결 실패:', err.message);
    }
};

// dbConnect 함수를 모듈로 내보내기
module.exports = dbConnect;