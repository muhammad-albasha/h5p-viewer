import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { TwoFactorService } from '@/app/services/TwoFactorService';
import { UserService } from '@/app/services/UserService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const twoFactorService = new TwoFactorService();
    const isEnabled = await twoFactorService.is2FAEnabled(parseInt(session.user.id));

    return NextResponse.json({ enabled: isEnabled });
  } catch (error) {
    console.error('Error checking 2FA status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, token, secret } = await request.json();
    const twoFactorService = new TwoFactorService();
    const userService = new UserService();

    switch (action) {
      case 'generate':
        const user = await userService.findById(parseInt(session.user.id));
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { secret: newSecret, qrCodeUrl, backupCodes } = twoFactorService.generateSecret(
          user.username,
          user.email
        );
        
        const qrCodeDataUrl = await twoFactorService.generateQRCode(qrCodeUrl);

        return NextResponse.json({
          secret: newSecret,
          qrCode: qrCodeDataUrl,
          backupCodes
        });

      case 'enable':
        if (!token || !secret) {
          return NextResponse.json({ error: 'Token and secret are required' }, { status: 400 });
        }

        const isValidToken = twoFactorService.verifyToken(secret, token);
        if (!isValidToken) {
          return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
        }

        const enabled = await twoFactorService.enable2FA(parseInt(session.user.id), secret);
        if (!enabled) {
          return NextResponse.json({ error: 'Failed to enable 2FA' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

      case 'disable':
        const disabled = await twoFactorService.disable2FA(parseInt(session.user.id));
        if (!disabled) {
          return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

      case 'verify':
        if (!token) {
          return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        const isValid = await twoFactorService.verify2FAForUser(parseInt(session.user.id), token);
        return NextResponse.json({ valid: isValid });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in 2FA API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
