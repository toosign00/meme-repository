const express = require('express');
const router = express.Router();
const {
  createUser,
  loginUser,
  logoutUser,
  updateUserOrDelete,
  verifyToken,
  isAdmin,
  deleteUserByAdmin,
  deletePost
} = require('../controllers/userController');

// 회원가입과 로그인은 인증이 필요없는 public 라우트
router.post('/signup', createUser);
router.post('/login', loginUser);

// 로그아웃과 회원정보 수정은 인증이 필요한 protected 라우트
router.get('/logout', verifyToken, logoutUser);
router.put('/user/update', verifyToken, updateUserOrDelete);

// 게시물 삭제 라우트
router.delete('/posts/:postId', verifyToken, deletePost);

// 관리자 전용 라우트
router.delete('/admin/user/:id', verifyToken, isAdmin, deleteUserByAdmin);

module.exports = router;