import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 90 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

projectSchema.index({ createdBy: 1, name: 1 });
projectSchema.index({ members: 1 });

export default mongoose.model("Project", projectSchema);
