const User = require('../models/User');
const Story = require('../models/Story');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.avatar = req.body.avatar || user.avatar;

      // Only update password if provided
      if (req.body.password) {
        if (req.body.password.length < 6) {
          res.status(400);
          throw new Error('Password must be at least 6 characters');
        }
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all authors (public)
// @route   GET /api/users/authors
// @access  Public
const getAuthors = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    // For each user, count their stories
    const authorsWithCounts = await Promise.all(
      users.map(async (user) => {
        const storyCount = await Story.countDocuments({ author: user._id });
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          role: user.role,
          stories: storyCount,
          createdAt: user.createdAt,
        };
      })
    );
    
    res.json(authorsWithCounts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user public stats and profile
// @route   GET /api/users/:id
// @access  Public
const getUserStatsAndProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalStories = await Story.countDocuments({ author: id });

    // Aggregate total likes received across author's stories
    const likesResult = await Story.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(id) } },
      { $project: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
      { $group: { _id: null, total: { $sum: "$likesCount" } } }
    ]);
    const totalLikesReceived = likesResult.length > 0 ? likesResult[0].total : 0;

    // Calculate total comments received
    const authorStoryIds = await Story.find({ author: id }).select('_id');
    const totalCommentsReceived = await Comment.countDocuments({ story: { $in: authorStoryIds } });

    const followersCount = user.followers ? user.followers.length : 0;
    const followingCount = user.following ? user.following.length : 0;

    res.json({
      user,
      stats: {
        totalStories,
        followersCount,
        followingCount,
        totalLikesReceived,
        totalCommentsReceived
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle follow/unfollow a user
// @route   PUT /api/users/:id/follow
// @access  Private
const toggleFollowUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize arrays if they don't exist
    if (!targetUser.followers) targetUser.followers = [];
    if (!currentUser.following) currentUser.following = [];

    const isFollowing = targetUser.followers.some(fId => fId.toString() === req.user._id.toString());

    if (isFollowing) {
      // Unfollow
      targetUser.followers = targetUser.followers.filter(fId => fId.toString() !== req.user._id.toString());
      currentUser.following = currentUser.following.filter(fId => fId.toString() !== id.toString());
    } else {
      // Follow
      targetUser.followers.push(req.user._id);
      currentUser.following.push(id);
    }

    await targetUser.save();
    await currentUser.save();

    res.json({
      followersCount: targetUser.followers.length,
      isFollowing: !isFollowing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle save/bookmark a story
// @route   PUT /api/users/save-story/:storyId
// @access  Private
const toggleSaveStory = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return res.status(400).json({ message: "Invalid story id" });
    }

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.savedStories) user.savedStories = [];

    const isSaved = user.savedStories.some(sId => sId.toString() === storyId.toString());

    if (isSaved) {
      // Unsave
      user.savedStories = user.savedStories.filter(sId => sId.toString() !== storyId.toString());
    } else {
      // Save
      user.savedStories.push(storyId);
    }

    await user.save();

    res.json({
      isSaved: !isSaved,
      savedStoriesCount: user.savedStories.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved/bookmarked stories
// @route   GET /api/users/saved-stories
// @access  Private
const getSavedStories = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedStories',
      populate: { path: 'author', select: 'name avatar' }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.savedStories || []);
  } catch (error) {
    next(error);
  }
};
// @desc    Get liked stories of the current user
// @route   GET /api/users/liked-stories
// @access  Private
const getLikedStories = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const stories = await Story.find({ likes: userId })
      .populate({ path: 'author', select: 'name avatar' })
      .sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAuthors,
  getUserStatsAndProfile,
  toggleFollowUser,
  toggleSaveStory,
  getSavedStories,
  getLikedStories,
};
