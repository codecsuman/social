import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    default: "",
    maxlength: 200
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"]
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  }]
}, { timestamps: true });

// ✅ Fast profile lookup
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

export const User = mongoose.model("User", userSchema);
