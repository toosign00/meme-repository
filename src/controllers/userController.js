const User = require('../models/user');
const asyncHandler = require("express-async-handler");

// 이메일과 닉네임 중복 검사 함수
// @desc 내부에서만 사용되는 이메일과 닉네임 중복 검사 함수
const checkDuplicateUser = async (email, nickname) => {
    const [existingUserByEmail, existingUserByNickname] = await Promise.all([
        User.findOne({
            email
        }),
        User.findOne({
            nickname
        })
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
    const newUser = new User({
        email,
        password,
        nickname
    });
    await newUser.save();
    console.log(`생성시간: ${newUser.createdAt} 사용자 ${nickname}이(가) 생성되었습니다. ID: ${newUser._id} Email: ${email} PW: ${newUser.password}`);
};

// @desc 사용자 생성 (회원가입)
// @route POST /signup
const createUser = asyncHandler(async (req, res) => {
    const {
        email,
        password,
        nickname
    } = req.body;

    // 필수 필드 검사
    if (!email || !password || !nickname) {
        return res.status(400).send("모든 필드를 입력해야 합니다.");
    }

    try {
        // 중복 검사
        await checkDuplicateUser(email, nickname);

        // 사용자 생성 및 저장
        await saveNewUser(email, password, nickname);

        // 클라이언트에 따른 처리 (User-Agent 기반)
        const userAgent = req.get('User-Agent');
        if (userAgent && userAgent.includes('Thunder Client')) {
            // 썬더클라이언트일 경우 JSON 응답 반환
            res.status(201).json({
                message: "사용자 생성 완료, 로그인 페이지로 이동 바람",
                redirectURL: "/login"
            });
        } else {
            // 브라우저일 경우 리다이렉트 처리
            res.redirect('/login');
        }
    } catch (err) {
        if (err.message.includes("이미 사용 중인")) {
            return res.status(400).send(err.message);
        }
        console.error('사용자 생성 중 오류 발생:', err.message);
        res.status(500).send('사용자 생성 중 오류가 발생했습니다.');
    }
});

// @desc 사용자 로그인
// @route POST /login
const loginUser = asyncHandler(async (req, res) => {
    const {
        email,
        password
    } = req.body;

    // 필수 필드 검사
    if (!email || !password) {
        return res.status(400).send("이메일과 비밀번호를 모두 입력해야 합니다.");
    }

    try {
        // 이메일로 사용자 찾기
        const user = await User.findOne({
            email
        });
        if (!user) {
            return res.status(400).send("해당 이메일로 가입된 사용자가 없습니다.");
        }

        // 비밀번호 대조 (비밀번호 보안 적용 제외)
        if (user.password !== password) {
            return res.status(400).send("비밀번호가 일치하지 않습니다.");
        }

        // 로그인 성공 -> 세션에 사용자 정보 저장
        req.session.user = {
            email: user.email,
            nickname: user.nickname
        };
        console.log(`사용자 ${user.nickname}이(가) 로그인했습니다.`);

        // index 페이지로 리다이렉트
        res.redirect('/');
    } catch (err) {
        console.error('로그인 중 오류 발생:', err.message);
        res.status(500).send('로그인 중 오류가 발생했습니다.');
    }
});

// @desc 사용자 로그아웃
// @route GET /logout
const logoutUser = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('로그아웃 중 오류 발생:', err);
            return res.status(500).send('로그아웃 중 오류가 발생했습니다.');
        }
        res.redirect('/'); // 로그아웃 후 메인 페이지로 리다이렉트
    });
};

// @desc 회원가입 페이지 렌더링
// @route GET /signup
const getSignupPage = asyncHandler(async (req, res) => {
    res.render('signup'); // signup.ejs 템플릿 렌더링
});

// @desc 로그인 페이지 렌더링
// @route GET /login
const getLoginPage = asyncHandler(async (req, res) => {
    res.render('login'); // login.ejs 템플릿 렌더링
});

// @desc 인덱스 페이지 렌더링
// @route GET /
const getIndexPage = asyncHandler(async (req, res) => {
    res.render('index'); // index.ejs 템플릿 렌더링
});

// @desc 사용자 업데이트
// @route PUT /signup/:id
const updateUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const {
        email,
        password,
        nickname
    } = req.body;

    if (!email || !password || !nickname) {
        return res.status(400).send("모든 필드를 입력해야 합니다.");
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId, {
                email,
                password,
                nickname
            }, {
                new: true
            }
        );

        if (!updatedUser) {
            return res.status(404).send("사용자를 찾을 수 없습니다.");
        }

        console.log(`사용자 ${nickname}이(가) 업데이트되었습니다.`);
        res.status(200).send(`사용자 ${nickname}이(가) 업데이트되었습니다.`);
    } catch (err) {
        console.error('사용자 업데이트 중 오류 발생:', err.message);
        res.status(500).send('사용자 업데이트 중 오류가 발생했습니다.');
    }
});

// @desc 사용자 삭제
// @route DELETE /signup/:id
const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).send("사용자를 찾을 수 없습니다.");
        }

        console.log(`사용자 ${user.nickname}이(가) 삭제되었습니다.`);
        res.status(200).send(`사용자 ${user.nickname}이(가) 삭제되었습니다.`);
    } catch (err) {
        console.error('사용자 삭제 중 오류 발생:', err.message);
        res.status(500).send('사용자 삭제 중 오류가 발생했습니다.');
    }
});

// @desc 보안 페이지에 사용자 정보 표시
// @route GET /security
const showSecurityPage = asyncHandler(async (req, res) => {
    try {
        const users = await User.find();
        console.log('사용자 데이터:', users);
        res.render('security', {
            users
        }); // 보안 페이지 렌더링
    } catch (err) {
        console.error('보안 페이지 표시 중 오류 발생:', err);
        res.status(500).send('보안 페이지를 표시하는 중 오류가 발생했습니다.');
    }
});

// 모든 사용자 관련 함수들을 모듈로 내보내기
module.exports = {
    createUser,
    loginUser,
    logoutUser,
    getSignupPage,
    getLoginPage,
    getIndexPage,
    updateUser,
    deleteUser,
    showSecurityPage,
};