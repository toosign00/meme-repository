─ src
 ├─ config # 설정 파일들 (DB, 서버 등)
 ├─ controllers # 비즈니스 로직 처리
 ├─ middlewares # 미들웨어 (요청 전 처리)
 ├─ models # 데이터베이스 모델
 ├─ public # 정적 파일 (HTML, CSS, JS, 이미지)
 │   ├─ fonts
 │   ├─ images
 │   │   └─ favicon # 사이트 아이콘
 │   ├─ index.html
 │   ├─ scripts
 │   └─ styles
 ├─ routes
 ├─ services # 외부 서비스 연동 로직
 └─ utils # 재사용 가능한 유틸리티 함수
app.js
.env # 환경 변수 파일
package.json # 프로젝트 설정 및 의존성 파일
package-lock.json # 의존성 버전 잠금 파일