const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  getAllStories,
  deleteUser,
  deleteStoryByAdmin,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Grouped admin features requiring validation & permissions
router.use(protect);
router.use(admin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/stories', getAllStories);

router.delete('/users/:id', deleteUser);
router.delete('/stories/:id', deleteStoryByAdmin);

module.exports = router;
