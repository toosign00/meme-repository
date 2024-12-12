const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // JWT 토큰을 쿠키에서 가져옵니다
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: '인증이 필요합니다' });
    }

    // 토큰을 검증하고 사용자 정보를 res.locals에 저장
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.user = {
      id: decoded._id,
      nickname: decoded.nickname
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: '유효하지 않은 토큰입니다' });
  }
};

module.exports = auth;