import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    // ✅ No token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login."
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    // ✅ Attach user id to request
    req.id = decoded.userId;

    next();

  } catch (error) {
    console.error("Auth middleware error:", error.message);

    // ✅ Token expired or tampered
    return res.status(401).json({
      success: false,
      message: "Session expired. Please login again."
    });
  }
};

export default isAuthenticated;
