import mongoose from "mongoose";

export const UserLobbySchema = new mongoose.Schema({
  owner_id:{
    type: mongoose.Schema.Types.ObjectId,
    unique: false,
    ref: 'UserProfile',
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  description:{
    type: String,
    default: null,
  },
  for_game: {
    type: String,
    required: true,
    index: true,
  },
  maxCapacity: {
    type: Number,
    default: 1,
  },
  users: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      ign: {
        type: String,
        required: true
      },
      tag_line: {
        type: String,
        required: true
      }
    }
  ],
  icon: {
    type: String,
    default: null
  },
  allowChat: {
    type: Boolean,
    default: true,
  },
  session_start:{
    type: Date,
    default: null,
  },
  session_end:{
    type: Date,
    default: null,
  },
  visibility:{
    type: Number,
    default: 0, // [ 0 - public, 1 - private, 2 - shared ] // shared = i don't want to notify any person, only want to invite via link
  },
  is_expired: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now,
    index:true,
  },
  modified_at: {
    type: Date,
    default: Date.now,
  },
});

UserLobbySchema.pre("save", function (next) {
  this.modified_at = new Date(); 
  next();
});

