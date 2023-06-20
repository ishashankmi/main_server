import mongoose from "mongoose";

export const UserJoinGroupSchema = new mongoose.Schema({
  group_id: {
    type: mongoose.Schema.Types.String,
    ref: "UserJoin",
    required: true,
    index: true,
    unique: true
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  modified_at: {
    type: Date,
    default: Date.now,
  }
});

UserJoinGroupSchema.pre("save", function (next) {
    this.modified_at = new Date(); // Update modified_at to the current date and time
    next();
  });
