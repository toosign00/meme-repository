const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken');
const Post = require("../models/post");

// @desc 인덱스 페이지 렌더링
// @route GET /
const getIndexPage = asyncHandler(async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }); // 최신순 정렬
        res.render("index", {
            user: res.locals.user,
            posts: posts
        });
    } catch (error) {
        console.error('게시물 조회 중 오류:', error);
        res.render("index", {
            user: res.locals.user,
            posts: []
        });
    }
});

// @desc 회원가입 페이지 렌더링
// @route GET /signup
const getSignupPage = asyncHandler(async (req, res) => {
    res.render("signup", { user: res.locals.user });
});

// @desc 로그인 페이지 렌더링
// @route GET /login
const getLoginPage = asyncHandler(async (req, res) => {
    res.render("login", { user: res.locals.user });
});

// @desc admin 페이지에 사용자 정보 표시
// @route GET /admin
const showAdminPage = asyncHandler(async (req, res) => {
    try {
        const users = await User.find();
        console.log("사용자 데이터:", users);
        res.render("admin/admin", {
            users,
            user: res.locals.user // JWT 사용자 정보 전달
        });
    } catch (err) {
        console.error("admin 페이지 표시 중 오류 발생:", err);
        res.status(500).send("admin 페이지를 표시하는 중 오류가 발생했습니다.");
    }
});

// @desc 마이페이지 렌더링
// @route GET /mypage
const getMyPage = asyncHandler(async (req, res) => {
    if (!res.locals.user) {
        return res.redirect("/login");
    }

    try {
        // 현재 사용자가 좋아요를 누른 게시물 가져오기
        const likedPosts = await Post.find({ likes: res.locals.user._id })
            .populate('author', 'nickname') // 작성자 정보 가져오기 (닉네임만)
            .sort({ createdAt: -1 });

        // 현재 사용자가 작성한 게시물 가져오기
        const userPosts = await Post.find({ author: res.locals.user._id })
            .sort({ createdAt: -1 });

        res.render('mypage', {
            user: res.locals.user,
            userPosts: userPosts,
            likedPosts: likedPosts,
        });
    } catch (error) {
        console.error('마이페이지 렌더링 중 오류:', error);
        res.render('mypage', {
            user: res.locals.user,
            userPosts: [],
            likedPosts: [],
        });
    }
});


// @desc 업로드 페이지 렌더링
// @route GET /upload
const getUploadPage = asyncHandler(async (req, res) => {
    if (!res.locals.user) {
        return res.redirect("/login");
    }
    res.render("upload", {
        user: res.locals.user // JWT 사용자 정보 전달
    });
});


module.exports = {
    getSignupPage,
    getLoginPage,
    getIndexPage,
    showAdminPage,
    getMyPage,
    getUploadPage
};