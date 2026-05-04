import express from "express";
import { protect } from "../middleware/auth.js";
import Task, { TASK_STATUSES } from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const taskQuery = req.user.role === "Admin" ? {} : { assignedTo: req.user._id };
    const tasks = await Task.find(taskQuery)
      .populate("projectId", "name")
      .populate("assignedTo", "name email role")
      .sort({ dueDate: 1 })
      .lean();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const statusSummary = TASK_STATUSES.reduce((summary, status) => {
      summary[status] = 0;
      return summary;
    }, {});

    for (const task of tasks) {
      statusSummary[task.status] += 1;
    }

    const overdueTasks = tasks.filter((task) => task.status !== "Done" && new Date(task.dueDate) < today);

    res.json({
      statusSummary,
      totalTasks: tasks.length,
      overdueTasks,
      myTasks: tasks.slice(0, 8)
    });
  })
);

export default router;
