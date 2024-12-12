meme-repository
├── app.js
├── package-lock.json # 의존성 버전 잠금 파일
├── package.json # 프로젝트 설정 및 의존성 파일
├── public
│   ├── fonts # 폰트
│   ├── images # 이미지 파일
│   ├── js # JavaScript 파일
│   └── css # CSS 파일
└── src
    ├── config
    │   └── dbConnect.js # 데이터베이스 연결 설정
    ├── controllers
    │   ├── userController.js # 사용자 관련 로직 처리
    │   ├── viewController.js # 뷰 관련 로직 처리
    │   └── postController.js # 게시물 관련 로직 처리
    ├── middlewares
    │   └── errorhandler.js # 오류 핸들링 미들웨어
    ├── models
    │   └── user.js # 사용자 모델 정의
    ├── routes
    │   ├── userRoutes.js # 사용자 관련 라우팅
    │   ├── viewRoutes.js # 뷰 관련 라우팅
    │   └── postRoutes.js # 게시물 관련 라우팅
    ├── services # 비즈니스 로직 구현
    ├── utils # 유틸리티 함수
    └── views # 서버 측 렌더링 뷰 파일
        ├── layout.ejs # 레이아웃 템플릿
        ├── home.ejs # 홈 페이지 템플릿
        ├── login.ejs # 로그인 페이지 템플릿
        ├── register.ejs # 회원가입 페이지 템플릿
        └── post.ejs # 게시물 페이지 템플릿