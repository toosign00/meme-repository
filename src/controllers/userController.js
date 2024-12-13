const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const Post = require('../models/post');
const asyncHandler = require("express-async-handler");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// JWT Secret Key 검증
const JWT_SECRET = process.env.JWT_SECRET || 'your_secure_secret_key';
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

// 이메일과 닉네임 중복 검사 함수
const checkDuplicateUser = async (email, nickname) => {
    const [existingUserByEmail, existingUserByNickname] = await Promise.all([
        User.findOne({ email }),
        User.findOne({ nickname })
    ]);

    if (existingUserByEmail) {
        throw new Error("이미 사용 중인 이메일입니다.");
    }

    if (existingUserByNickname) {
        throw new Error("이미 사용 중인 닉네임입니다.");
    }
};

// 새로운 사용자 생성 함수
const saveNewUser = async (email, password, nickname) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
        email,
        password: hashedPassword,
        nickname,
        role: 'user' // 기본 역할 설정
    });

    await newUser.save();
    console.log(`생성시간: ${newUser.createdAt} 사용자 ${nickname}이(가) 생성되었습니다. ID: ${newUser._id} Email: ${email}`);
};

// @desc 사용자 생성 (회원가입)
// @route POST /signup
const createUser = asyncHandler(async (req, res) => {
    const { email, password, nickname } = req.body;

    if (!email || !password || !nickname) {
        return res.status(400).json({ message: "모든 필드를 입력해야 합니다." });
    }

    try {
        await checkDuplicateUser(email, nickname);
        await saveNewUser(email, password, nickname);

        // 리다이렉트 응답 전송
        res.redirect('/login');
    } catch (err) {
        if (err.message.includes("이미 사용 중인")) {
            return res.status(400).json({ message: err.message });
        }
        console.error('사용자 생성 중 오류 발생:', err.message);
        res.status(500).json({ message: '사용자 생성 중 오류가 발생했습니다.' });
    }
});

// @desc 사용자 로그인
// @route POST /login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "이메일과 비밀번호를 모두 입력해야 합니다." });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "해당 이메일로 가입된 사용자가 없습니다." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
        }

        // JWT 토큰 생성
        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                nickname: user.nickname,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // tokens 배열에 새 토큰 추가
        user.tokens = user.tokens.concat({ token });
        await user.save();  // 변경사항 저장

        // 쿠키에 토큰 저장
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        console.log(`로그인 성공 - 사용자: ${user.email} (${user.role})`);

        // role에 따른 리다이렉션
        if (user.role === 'admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/');
        }

    } catch (err) {
        console.error('로그인 오류:', err);
        res.status(500).json({ message: '로그인 처리 중 오류가 발생했습니다.' });
    }
});

// @desc 사용자 로그아웃
// @route POST /logout
const logoutUser = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.redirect('/');
};

// JWT 검증 미들웨어 - 모든 라우트에서 사용
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        res.locals.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        res.locals.user = decoded;
        next();
    } catch (err) {
        res.locals.user = null;
        res.clearCookie('token');
        next();
    }
};

// 인증 필요한 페이지용 미들웨어
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    next();
};

// 관리자 권한 확인 미들웨어
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.redirect('/'); // 관리자가 아닌 경우 메인 페이지로 리다이렉트
    }
    next();
};

