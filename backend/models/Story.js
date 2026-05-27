const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a story title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: {
        values: ['Fantasy', 'Romance', 'Mystery', 'Adventure', 'Fairy Tale', 'Horror', 'Sci-Fi', 'Historical', 'Children', 'Poetry'],
        message: 'Please select a valid vintage story category',
      },
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
    },
    content: {
      type: String,
      required: [true, 'Story content cannot be empty'],
    },
    summary: {
      type: String,
      required: [true, 'Please add a brief summary or AI-generated overview'],
      maxlength: [300, 'Summary cannot exceed 300 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    readTime: {
      type: String,
      default: '5 min',
    },
    tags: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for comments so we can easily fetch them with stories if needed
storySchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'story',
  justOne: false,
});

module.exports = mongoose.model('Story', storySchema);
