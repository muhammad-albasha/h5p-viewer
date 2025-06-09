import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/app/services/UserService';

export async function POST(request: NextRequest) {
  try {
    console.log("Resetting 2FA for admin user...");
    
    const userService = new UserService();
    
    // Reset 2FA for user ID 1 (admin)
    await userService.update(1, {
      twoFactorEnabled: false,
      twoFactorSecret: null
    });
    
    console.log("2FA reset completed for admin user");
    
    return NextResponse.json({ 
      status: "OK",
      message: "2FA reset successfully for admin user"
    });
  } catch (error) {
    console.error('Error resetting 2FA:', error);
    return NextResponse.json({ 
      error: 'Reset failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
