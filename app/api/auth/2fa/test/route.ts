import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/app/services/UserService';
import { TwoFactorService } from '@/app/services/TwoFactorService';

export async function GET(request: NextRequest) {
  try {
    console.log("Testing 2FA functionality...");
    
    const userService = new UserService();
    const twoFactorService = new TwoFactorService();
    
    // Test finding users
    const users = await userService.findAll();
    console.log("Found users:", users.length);
    
    // Test generating a secret
    const { secret, qrCodeUrl, backupCodes } = twoFactorService.generateSecret("testuser", "test@example.com");
    console.log("Generated secret:", { secretLength: secret.length, qrCodeUrl, backupCodesCount: backupCodes.length });
    
    // Test token verification with a dummy token
    const testResult = twoFactorService.verifyToken(secret, "123456");
    console.log("Test verification result:", testResult);
    
    return NextResponse.json({ 
      status: "OK",
      usersCount: users.length,
      secretGenerated: true,
      testVerification: testResult
    });
  } catch (error) {
    console.error('Error in 2FA test:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
