import mongoose from "mongoose";

export const RequestSchema = new mongoose.Schema({
  user_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserProfile",
    index: true,
  },
  lobby_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lobby',
    index: true,
  },
  status:{
    type: Number,
    default: 0 // [ 0 - pending, 1 - accepted, 2 - rejected, 3 - kicked ]
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

RequestSchema.pre("save", function (next) {
  this.modified_at = new Date(); 
  next();
});

