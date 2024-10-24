const mongoose = require('mongoose');

// 사용자 스키마 정의
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true, // 이메일 필수
        unique: true, // 이메일은 유일해야 함
        trim: true // 앞뒤 공백 제거
    },
    password: {
        type: String,
        required: true, // 비밀번호 필수
        trim: true // 앞뒤 공백 제거
    },
    nickname: {
        type: String,
        required: true, // 닉네임 필수
        trim: true // 앞뒤 공백 제거
    }
}, {
    timestamps: true // 생성 및 업데이트 시간을 자동으로 기록
});

// 'User'라는 모델 이름을 사용하여 Mongoose 모델 생성
module.exports = mongoose.model('User', userSchema, 'User-Collection');