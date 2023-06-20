import mongoose from "mongoose";

export const UserProfileSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  username: {
    type: String,
    unique: true,
    length: 18,
    required: true,
  },
  ign: {
    type: String,
    length: 20,
    required: true,
    comment: 'in game name'
  },
  tag_line: {
    type: String,
    length: 5,
    required: true,
  },
  is_online: {
    type: Boolean,
    default: false,
  },
  is_verified:{
    type: Boolean,
    default: false,
  },
  availability:{
    type: String,
    default: null
  },
  badge:{
    type: mongoose.Schema.Types.Number,
    length: 1,
    default: 1
  },
  region:{
    type: String,
    default: null
  },
  profile_image_url: {
    type: String,
    default: null
  },
  cover_image_url: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    length: 255,
    default: null,
  },
  joined_users_count:{
    type: Number,
    default: 0,
  },
  rating: {
    type: {
      "1": {
        type: Number,
        default: 0,
      },
      "2": {
        type: Number,
        default: 0,
      },
      "3": {
        type: Number,
        default: 0,
      },
      "4": {
        type: Number,
        default: 0,
      },
      "5": {
        type: Number,
        default: 0,
      },
    },
    default: {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
    },
  },
  preferred_game:{
    type: String,
    length: 80,
    index: true,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  modified_at: {
    type: Date,
    default: Date.now,
  },
});

UserProfileSchema.pre("save", function (next) {
  this.modified_at = new Date(); // Update modified_at to the current date and time
  next();
});

