const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment content cannot be empty'],
      trim: true,
      maxlength: [500, 'Comments cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Ensure index for high performance querying
commentSchema.index({ story: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
