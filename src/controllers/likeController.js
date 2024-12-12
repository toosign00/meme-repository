const Post = require('../models/post');
const asyncHandler = require('express-async-handler');

const toggleLike = asyncHandler(async (req, res) => {
  if (!res.locals.user) {
    return res.status(401).json({ 
      success: false, 
      message: '로그인이 필요합니다.' 
    });
  }

  const postId = req.params.postId;
  const userId = res.locals.user._id;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: '게시물을 찾을 수 없습니다.' 
      });
    }

    // 좋아요 토글 로직
    const likeIndex = post.likes.indexOf(userId);
    
    if (likeIndex > -1) {
      // 이미 좋아요를 눌렀다면 제거
      post.likes.splice(likeIndex, 1);
      post.likeCount -= 1;
    } else {
      // 좋아요 추가
      post.likes.push(userId);
      post.likeCount += 1;
    }

    await post.save();

    res.json({
      success: true,
      likeCount: post.likeCount,
      isLiked: likeIndex === -1
    });

  } catch (error) {
    console.error('좋아요 토글 중 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '좋아요 처리 중 오류가 발생했습니다.' 
    });
  }
});

module.exports = {
  toggleLike
};