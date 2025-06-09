import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { TwoFactorService } from '@/app/services/TwoFactorService';
import { getToken, encode } from 'next-auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    const session = await getServerSession(authOptions);
    
    console.log("2FA completion request:", { token, userId: session?.user?.id });
    
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
    
    console.log("Verifying 2FA for completion:", userId);
    const isValid = await twoFactorService.verify2FAForUser(userId, token.trim());
    
    console.log("2FA completion verification result:", isValid);

    if (isValid) {
      // Get the current JWT token
      const jwtToken = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET 
      });

      if (jwtToken) {
        // Update the JWT to remove the requiresTwoFactor flag
        const updatedToken = {
          ...jwtToken,
          requiresTwoFactor: false
        };

        // Encode the updated token
        const newJWT = await encode({
          token: updatedToken,
          secret: process.env.NEXTAUTH_SECRET || "your-secret-key"
        });

        // Set the updated token as a cookie
        const tokenName = process.env.NODE_ENV === 'production' 
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token';

        // Create response with updated cookie
        const response = NextResponse.json({ 
          success: true, 
          verified: true,
          message: "2FA verification successful"
        });

        response.cookies.set(tokenName, newJWT, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 60 * 60 // 30 days
        });

        console.log("2FA completion successful, session updated");
        return response;
      }

      return NextResponse.json({ 
        success: true, 
        verified: true,
        message: "2FA verification successful"
      });
    } else {
      console.log("Invalid token provided for completion");
      return NextResponse.json({ 
        error: 'Invalid token',
        verified: false 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error completing 2FA verification:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
