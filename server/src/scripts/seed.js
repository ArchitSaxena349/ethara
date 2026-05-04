import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

dotenv.config();

async function upsertUser({ name, email, password, role }) {
  return User.findOneAndUpdate(
    { email },
    { name, email, password: await bcrypt.hash(password, 10), role },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function seed() {
  await connectDB();

  const admin = await upsertUser({ name: "Demo Admin", email: "admin@example.com", password: "Admin123!", role: "Admin" });
  const member = await upsertUser({ name: "Demo Member", email: "member@example.com", password: "Member123!", role: "Member" });

  const project = await Project.findOneAndUpdate(
    { name: "Launch Website", createdBy: admin._id },
    { name: "Launch Website", description: "Demo project for the full-stack MVP walkthrough.", createdBy: admin._id, members: [member._id] },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const existingTasks = await Task.countDocuments({ projectId: project._id });
  if (!existingTasks) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    await Task.create([
      {
        title: "Draft onboarding checklist",
        description: "Prepare the first-pass launch checklist.",
        projectId: project._id,
        assignedTo: member._id,
        createdBy: admin._id,
        status: "Todo",
        dueDate: yesterday
      },
      {
        title: "Wire status dashboard",
        description: "Connect status counts to real task data.",
        projectId: project._id,
        assignedTo: member._id,
        createdBy: admin._id,
        status: "In Progress",
        dueDate: nextWeek
      }
    ]);
  }

  console.log("Seed complete");
  console.log("Admin: admin@example.com / Admin123!");
  console.log("Member: member@example.com / Member123!");
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
