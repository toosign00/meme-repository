const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
// auth 컨트롤러의 정확한 경로를 지정해주세요
const { verifyToken, isAdmin } = require('../controllers/userController'); // JWT 관련 코드가 있던 파일

// 공개 라우트 (인증 불필요)
router.get('/login', viewController.getLoginPage);
router.get('/signup', viewController.getSignupPage);

// 메인 페이지는 인증 여부 확인만
router.get('/', verifyToken, viewController.getIndexPage);

// 인증이 필요한 라우트
router.get('/mypage', verifyToken, viewController.getMyPage);

// 관리자 권한이 필요한 라우트
router.get('/admin', verifyToken, isAdmin, viewController.showAdminPage);

// routes/viewRoutes.js 또는 유사한 라우터 파일
router.get('/upload', verifyToken, viewController.getUploadPage);

module.exports = router;