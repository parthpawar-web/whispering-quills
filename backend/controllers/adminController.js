const User = require('../models/User');
const Story = require('../models/Story');
const Comment = require('../models/Comment');

// @desc    Get dashboard metrics & stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStories = await Story.countDocuments();
    const totalComments = await Comment.countDocuments();

    // Aggregate total likes received across all stories
    const likesResult = await Story.aggregate([
      { $project: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
      { $group: { _id: null, total: { $sum: "$likesCount" } } }
    ]);
    const totalLikes = likesResult.length > 0 ? likesResult[0].total : 0;

    // Get story distribution by category
    const categoryStats = await Story.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Mock reports stats for complete system integration
    const totalReports = 0;

    // Fetch recent activities
    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5);
    const recentStories = await Story.find({}).populate('author', 'name').sort({ createdAt: -1 }).limit(5);
    const recentComments = await Comment.find({}).populate('user', 'name').populate('story', 'title').sort({ createdAt: -1 }).limit(5);

    const recentActivity = [];
    recentUsers.forEach(u => {
      recentActivity.push({
        type: 'user',
        message: `New storyteller "${u.name}" joined the circle`,
        time: u.createdAt,
      });
    });
    recentStories.forEach(s => {
      recentActivity.push({
        type: 'story',
        message: `New quill "${s.title}" was published by ${s.author?.name || 'Unknown'}`,
        time: s.createdAt,
      });
    });
    recentComments.forEach(c => {
      recentActivity.push({
        type: 'comment',
        message: `New comment on "${c.story?.title || 'Unknown'}" by ${c.user?.name || 'Unknown'}`,
        time: c.createdAt,
      });
    });

    // Sort by date descending
    recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    res.json({
      metrics: {
        totalUsers,
        totalStories,
        totalComments,
        totalLikes,
        totalReports,
      },
      categoryStats,
      recentActivity: recentActivity.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all stories list
// @route   GET /api/admin/stories
// @access  Private/Admin
const getAllStories = async (req, res, next) => {
  try {
    const stories = await Story.find({})
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot delete an administrator account');
    }

    // Delete user
    await User.deleteOne({ _id: user._id });

    // Clean up stories authored by this user
    await Story.deleteMany({ author: user._id });

    // Clean up comments made by this user
    await Comment.deleteMany({ user: user._id });

    res.json({ message: 'User and all associated content deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete story by Admin
// @route   DELETE /api/admin/stories/:id
// @access  Private/Admin
const deleteStoryByAdmin = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      res.status(404);
      throw new Error('Story not found');
    }

    // Delete story
    await Story.deleteOne({ _id: story._id });

    // Clean up comments
    await Comment.deleteMany({ story: story._id });

    res.json({ message: 'Story removed by administrative action successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  getAllStories,
  deleteUser,
  deleteStoryByAdmin,
};
