import mongoose from "mongoose";

export const TASK_STATUSES = ["Todo", "In Progress", "Done"];

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 800, default: "" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: TASK_STATUSES, default: "Todo" },
    dueDate: { type: Date, required: true }
  },
  { timestamps: true }
);

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ projectId: 1 });
taskSchema.index({ dueDate: 1 });

export default mongoose.model("Task", taskSchema);
