import express from "express";
import { protect, requireAdmin } from "../middleware/auth.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get(
  "/",
  protect,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).select("-password").sort({ name: 1 });
    res.json(users);
  })
);

export default router;
