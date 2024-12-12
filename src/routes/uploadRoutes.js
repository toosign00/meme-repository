const express = require('express');
const router = express.Router();
const { uploadPost } = require('../controllers/uploadController');
const { verifyToken } = require('../controllers/userController');
const auth = require('../middlewares/auth');

router.post('/upload', auth, uploadPost);
router.post('/', verifyToken, uploadPost);

module.exports = router;