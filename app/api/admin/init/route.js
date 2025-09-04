import { NextResponse } from 'next/server';
import connectDB from "@/app/(lib)/mongodb";
import User from "@/app/(models)/Task";

export async function POST(request) {
  try {
    await connectDB();
    
    // Check if any admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists' },
        { status: 400 }
      );
    }
    
    // Create initial admin
    const admin = new User({
      email: 'admin@taskmanager.com',
      password: 'admin123', // Change this!
      name: 'System Administrator',
      role: 'admin'
    });
    
    await admin.save();
    
    return NextResponse.json({
      message: 'Initial admin created successfully',
      email: admin.email
    });
    
  } catch (error) {
    console.error('Init admin error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin' },
      { status: 500 }
    );
  }
}