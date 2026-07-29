import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const protectAdmin = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretjwtkeyforadminauth123!");

    const admin = await Admin.findById(decoded.id).select("-password").lean();
    if (!admin) {
      return res.status(401).json({ message: "Admin user not found" });
    }

    req.admin = { id: String(admin._id), username: admin.username, email: admin.email };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};
