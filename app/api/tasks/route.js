import { NextResponse } from "next/server";
import connectDB from "@/app/(lib)/mongodb";
import Task from "@/app/(models)/Task";
import User from "@/app/(models)/User";
import jwt from "jsonwebtoken";

async function verifyToken(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    throw new Error("No token provided");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
}

// GET tasks - returns different data based on user role
export async function GET(request) {
  try {
    await connectDB();

    const user = await verifyToken(request);

    if (user.role === "admin") {
      // Admin gets all tasks they created AND employee statistics
      const tasks = await Task.find({ createdBy: user.userId })
        .populate("assignedTo", "name email avatar completionRate")
        .populate("createdBy", "name email")
        .lean();

      // Transform tasks for frontend consistency
      const transformedTasks = tasks.map(task => ({
        ...task,
        id: task._id.toString(),
        _id: task._id.toString()
      }));

      // Aggregate employee statistics for admin dashboard
      const employeeStats = {};

      tasks.forEach((task) => {
        task.assignedTo.forEach((employee) => {
          if (!employeeStats[employee._id]) {
            employeeStats[employee._id] = {
              id: employee._id.toString(),
              name: employee.name,
              email: employee.email,
              avatar: employee.avatar,
              completionRate: employee.completionRate || 0,
              totalTasks: 0,
              pendingTasks: 0,
              inProgressTasks: 0,
              completedTasks: 0,
            };
          }

          employeeStats[employee._id].totalTasks += 1;
          if (task.status === "Pending") {
            employeeStats[employee._id].pendingTasks += 1;
          } else if (task.status === "In Progress") {
            employeeStats[employee._id].inProgressTasks += 1;
          } else if (task.status === "Completed") {
            employeeStats[employee._id].completedTasks += 1;
          }
        });
      });

      // Convert stats object to array
      const employees = Object.values(employeeStats);

      return NextResponse.json({ 
        tasks: transformedTasks,
        employees 
      });

    } else {
      // Employee gets only tasks assigned to them
      const tasks = await Task.find({ assignedTo: user.userId })
        .populate("assignedTo", "name email avatar completionRate")
        .populate("createdBy", "name email")
        .lean();

      // Transform tasks for frontend consistency
      const transformedTasks = tasks.map(task => ({
        ...task,
        id: task._id.toString(),
        _id: task._id.toString()
      }));

      return NextResponse.json({ 
        tasks: transformedTasks 
      });
    }

  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT verification failed:", err.message);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Normalize attachments: ensure `url` is set for both link and file types
    const normalizedAttachments = Array.isArray(body.attachments)
      ? body.attachments
          .filter(att => att && (att.type === "link" || att.type === "file"))
          .map(att => {
            if (att.type === "link" && att.value) {
              return {
                name: att.name || att.value,
                type: att.type,
                url: att.value, // Ensure `url` is set for links
              };
            } else if (att.type === "file" && att.url) {
              return {
                name: att.name || "Unnamed File",
                type: att.type,
                url: att.url, // Ensure `url` is set for files
                fileSize: att.fileSize,
                mimeType: att.mimeType,
              };
            }
            return null; // Filter out invalid attachments
          })
          .filter(Boolean) // Remove null values
      : [];

    const task = new Task({
      title: body.title,
      description: body.description || "",
      priority: body.priority || "Low Priority",
      dueDate: body.dueDate || null,
      assignedTo: Array.isArray(body.assignedMembers) ? body.assignedMembers.map(m => m._id) : [],
      todoItems: Array.isArray(body.todoItems) ? body.todoItems : [],
      attachments: normalizedAttachments,
      createdBy: decoded.userId, // use userId from token
      tags: body.tags || [],
      estimatedHours: body.estimatedHours || 0,
    });

    const savedTask = await task.save();
    
    // Populate the saved task
    const populatedTask = await Task.findById(savedTask._id)
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email")
      .lean();

    // Transform for frontend
    const transformedTask = {
      ...populatedTask,
      id: populatedTask._id.toString(),
      _id: populatedTask._id.toString()
    };

    return NextResponse.json({ message: "Task created successfully", task: transformedTask });

  } catch (error) {
    console.error("Create Task Error (API):", error.message, error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}