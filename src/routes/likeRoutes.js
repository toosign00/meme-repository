const express = require('express');
const router = express.Router();
const { toggleLike } = require('../controllers/likeController');
const { verifyToken } = require('../controllers/userController');

router.post('/posts/:postId/like', verifyToken, toggleLike);

module.exports = router;