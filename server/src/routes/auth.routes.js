import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

function createToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { name, email, password, role = "Member" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (!["Admin", "Member"].includes(role)) {
      return res.status(400).json({ message: "Role must be Admin or Member" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role });
    res.status(201).json({ token: createToken(user), user: publicUser(user) });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({ token: createToken(user), user: publicUser(user) });
  })
);

export default router;
