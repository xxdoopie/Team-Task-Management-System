// get all employees for the team assignment
import { NextResponse } from 'next/server';
import connectDB from '@/app/(lib)/mongodb.js';
import User from '@/app/(models)/User';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET);

    // Get all active employees (exclude passwords)
    const employees = await User.find({ isActive: true, role: 'employee' })
      .select('-password')
      .sort({ name: 1 });

    return NextResponse.json({ employees });

  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}
