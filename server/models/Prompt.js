const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Prompt description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    beforeImage: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ['photo', 'video'],
      required: [true, 'Type (photo/video) is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    variants: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Text index for search
promptSchema.index({ title: 'text', description: 'text', tags: 'text' });
promptSchema.index({ category: 1, type: 1 });

module.exports = mongoose.model('Prompt', promptSchema);
