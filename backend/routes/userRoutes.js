const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  getAuthors,
  getUserStatsAndProfile,
  toggleFollowUser,
  toggleSaveStory,
  getSavedStories,
  getLikedStories
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public endpoint
router.get('/authors', getAuthors);

// User profile endpoints (protected)
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

// Bookmarking/Saving endpoints
router.get('/saved-stories', protect, getSavedStories);
router.put('/save-story/:storyId', protect, toggleSaveStory);
router.get('/liked-stories', protect, getLikedStories);
// Follow and stats endpoints
router.put('/:id/follow', protect, toggleFollowUser);
router.get('/:id', getUserStatsAndProfile);

module.exports = router;