// 사용자 정보 업데이트 또는 삭제
const updateUserOrDelete = asyncHandler(async (req, res) => {

    if (!req.user) {
        return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const { email, nickname, password, action } = req.body;
    const userId = req.user._id;

    try {
        if (action === 'update') {
            const updateData = {};

            if (email) updateData.email = email;
            if (nickname) updateData.nickname = nickname;
            if (password) {
                const saltRounds = 10;
                updateData.password = await bcrypt.hash(password, saltRounds);
            }

            // 이메일이나 닉네임이 변경된 경우 중복 체크
            if (email || nickname) {
                const existingUser = await User.findOne({
                    $or: [
                        { email: email || '' },
                        { nickname: nickname || '' }
                    ],
                    _id: { $ne: userId } // 현재 사용자는 제외
                });

                if (existingUser) {
                    if (existingUser.email === email) {
                        return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
                    }
                    if (existingUser.nickname === nickname) {
                        return res.status(400).json({ message: '이미 사용 중인 닉네임입니다.' });
                    }
                }
            }

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
            }

            // 닉네임이 변경된 경우, 모든 게시물의 authorNickname 업데이트
            if (nickname) {
                await Post.updateMany(
                    { author: userId },
                    { authorNickname: nickname }
                );
                console.log(`[${new Date().toLocaleString('ko-KR')}] 사용자 정보 업데이트
- 사용자 ID: ${userId}
- 변경된 닉네임: ${nickname}
- 이메일: ${email || '변경 없음'}
- 비밀번호: ${password ? '변경됨' : '변경 없음'}`);
            }

            // JWT 토큰 재발급
            const token = jwt.sign(
                {
                    _id: updatedUser._id,
                    email: updatedUser.email,
                    nickname: updatedUser.nickname,
                    role: updatedUser.role
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000
            });

            res.json({
                success: true,
                message: "사용자 정보가 업데이트되었습니다.",
                redirectUrl: '/mypage'
            });

        } else if (action === 'delete') {
            // 먼저 사용자의 모든 게시물을 찾습니다
            const userPosts = await Post.find({ author: userId });

            // 삭제된 이미지 파일 수를 추적
            let deletedImagesCount = 0;

            // 각 게시물의 이미지 파일을 삭제합니다
            for (const post of userPosts) {
                const imagePath = path.join('public', post.imageUrl);
                // 파일이 존재하는지 확인 후 삭제
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    deletedImagesCount++;
                }
            }

            // 데이터베이스에서 사용자와 게시물 삭제
            const deletedUser = await User.findByIdAndDelete(userId);
            if (!deletedUser) {
                return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
            }

            // 게시물 삭제 및 개수 확인
            const deleteResult = await Post.deleteMany({ author: userId });
            const deletedPostsCount = deleteResult.deletedCount;

            console.log(`[${new Date().toLocaleString('ko-KR')}] 사용자 계정 삭제
- 사용자 ID: ${userId}
- 이메일: ${deletedUser.email}
- 닉네임: ${deletedUser.nickname}
- 삭제된 게시물 수: ${deletedPostsCount}
- 삭제된 이미지 파일 수: ${deletedImagesCount}`);

            res.clearCookie('token');
            res.json({
                success: true,
                message: "계정이 삭제되었습니다.",
                redirectUrl: '/'
            });
        } else {
            res.status(400).json({ message: '잘못된 요청입니다.' });
        }
    } catch (error) {
        console.error('사용자 정보 수정/삭제 중 오류:', error);
        res.status(500).json({ message: '처리 중 오류가 발생했습니다.' });
    }
});


const deleteUserByAdmin = asyncHandler(async (req, res) => {
    const Post = require('../models/post');

    try {
        const userId = req.params.id;

        // 먼저 해당 사용자의 모든 게시물을 찾습니다
        const userPosts = await Post.find({ author: userId });

        // 삭제된 이미지 파일 수를 추적
        let deletedImagesCount = 0;

        // 각 게시물의 이미지 파일을 삭제합니다
        for (const post of userPosts) {
            const imagePath = path.join('public', post.imageUrl);
            // 파일이 존재하는지 확인 후 삭제
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                deletedImagesCount++;
            }
        }

        // 사용자 정보를 삭제하기 전에 먼저 가져옵니다
        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }

        // 사용자 삭제
        const deletedUser = await User.findByIdAndDelete(userId);

        // 게시물 삭제 및 개수 확인
        const deleteResult = await Post.deleteMany({ author: userId });
        const deletedPostsCount = deleteResult.deletedCount;

        console.log(`[${new Date().toLocaleString('ko-KR')}] 관리자에 의한 사용자 계정 삭제
        - 관리자 ID: ${req.user._id}
        - 삭제된 사용자 정보:
        · ID: ${userId}
        · 이메일: ${userToDelete.email}
        · 닉네임: ${userToDelete.nickname}
        · 역할: ${userToDelete.role}
        · 가입일: ${userToDelete.createdAt}
        - 삭제된 게시물 수: ${deletedPostsCount}
        - 삭제된 이미지 파일 수: ${deletedImagesCount}`);

        res.json({
            success: true,
            message: '사용자가 성공적으로 삭제되었습니다.'
        });

    } catch (error) {
        console.error('관리자 사용자 삭제 오류:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        res.status(500).json({
            success: false,
            message: '사용자 삭제 중 오류가 발생했습니다.'
        });
    }
});


// 게시물 삭제 핸들러 추가
const deletePost = asyncHandler(async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user._id; // 현재 로그인된 사용자 ID

    try {
        // 게시물 찾기 및 권한 확인
        const post = await Post.findOne({
            _id: postId,
            author: userId
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: '게시물을 찾을 수 없거나 삭제 권한이 없습니다.'
            });
        }

        // 이미지 파일 삭제
        const imagePath = path.join('public', post.imageUrl);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        // 데이터베이스에서 게시물 삭제
        await Post.findByIdAndDelete(postId);

        console.log(`[${new Date().toLocaleString('ko-KR')}] 게시물 삭제
    - 사용자 ID: ${userId}
    - 게시물 ID: ${postId}
    - 게시물 제목: ${post.title}`);

        // 성공 응답
        res.json({
            success: true,
            message: '게시물이 성공적으로 삭제되었습니다.'
        });

    } catch (error) {
        console.error('게시물 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '게시물 삭제 중 오류가 발생했습니다.'
        });
    }
});

module.exports = {
    createUser,
    loginUser,
    logoutUser,
    updateUserOrDelete,
    verifyToken,
    requireAuth,
    isAdmin,
    deleteUserByAdmin,
    deletePost
};