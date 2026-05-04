import express from "express";
import mongoose from "mongoose";
import { protect, requireAdmin } from "../middleware/auth.js";
import Project from "../models/Project.js";
import Task, { TASK_STATUSES } from "../models/Task.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { status, projectId } = req.query;
    const query = req.user.role === "Admin" ? {} : { assignedTo: req.user._id };

    if (status && status !== "All") {
      if (!TASK_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Invalid task status" });
      }
      query.status = status;
    }

    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ message: "Invalid project id" });
      }
      query.projectId = projectId;
    }

    const tasks = await Task.find(query)
      .populate("projectId", "name")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ dueDate: 1, createdAt: -1 });

    res.json(tasks);
  })
);

router.post(
  "/",
  protect,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { title, description = "", projectId, assignedTo, status = "Todo", dueDate } = req.body;

    if (!title?.trim() || !projectId || !assignedTo || !dueDate) {
      return res.status(400).json({ message: "Title, project, assignee, and due date are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({ message: "Project and assignee must be valid ids" });
    }

    if (!TASK_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid task status" });
    }

    const [project, assignee] = await Promise.all([
      Project.findById(projectId),
      User.findOne({ _id: assignedTo, role: "Member" })
    ]);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!assignee) {
      return res.status(404).json({ message: "Assigned member not found" });
    }

    const isProjectMember = project.members.some((member) => member.toString() === assignee._id.toString());
    if (!isProjectMember) {
      return res.status(400).json({ message: "Assignee must be a member of the project" });
    }

    const task = await Task.create({ title, description, projectId, assignedTo, createdBy: req.user._id, status, dueDate });
    const populated = await task.populate([
      { path: "projectId", select: "name" },
      { path: "assignedTo", select: "name email role" },
      { path: "createdBy", select: "name email role" }
    ]);

    res.status(201).json(populated);
  })
);

router.patch(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.user.role !== "Admin" && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can update only your assigned tasks" });
    }

    if (req.user.role === "Member") {
      const { status } = req.body;
      if (!TASK_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Members can update task status only" });
      }
      task.status = status;
    } else {
      const allowedFields = ["title", "description", "assignedTo", "status", "dueDate"];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          task[field] = req.body[field];
        }
      }

      if (req.body.status && !TASK_STATUSES.includes(req.body.status)) {
        return res.status(400).json({ message: "Invalid task status" });
      }

      if (req.body.assignedTo) {
        if (!mongoose.Types.ObjectId.isValid(req.body.assignedTo)) {
          return res.status(400).json({ message: "Assignee must be a valid id" });
        }

        const [project, assignee] = await Promise.all([
          Project.findById(task.projectId),
          User.findOne({ _id: req.body.assignedTo, role: "Member" })
        ]);

        const isProjectMember = project?.members.some((member) => member.toString() === assignee?._id.toString());
        if (!assignee || !isProjectMember) {
          return res.status(400).json({ message: "Assignee must be a member of the project" });
        }
      }
    }

    await task.save();

    const populated = await task.populate([
      { path: "projectId", select: "name" },
      { path: "assignedTo", select: "name email role" },
      { path: "createdBy", select: "name email role" }
    ]);

    res.json(populated);
  })
);

export default router;
