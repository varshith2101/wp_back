const jwt = require("jsonwebtoken");
const User = require("../models/User");

const Auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) throw new Error("Authentication required");

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) throw new Error("User not found");

      // Check if user has required role
      if (roles.length && !roles.includes(user.role)) {
        throw new Error("Insufficient permissions");
      }

      req.user = user;
      next();
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  };
};

module.exports = Auth;