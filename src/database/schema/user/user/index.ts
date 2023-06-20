import mongoose from "mongoose";
export const UserSchema = new mongoose.Schema({
    email: {
      type: String,
      unique: true,
      length: 100,
      index: true,
      required: true,
    },
    phone:{
      type: String,
      length: 20,
      default: null,
      index: true,
    },
    password: {
      type: String,
      length: 170,
      required: true,
    },
    email_verified:{
      type: Boolean,
      default: false
    },
    phone_verified:{
      type: Boolean,
      default: false
    },
    is_banned: {
      type: Boolean,
      default: false
    },
    is_account_deactive: {
      type: Boolean,
      default: false,
      Comment: 'if account is temporarly deactivated'
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
  
  UserSchema.pre("save", function (next) {
    this.modified_at = new Date(); // Update modified_at to the current date and time
    next();
  });