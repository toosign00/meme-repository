const errorhandler = (err, req, res, next) => {
    const status = err.status || 500;

    // 기본 에러 메시지 설정
    const errorResponse = {
        title: "Error",
        message: err.message || "Something went wrong",
    };

    // 에러 상태에 따른 제목 변경
    switch (status) {
        case 400:
            errorResponse.title = "Bad Request";
            break;
        case 401:
            errorResponse.title = "Unauthorized";
            break;
        case 403:
            errorResponse.title = "Forbidden";
            break;
        case 404:
            errorResponse.title = "Not Found";
            break;
        case 500:
        default:
            errorResponse.title = status === 500 ? "Internal Server Error" : "Error";
            break;
    }

    // 에러 로그 출력 (로깅 기능 추가)
    console.error(`Error: ${errorResponse.title} - ${errorResponse.message}`);

    // JSON 응답
    res.status(status).json(errorResponse);
};

module.exports = errorhandler;