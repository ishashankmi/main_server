import mongoose from "mongoose";

export const UserTokenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserProfile",
    required: true,
    index: true,
  },
  token:{
    type: String,
    default: null
  },
  device:{
    type: Number, // [ 1 - mobile, 2 - web ]
    required: true,
  },
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

UserTokenSchema.pre("save", function (next) {
  this.modified_at = new Date(); // Update modified_at to the current date and time
  next();
});