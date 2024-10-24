const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 인덱스 페이지 표시 (GET 요청)
router.get('/', userController.getIndexPage);

// 회원가입 페이지 표시 (GET 요청)
router.get('/signup', userController.getSignupPage);

// 회원가입 처리 (POST 요청)
router.post('/signup', userController.createUser);

// 로그인 페이지 표시 (GET 요청)
router.get('/login', userController.getLoginPage);

// 로그인 처리 (POST 요청)
router.post('/login', userController.loginUser);

// 로그아웃 처리 (GET 요청)
router.get('/logout', userController.logoutUser);

// 사용자 업데이트 (PUT 요청)
router.put('/user/:id', userController.updateUser);

// 사용자 삭제 (DELETE 요청)
router.delete('/user/:id', userController.deleteUser);

// 보안 페이지 표시 (GET 요청)
router.get('/security', userController.showSecurityPage);

module.exports = router;