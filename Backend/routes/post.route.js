import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

import { 
  addComment,
  addNewPost,
  bookmarkPost,
  deletePost,
  dislikePost,
  getAllPost,
  getCommentsOfPost,
  getUserPost,
  likePost
} from "../controllers/post.controller.js";

const router = express.Router();

// ✅ Create new post
router.post("/addpost", isAuthenticated, upload.single("image"), addNewPost);

// ✅ Get all posts
router.get("/all", isAuthenticated, getAllPost);

// ✅ Get logged-in user's posts
router.get("/userpost/all", isAuthenticated, getUserPost);

// ✅ Like / dislike
router.get("/:id/like", isAuthenticated, likePost);
router.get("/:id/dislike", isAuthenticated, dislikePost);

// ✅ Comments
router.post("/:id/comment", isAuthenticated, addComment);
router.get("/:id/comment/all", isAuthenticated, getCommentsOfPost);  // FIXED ✅

// ✅ Delete post
router.delete("/delete/:id", isAuthenticated, deletePost);

// ✅ Bookmark
router.get("/:id/bookmark", isAuthenticated, bookmarkPost);

export default router;
