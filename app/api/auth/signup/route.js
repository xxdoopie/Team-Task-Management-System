import { NextResponse } from 'next/server';
import connectDB from '@/app/(lib)/mongodb.js';
import User from '@/app/(models)/User';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email, password, name, adminCode } = await request.json();
    
    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }
    
    // Determine role based on admin code
    // const role = adminCode === process.env.ADMIN_CODE ? 'admin' : 'employee';

    let role;

    if (adminCode === process.env.ADMIN_CODE) {
      role = 'admin';
    } else {
      role = 'employee';
    }
    
    // Create new user
    const user = new User({
      email,
      password, // Will be hashed by the pre-save middleware
      name,
      role,
      completionRate: 0 // Set default completion rate to 0
    });
    
    await user.save();
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword
    }, { status: 201 });
    
  } catch (error) {
    console.error('Signup error:', error.message, error.stack);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}