const express = require('express');
const router = express.Router();
const {
  createStory,
  getStories,
  getStoryById,
  updateStory,
  deleteStory,
  likeStory,
  addComment,
  getMyStories,
} = require('../controllers/storyController');
const { protect } = require('../middleware/authMiddleware');

// Public story listings
router.get('/', getStories);

// User-specific stories route (MUST BE DECLARED BEFORE /:id ROUTE)
router.get('/my-stories', protect, getMyStories);

// Single story detail, update, delete
router.get('/:id', getStoryById);
router.post('/', protect, createStory);
router.put('/:id', protect, updateStory);
router.delete('/:id', protect, deleteStory);

// Interactive features (Liking & Commenting)
router.put('/:id/like', protect, likeStory);
router.post('/:id/comment', protect, addComment);

module.exports = router;
