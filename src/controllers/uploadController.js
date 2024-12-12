const Post = require("../models/post");
const asyncHandler = require("express-async-handler");
const multer = require('multer');
const path = require('path');

// Multer 설정 (기존과 동일)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('이미지 파일만 업로드 가능합니다!'));
  }
}).single('image');

const uploadPost = asyncHandler(async (req, res) => {
  // 사용자 인증 체크 추가
  if (!res.locals.user) {
    return res.status(401).json({
      success: false,
      message: '로그인이 필요합니다.'
    });
  }

  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || '파일 업로드 중 오류가 발생했습니다.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '이미지를 선택해주세요.'
      });
    }

    try {
      // 디버깅을 위한 로그 추가
      console.log('User Info:', res.locals.user);
      
      const newPost = new Post({
        title: req.body.title,
        imageUrl: `/uploads/${req.file.filename}`,
        author: res.locals.user._id,
        authorNickname: res.locals.user.nickname
      });

      await newPost.save();
      
      console.log(`업로드 성공 - ${new Date().toLocaleString('ko-KR')}
        제목: ${newPost.title}
        작성자: ${newPost.authorNickname}
        파일명: ${req.file.filename}
        파일크기: ${(req.file.size / 1024).toFixed(2)}KB`);

      res.redirect('/');
    } catch (error) {
      console.error('게시물 저장 중 오류:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        errors: error.errors
      });
      res.status(500).json({
        success: false,
        message: '게시물 저장 중 오류가 발생했습니다.'
      });
    }
  });
});

module.exports = {
  uploadPost
};