import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { TwoFactorService } from '@/app/services/TwoFactorService';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    const session = await getServerSession(authOptions);
    
    console.log("2FA verification request:", { token, userId: session?.user?.id });
    
    if (!session?.user?.id) {
      console.log("Unauthorized: No session or user ID");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!token) {
      console.log("Bad request: No token provided");
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const twoFactorService = new TwoFactorService();
    const userId = parseInt(session.user.id);
    
    console.log("Verifying 2FA for user:", userId);
    const isValid = await twoFactorService.verify2FAForUser(userId, token.trim());
    
    console.log("2FA verification result:", isValid);

    if (isValid) {
      // Create a response indicating successful verification
      return NextResponse.json({ 
        success: true, 
        verified: true,
        message: "2FA verification successful"
      });
    } else {
      console.log("Invalid token provided");
      return NextResponse.json({ 
        error: 'Invalid token',
        verified: false 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying 2FA token:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
