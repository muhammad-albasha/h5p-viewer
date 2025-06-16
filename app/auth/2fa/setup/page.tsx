"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface TwoFactorSetupData {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export default function TwoFactorSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<'generate' | 'verify' | 'complete'>('generate');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const generateSecret = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "generate" }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate 2FA secret");
      }

      const data = await response.json();
      setSetupData(data);
      setStep('verify');
    } catch (error) {
      setError("Fehler beim Generieren des 2FA-Secrets");
    } finally {
      setIsLoading(false);
    }
  };

  const enableTwoFactor = async () => {
    if (!setupData || !token) {
      setError("Bitte geben Sie den 6-stelligen Code ein");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "enable",
          token: token,
          secret: setupData.secret,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to enable 2FA");
      }

      setStep('complete');
    } catch (error: any) {
      setError(error.message === "Invalid token" ? "Ungültiger Code. Bitte versuchen Sie es erneut." : "Fehler beim Aktivieren der 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    if (!setupData) return;
    
    const content = setupData.backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'h5p-viewer-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-12">
      <div className="container-fluid mx-auto max-w-2xl px-4">
        <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-base-300">
            <h1 className="text-2xl font-bold">Zwei-Faktor-Authentifizierung einrichten</h1>
            <p className="text-sm opacity-70 mt-2">
              Erhöhen Sie die Sicherheit Ihres Kontos mit 2FA
            </p>
          </div>

          <div className="p-6">
            {step === 'generate' && (
              <div className="space-y-6">
                <div className="alert alert-info">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <h3 className="font-bold">Was ist Zwei-Faktor-Authentifizierung?</h3>
                    <div className="text-xs">
                      2FA fügt eine zusätzliche Sicherheitsebene zu Ihrem Konto hinzu. Sie benötigen sowohl Ihr Passwort als auch einen Code von Ihrer Authenticator-App.
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Schritt 1: Authenticator-App installieren</h3>
                  <p className="text-sm opacity-70">
                    Falls noch nicht geschehen, installieren Sie eine Authenticator-App wie:
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                    <li>Google Authenticator</li>
                    <li>Microsoft Authenticator</li>
                    <li>Authy</li>
                    <li>1Password</li>
                  </ul>
                </div>

                <button 
                  onClick={generateSecret}
                  className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Generiere Secret...' : '2FA einrichten'}
                </button>
              </div>
            )}

            {step === 'verify' && setupData && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Schritt 2: QR-Code scannen</h3>
                  <p className="text-sm opacity-70">
                    Scannen Sie diesen QR-Code mit Ihrer Authenticator-App:
                  </p>
                  
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <Image
                      src={setupData.qrCode}
                      alt="2FA QR Code"
                      width={200}
                      height={200}
                      className="border rounded"
                    />
                  </div>

                  <div className="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.856-.833-2.626 0L3.228 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h3 className="font-bold">Backup-Codes speichern!</h3>
                      <div className="text-xs">
                        Laden Sie Ihre Backup-Codes herunter und bewahren Sie sie sicher auf. Sie können diese verwenden, falls Sie Ihr Telefon verlieren.
                      </div>
                      <button 
                        onClick={downloadBackupCodes}
                        className="btn btn-sm btn-outline mt-2"
                      >
                        Backup-Codes herunterladen
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Schritt 3: Code eingeben</h3>
                  <p className="text-sm opacity-70">
                    Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein:
                  </p>
                  
                  <div className="form-control">
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="input input-bordered text-center text-2xl tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>

                  {error && (
                    <div className="alert alert-error">
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    onClick={enableTwoFactor}
                    className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading || token.length !== 6}
                  >
                    {isLoading ? 'Aktiviere 2FA...' : '2FA aktivieren'}
                  </button>
                </div>
              </div>
            )}

            {step === 'complete' && (
              <div className="space-y-6 text-center">
                <div className="text-6xl">🎉</div>
                <div>
                  <h3 className="text-xl font-bold text-success">2FA erfolgreich aktiviert!</h3>
                  <p className="text-sm opacity-70 mt-2">
                    Ihr Konto ist jetzt mit Zwei-Faktor-Authentifizierung geschützt.
                  </p>
                </div>

                <div className="alert alert-success">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-bold">Was passiert als Nächstes?</h3>
                    <div className="text-xs">
                      Bei Ihrer nächsten Anmeldung werden Sie nach einem Code aus Ihrer Authenticator-App gefragt.
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/admin')}
                  className="btn btn-primary"
                >
                  Zum Admin-Bereich
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
