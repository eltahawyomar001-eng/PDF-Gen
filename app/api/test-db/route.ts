import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Example API route to test Prisma connection
export async function GET() {
  try {
    // Test the database connection by counting companies
    const companyCount = await prisma.company.count();
    
    return NextResponse.json({
      success: true,
      message: 'Prisma is connected!',
      companyCount,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Database connection failed' },
      { status: 500 }
    );
  }
}
