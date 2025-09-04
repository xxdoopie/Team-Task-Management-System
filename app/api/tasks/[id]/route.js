import { NextResponse } from 'next/server';
import connectDB from '@/app/(lib)/mongodb';
import Task from '@/app/(models)/Task';
import jwt from 'jsonwebtoken';
import User from '@/app/(models)/User';

async function verifyToken(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    throw new Error('No token provided');
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
}

// GET a specific task
export async function GET(request, { params }) {
  try {
    await connectDB();

    const user = await verifyToken(request);
    const { id } = params; // No need to await params in newer Next.js versions

    let task;
    if (user.role === 'admin') {
      // Admin can see all tasks they created
      task = await Task.findOne({ 
        _id: id, 
        createdBy: user.userId 
      })
        .populate('assignedTo', 'name email avatar')
        .populate('createdBy', 'name email')
        .lean();
    } else {
      // Employee can only see tasks assigned to them
      task = await Task.findOne({ 
        _id: id, 
        assignedTo: user.userId 
      })
        .populate('assignedTo', 'name email avatar')
        .populate('createdBy', 'name email')
        .lean();
    }

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Transform for frontend consistency
    const transformedTask = {
      ...task,
      id: task._id.toString(),
      _id: task._id.toString()
    };

    return NextResponse.json({ task: transformedTask });

  } catch (error) {
    console.error('Get task error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// Update employee completion rate when a task is completed
async function updateEmployeeCompletionRate(employeeId) {
  const totalTasks = await Task.countDocuments({ assignedTo: employeeId });
  const completedTasks = await Task.countDocuments({ assignedTo: employeeId, status: 'Completed' });

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  await User.findByIdAndUpdate(employeeId, { completionRate });
}

// PUT update task
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const user = await verifyToken(request);
    const { id } = params; // No need to await params
    const updateData = await request.json();
    
    console.log('Updating task with ID:', id);
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    
    // Find the task
    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Check permissions
    const canEdit = user.role === 'admin' || 
                   task.assignedTo.includes(user.userId) ||
                   task.createdBy.toString() === user.userId;
    
    if (!canEdit) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Clean the update data - remove fields that shouldn't be updated directly
    const cleanUpdateData = {
      ...updateData,
      updatedAt: new Date()
    };
    
    // Remove id field from update data to avoid conflicts
    delete cleanUpdateData.id;
    delete cleanUpdateData._id;
    
    console.log('Clean update data:', JSON.stringify(cleanUpdateData, null, 2));
    
    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      cleanUpdateData,
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .lean();

    console.log('Updated task from DB:', JSON.stringify(updatedTask, null, 2));

    // If task is completed, update completion rate for assigned employees
    if (cleanUpdateData.status === 'Completed') {
      for (const employeeId of updatedTask.assignedTo) {
        await updateEmployeeCompletionRate(employeeId._id || employeeId);
      }
    }
    
    // Transform for frontend consistency
    const transformedTask = {
      ...updatedTask,
      id: updatedTask._id.toString(),
      _id: updatedTask._id.toString()
    };
    
    return NextResponse.json({
      message: 'Task updated successfully',
      task: transformedTask
    });
    
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { error: 'Failed to update task: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE task
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const user = await verifyToken(request);
    const { id } = params; // No need to await params
    
    // Only admins can delete tasks, and only their own tasks
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const task = await Task.findOneAndDelete({ 
      _id: id, 
      createdBy: user.userId 
    });
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Task deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}