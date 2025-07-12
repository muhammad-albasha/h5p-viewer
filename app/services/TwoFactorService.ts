import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { UserService } from "./UserService";

export class TwoFactorService {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Generate a new 2FA secret for a user
   */
  generateSecret(
    username: string,
    email: string
  ): { secret: string; qrCodeUrl: string; backupCodes: string[] } {
    const secret = speakeasy.generateSecret({
      name: `H5P Viewer (${username})`,
      issuer: "H5P Viewer",
      length: 32,
    });

    const qrCodeUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: email,
      issuer: "H5P Viewer",
      encoding: "ascii",
    });

    // Generate backup codes (8 random 6-digit codes)
    const backupCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * Generate QR code data URL for the secret
   */
  async generateQRCode(qrCodeUrl: string): Promise<string> {
    try {
      return await QRCode.toDataURL(qrCodeUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw new Error("Failed to generate QR code");
    }
  }
  /**
   * Verify a TOTP token
   */
  verifyToken(secret: string, token: string): boolean {
    console.log("TwoFactorService: Verifying token", {
      secretLength: secret.length,
      token: token,
      tokenLength: token.length,
    });

    try {
      const result = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
        window: 2, // Allow 2 time steps before/after for clock skew
      });

      console.log("TwoFactorService: Speakeasy verification result", result);
      return result;
    } catch (error) {
      console.error("TwoFactorService: Error in speakeasy.totp.verify:", error);
      return false;
    }
  }

  /**
   * Enable 2FA for a user
   */
  async enable2FA(userId: number, secret: string): Promise<boolean> {
    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        return false;
      }

      await this.userService.update(userId, {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
      });

      return true;
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      return false;
    }
  }

  /**
   * Disable 2FA for a user
   */
  async disable2FA(userId: number): Promise<boolean> {
    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        return false;
      }

      await this.userService.update(userId, {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      });

      return true;
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      return false;
    }
  }

  /**
   * Check if user has 2FA enabled
   */
  async is2FAEnabled(userId: number): Promise<boolean> {
    try {
      const user = await this.userService.findById(userId);
      return user?.twoFactorEnabled === true;
    } catch (error) {
      console.error("Error checking 2FA status:", error);
      return false;
    }
  }
  /**
   * Verify 2FA token for a user
   */
  async verify2FAForUser(userId: number, token: string): Promise<boolean> {
    try {
      console.log(
        "TwoFactorService: Verifying 2FA for user",
        userId,
        "with token",
        token
      );

      const user = await this.userService.findById(userId);
      if (!user) {
        console.log("TwoFactorService: User not found");
        return false;
      }

      console.log("TwoFactorService: User found", {
        id: user.id,
        twoFactorEnabled: user.twoFactorEnabled,
        hasSecret: !!user.twoFactorSecret,
      });

      if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        console.log("TwoFactorService: 2FA not enabled or no secret");
        return false;
      }

      const result = this.verifyToken(user.twoFactorSecret, token);
      console.log("TwoFactorService: Token verification result", result);

      return result;
    } catch (error) {
      console.error("TwoFactorService: Error verifying 2FA token:", error);
      return false;
    }
  }
}
