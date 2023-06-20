import mongoose from "mongoose";

export const UserJoinSchema = new mongoose.Schema({
  joiner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  }, 
  target_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  status: {
    type: Number,
    default: 0,
    Comment: "['unjoined','pending', 'accepted', 'rejected']"
  },
  message: {
    type: String,
    maxlength: 255,
    default: null,
  },
  group_id: {
    type: mongoose.Schema.Types.String,
    ref: "UserJoinedGroup",
    unique: true,
    required: true,
    index: true
  },
  notification_frequency:{
    type: Number, // [ 0 - none | 1 - personalized | 3 all ]
    default: 3,
  },
  // notify_for:{
  //   type: String,                 : -------- INCASE USER WANTS SPECIFIC NOTIFICATION OF A PLAYED GAMER FROM JOINED USERS ------ :
  //   length: 80,
  //   index: true,
  //   default: null
  // },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  modified_at: {
    type: Date,
    default: Date.now,
  },
});

UserJoinSchema.pre("save", function (next) {
  this.modified_at = new Date(); // Update modified_at to the current date and time
  next();
});