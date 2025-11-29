import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { getReceiverSocketId, getIO } from "../socket/socket.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  maxAge: 24 * 60 * 60 * 1000,
};


/* ========================= REGISTER ========================= */
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully"
    });

  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({ success: false });
  }
};


/* ========================= LOGIN ========================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d"
    });

    const populatedPosts = await Promise.all(
      user.posts.map(id => Post.findById(id))
    );

    const safeUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: populatedPosts
    };

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: `Welcome back ${user.username}`,
      user: safeUser
    });

  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ success: false });
  }
};


/* ========================= LOGOUT ========================= */
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (error) {
    console.error("Logout error:", error.message);
    return res.status(500).json({ success: false });
  }
};


/* ========================= PROFILE ========================= */
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .populate("posts")
      .populate("bookmarks")
      .select("-password");

    if (!user) {
      return res.status(404).json({ success: false });
    }

    return res.status(200).json({ success: true, user });

  } catch (error) {
    console.error("Get profile error:", error.message);
    res.status(500).json({ success: false });
  }
};


/* ========================= EDIT PROFILE ========================= */
export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;

    let cloudImage;

    if (req.file) {
      const fileUri = getDataUri(req.file);
      const upload = await cloudinary.uploader.upload(fileUri);
      cloudImage = upload.secure_url;
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false });

    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (cloudImage) user.profilePicture = cloudImage;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user
    });

  } catch (error) {
    console.error("Edit profile error:", error.message);
    res.status(500).json({ success: false });
  }
};


/* ========================= SUGGESTED USERS ========================= */
export const getSuggestedUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.id } })
      .select("-password");

    return res.status(200).json({ success: true, users });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};


/* ========================= FOLLOW / UNFOLLOW ========================= */
export const followOrUnfollow = async (req, res) => {
  try {
    const userId = req.id;
    const targetId = req.params.id;

    if (userId === targetId) {
      return res.status(400).json({
        success: false,
        message: "Cannot follow yourself"
      });
    }

    const currentUser = await User.findById(userId);
    const targetUser = await User.findById(targetId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ success: false });
    }

    const isFollowing = currentUser.following.includes(targetId);

    if (isFollowing) {
      currentUser.following.pull(targetId);
      targetUser.followers.pull(userId);
      await Promise.all([currentUser.save(), targetUser.save()]);
      return res.status(200).json({ success: true, message: "Unfollowed" });
    }

    currentUser.following.push(targetId);
    targetUser.followers.push(userId);
    await Promise.all([currentUser.save(), targetUser.save()]);

    const socketId = getReceiverSocketId(targetId);
    const io = getIO();

    if (socketId && io) {
      io.to(socketId).emit("notification", {
        type: "follow",
        userId,
        userDetails: {
          username: currentUser.username,
          profilePicture: currentUser.profilePicture
        }
      });
    }

    return res.status(200).json({ success: true, message: "Followed" });

  } catch (error) {
    console.error("Follow error:", error.message);
    res.status(500).json({ success: false });
  }
};
