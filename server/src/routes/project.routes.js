import express from "express";
import mongoose from "mongoose";
import { protect, requireAdmin } from "../middleware/auth.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const query = req.user.role === "Admin" ? { $or: [{ createdBy: req.user._id }, { members: req.user._id }] } : { members: req.user._id };
    const projects = await Project.find(query)
      .populate("createdBy", "name email role")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    res.json(projects);
  })
);

router.post(
  "/",
  protect,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name, description = "", members = [] } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const memberInput = Array.isArray(members) ? members : [members].filter(Boolean);
    const uniqueMemberIds = [...new Set(memberInput)].filter((id) => mongoose.Types.ObjectId.isValid(id));
    const memberCount = uniqueMemberIds.length ? await User.countDocuments({ _id: { $in: uniqueMemberIds }, role: "Member" }) : 0;

    if (memberCount !== uniqueMemberIds.length) {
      return res.status(400).json({ message: "Every project member must be a valid member user" });
    }

    const project = await Project.create({ name, description, createdBy: req.user._id, members: uniqueMemberIds });
    const populated = await project.populate([
      { path: "createdBy", select: "name email role" },
      { path: "members", select: "name email role" }
    ]);

    res.status(201).json(populated);
  })
);

router.post(
  "/:id/add-member",
  protect,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { memberId, email } = req.body;

    if (!memberId && !email) {
      return res.status(400).json({ message: "memberId or email is required" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const user = memberId ? await User.findOne({ _id: memberId, role: "Member" }) : await User.findOne({ email, role: "Member" });
    if (!user) {
      return res.status(404).json({ message: "Member user not found" });
    }

    project.members.addToSet(user._id);
    await project.save();

    const populated = await project.populate([
      { path: "createdBy", select: "name email role" },
      { path: "members", select: "name email role" }
    ]);

    res.json(populated);
  })
);

export default router;
