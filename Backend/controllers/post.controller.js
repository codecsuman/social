import sharp from "sharp"
import cloudinary from "../utils/cloudinary.js"
import { Post } from "../models/post.model.js"
import { User } from "../models/user.model.js"
//import { Comment } from "../models/comment.model.js";
import { Comment } from "../models/comment.model.js";

//import { getReceiverSocketId, getIO } from "../socket/socket.js";
import { getReceiverSocketId, getIO } from "../socket/socket.js";



// ✅ ADD POST
export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body
    const image = req.file
    const authorId = req.id

    if (!image) {
      return res.status(400).json({ success: false, message: "Image required" })
    }

    // ✅ Optimize image
    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({ width: 800, height: 800, fit: "inside" })
      .jpeg({ quality: 80 })
      .toBuffer()

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`
    const cloudResponse = await cloudinary.uploader.upload(fileUri)

    // ✅ Create post
    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    })

    const user = await User.findById(authorId)
    if (user) {
      user.posts.push(post._id)
      await user.save()
    }

    await post.populate("author", "-password")

    return res.status(201).json({
      success: true,
      message: "New post added",
      post,
    })

  } catch (error) {
    console.error("Add post error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}


// ✅ GET ALL POSTS
export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "username profilePicture")
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "author",
          select: "username profilePicture",
        }
      })

    return res.status(200).json({ success: true, posts })

  } catch (error) {
    console.error("Get posts error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}


// ✅ GET USER POSTS
export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id

    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate("author", "username profilePicture")
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "author",
          select: "username profilePicture",
        }
      })

    return res.status(200).json({ success: true, posts })

  } catch (error) {
    console.error("Get user posts error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}


// ✅ LIKE POST
export const likePost = async (req, res) => {
  try {
    const userId = req.id
    const postId = req.params.id

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" })
    }

    // ✅ Prevent duplicate likes
    if (post.likes.includes(userId)) {
      return res.status(400).json({ success: false, message: "Already liked" })
    }

    post.likes.push(userId)
    await post.save()

    // ✅ Notification
    const likedBy = await User.findById(userId)
      .select("username profilePicture")

    const ownerId = post.author.toString()

    if (ownerId !== userId) {
      const socketId = getReceiverSocketId(ownerId)

      if (socketId) {
        io.to(socketId).emit("notification", {
          type: "like",
          userId,
          userDetails: likedBy,
          postId,
        })
      }
    }

    return res.status(200).json({ success: true, message: "Post liked" })

  } catch (error) {
    console.error("Like post error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}


// ✅ DISLIKE POST
export const dislikePost = async (req, res) => {
  try {
    const userId = req.id
    const postId = req.params.id

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" })
    }

    post.likes = post.likes.filter(id => id.toString() !== userId)
    await post.save()

    const ownerId = post.author.toString()
    const user = await User.findById(userId)
      .select("username profilePicture")

    if (ownerId !== userId) {
      const socketId = getReceiverSocketId(ownerId)

      if (socketId) {
        io.to(socketId).emit("notification", {
          type: "dislike",
          userId,
          userDetails: user,
          postId,
        })
      }
    }

    return res.status(200).json({ success: true, message: "Post disliked" })

  } catch (error) {
    console.error("Dislike error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}


// ✅ ADD COMMENT
export const addComment = async (req, res) => {
  try {
    const userId = req.id
    const postId = req.params.id
    const { text } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Text required" })
    }

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" })
    }

    const comment = await Comment.create({
      text,
      author: userId,
      post: postId,
    })

    await comment.populate("author", "username profilePicture")

    post.comments.push(comment._id)
    await post.save()

    return res.status(201).json({
      success: true,
      message: "Comment Added",
      comment,
    })

  } catch (error) {
    console.error("Comment error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}


// ✅ GET COMMENTS
export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id

    const comments = await Comment.find({ post: postId })
      .populate("author", "username profilePicture")

    return res.status(200).json({ success: true, comments })

  } catch (error) {
    console.error("Get comments error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}


// ✅ DELETE POST
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id
    const authorId = req.id

    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" })
    }

    if (post.author.toString() !== authorId) {
      return res.status(403).json({ success: false, message: "Unauthorized" })
    }

    await Post.findByIdAndDelete(postId)
    await Comment.deleteMany({ post: postId })

    const user = await User.findById(authorId)
    user.posts = user.posts.filter(id => id.toString() !== postId)
    await user.save()

    return res.status(200).json({ success: true, message: "Post deleted" })

  } catch (error) {
    console.error("Delete error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}


// ✅ BOOKMARK POST
export const bookmarkPost = async (req, res) => {
  try {
    const userId = req.id
    const postId = req.params.id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    const exists = user.bookmarks.includes(postId)

    if (exists) {
      user.bookmarks.pull(postId)
      await user.save()
      return res.status(200).json({ success: true, type: "unsaved", message: "Removed from bookmarks" })
    }

    user.bookmarks.push(postId)
    await user.save()

    return res.status(200).json({ success: true, type: "saved", message: "Post bookmarked" })

  } catch (error) {
    console.error("Bookmark error:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}
