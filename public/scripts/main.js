document.getElementById('signupButton').addEventListener('click', () => {
    window.location.href = '/signup';
});

document.getElementById('loginForm').addEventListener('submit', function (event) {
    const nicknameInput = document.getElementById('nickname').value;
    const nicknameError = document.getElementById('nicknameError');
    const emailInput = document.getElementById('email').value;
    const passwordInput = document.getElementById('password').value;
    const specialCharRegex = /[\s~`!@#$%^&*()_+=\-[\]{}|;:'",.<>/?]/; // 특수문자
    const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/; // 한글
    const englishRegex = /^[a-zA-Z]+$/; // 영문
    const numberRegex = /[0-9]/; // 숫자
    let isValid = true;

    // 초기화
    nicknameError.textContent = '';
    nicknameError.style.fontSize = '0.875rem'; // 기본 폰트 크기 설정

    // 이메일과 비밀번호가 빈 경우
    if (!emailInput || !passwordInput) {
        alert('이메일과 비밀번호를 모두 입력해주세요.');
        event.preventDefault();
        return;
    }

    // 특수문자 및 이모티콘 금지
    if (specialCharRegex.test(nicknameInput)) {
        nicknameError.textContent = '특수문자 및 이모티콘은 사용할 수 없습니다.';
        nicknameError.style.fontSize = '0.75rem'; // 폰트 크기 줄이기
        isValid = false;
    }

    // 숫자 사용 금지
    if (numberRegex.test(nicknameInput)) {
        nicknameError.textContent = '닉네임에 숫자는 사용할 수 없습니다.';
        isValid = false;
    }

    // 한글만 포함된 경우
    if (koreanRegex.test(nicknameInput) && !/[a-zA-Z]/.test(nicknameInput)) {
        if (nicknameInput.length > 8) {
            nicknameError.textContent = '한글은 8자 이내로 입력해주세요.';
            isValid = false;
        }
    }

    // 영문만 포함된 경우
    if (englishRegex.test(nicknameInput)) {
        if (nicknameInput.length > 10) {
            nicknameError.textContent = '영문은 10자 이내로 입력해주세요.';
            isValid = false;
        }
    }

    // 한글과 영문이 혼합된 경우
    if (koreanRegex.test(nicknameInput) && /[a-zA-Z]/.test(nicknameInput)) {
        if (nicknameInput.length > 6) {
            nicknameError.textContent = '한,영 혼합은 6자 이내로 입력해주세요.';
            nicknameError.style.fontSize = '0.75rem'; // 폰트 크기 줄이기
            isValid = false;
        }
    }

    // 검증 실패 시 폼 제출 방지
    if (!isValid) {
        event.preventDefault();
        return;
    }
});