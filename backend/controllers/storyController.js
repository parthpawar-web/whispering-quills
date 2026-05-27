const Story = require('../models/Story');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

// @desc    Create a new story
// @route   POST /api/stories
// @access  Private
const createStory = async (req, res, next) => {
  try {
    const { title, category, coverImage, content, summary } = req.body;

    // Validation
    if (!title || !category || !content || !summary) {
      res.status(400);
      throw new Error('Please fill in all required fields (title, category, content, summary)');
    }

    const story = await Story.create({
      title,
      category,
      coverImage: coverImage || undefined,
      content,
      summary,
      author: req.user._id,
    });

    res.status(201).json(story);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all stories
// @route   GET /api/stories
// @access  Public
const getStories = async (req, res, next) => {
  try {
    const { category, search, featured } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    const stories = await Story.find(query)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single story by ID
// @route   GET /api/stories/:id
// @access  Public
const getStoryById = async (req, res, next) => {
  try {
    const story = await Story.findById(req.id || req.params.id)
      .populate('author', 'name avatar bio')
      .populate({
        path: 'likes',
        select: 'name avatar',
      });

    if (!story) {
      res.status(404);
      throw new Error('Story not found');
    }

    // Increment views
    story.views = (story.views || 0) + 1;
    await story.save();

    // Fetch comments using reference since we migrated to Comment model references
    const comments = await Comment.find({ story: story._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    // Combine story object with its dynamic comments
    const storyData = story.toObject();
    storyData.comments = comments;

    res.json(storyData);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a story
// @route   PUT /api/stories/:id
// @access  Private
const updateStory = async (req, res, next) => {
  try {
    const { title, category, coverImage, content, summary } = req.body;
    const story = await Story.findById(req.params.id);

    if (!story) {
      res.status(404);
      throw new Error('Story not found');
    }

    // Check ownership or admin status
    if (story.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update this story');
    }

    // Apply updates
    story.title = title || story.title;
    story.category = category || story.category;
    story.coverImage = coverImage || story.coverImage;
    story.content = content || story.content;
    story.summary = summary || story.summary;

    const updatedStory = await story.save();
    res.json(updatedStory);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a story
// @route   DELETE /api/stories/:id
// @access  Private
const deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      res.status(404);
      throw new Error('Story not found');
    }

    // Check ownership or admin status
    if (story.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this story');
    }

    // Delete story
    await Story.deleteOne({ _id: story._id });

    // Clean up all comments associated with this story
    await Comment.deleteMany({ story: story._id });

    // Clean up notifications related to this story
    await Notification.deleteMany({ story: story._id });

    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Like / unlike a story
// @route   PUT /api/stories/:id/like
// @access  Private
const likeStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      res.status(404);
      throw new Error('Story not found');
    }

    const alreadyLiked = story.likes.includes(req.user._id);

    if (alreadyLiked) {
      // Unlike
      story.likes = story.likes.filter((userId) => userId.toString() !== req.user._id.toString());
    } else {
      // Like
      story.likes.push(req.user._id);

      // Trigger Notification (only if the like isn't on own story)
      if (story.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: story.author,
          sender: req.user._id,
          type: 'like',
          story: story._id,
        });
      }
    }

    await story.save();
    res.json({ likes: story.likes });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment to a story
// @route   POST /api/stories/:id/comment
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const story = await Story.findById(req.params.id);

    if (!story) {
      res.status(404);
      throw new Error('Story not found');
    }

    if (!text) {
      res.status(400);
      throw new Error('Comment text cannot be empty');
    }

    // Create Comment with references
    const comment = await Comment.create({
      user: req.user._id,
      story: story._id,
      text,
    });

    // Populate user details for returning
    const populatedComment = await Comment.findById(comment._id).populate('user', 'name avatar');

    // Trigger Notification (only if user is not commenting on their own story)
    if (story.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: story.author,
        sender: req.user._id,
        type: 'comment',
        story: story._id,
      });
    }

    res.status(201).json(populatedComment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's stories
// @route   GET /api/stories/my-stories
// @access  Private
const getMyStories = async (req, res, next) => {
  try {
    const stories = await Story.find({ author: req.user._id })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStory,
  getStories,
  getStoryById,
  updateStory,
  deleteStory,
  likeStory,
  addComment,
  getMyStories,
};
