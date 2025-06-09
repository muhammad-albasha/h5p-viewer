"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TwoFactorManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      checkTwoFactorStatus();
    }
  }, [status, router]);

  const checkTwoFactorStatus = async () => {
    try {
      const response = await fetch("/api/auth/2fa");
      if (response.ok) {
        const data = await response.json();
        setIs2FAEnabled(data.enabled);
      }
    } catch (error) {
      console.error("Error checking 2FA status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    if (!confirm("Sind Sie sicher, dass Sie die Zwei-Faktor-Authentifizierung deaktivieren möchten? Dies verringert die Sicherheit Ihres Kontos.")) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "disable" }),
      });

      if (response.ok) {
        setIs2FAEnabled(false);
        setSuccess("Zwei-Faktor-Authentifizierung wurde erfolgreich deaktiviert.");
      } else {
        throw new Error("Failed to disable 2FA");
      }
    } catch (error) {
      setError("Fehler beim Deaktivieren der 2FA. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-base-300">
            <h1 className="text-2xl font-bold">Zwei-Faktor-Authentifizierung verwalten</h1>
            <p className="text-sm opacity-70 mt-2">
              Erhöhen Sie die Sicherheit Ihres Kontos
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="alert alert-error mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-base-300 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${is2FAEnabled ? 'bg-success' : 'bg-error'}`}></div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Status: {is2FAEnabled ? 'Aktiviert' : 'Deaktiviert'}
                    </h3>
                    <p className="text-sm opacity-70">
                      {is2FAEnabled 
                        ? 'Ihr Konto ist mit 2FA geschützt'
                        : 'Ihr Konto ist nicht mit 2FA geschützt'
                      }
                    </p>
                  </div>
                </div>
                <div className={`badge ${is2FAEnabled ? 'badge-success' : 'badge-error'}`}>
                  {is2FAEnabled ? 'Sicher' : 'Unsicher'}
                </div>
              </div>

              {!is2FAEnabled ? (
                <div className="space-y-4">
                  <div className="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.856-.833-2.626 0L3.228 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h3 className="font-bold">Empfehlung: 2FA aktivieren</h3>
                      <div className="text-xs">
                        Die Zwei-Faktor-Authentifizierung fügt eine zusätzliche Sicherheitsebene zu Ihrem Konto hinzu und schützt vor unbefugtem Zugriff.
                      </div>
                    </div>
                  </div>

                  <div className="bg-base-200 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Was ist 2FA?</h4>
                    <ul className="text-sm space-y-1 opacity-70">
                      <li>• Zusätzlicher Schutz neben Ihrem Passwort</li>
                      <li>• Verwendung einer Authenticator-App auf Ihrem Smartphone</li>
                      <li>• Zeitbasierte Codes, die alle 30 Sekunden wechseln</li>
                      <li>• Schutz vor Passwort-Diebstahl und Phishing</li>
                    </ul>
                  </div>

                  <Link 
                    href="/auth/2fa/setup"
                    className="btn btn-primary btn-lg w-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    2FA jetzt einrichten
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-bold">Gut gemacht!</h3>
                      <div className="text-xs">
                        Ihr Konto ist mit Zwei-Faktor-Authentifizierung geschützt. Bei jeder Anmeldung wird ein Code von Ihrer Authenticator-App angefordert.
                      </div>
                    </div>
                  </div>

                  <div className="bg-base-200 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Wichtige Hinweise:</h4>
                    <ul className="text-sm space-y-1 opacity-70">
                      <li>• Bewahren Sie Ihre Backup-Codes sicher auf</li>
                      <li>• Stellen Sie sicher, dass Ihre Authenticator-App gesichert ist</li>
                      <li>• Bei Verlust Ihres Geräts können Sie Backup-Codes verwenden</li>
                      <li>• Kontaktieren Sie den Administrator bei Problemen</li>
                    </ul>
                  </div>

                  <button
                    onClick={disableTwoFactor}
                    className={`btn btn-error btn-outline w-full ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.856-.833-2.626 0L3.228 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    {isLoading ? 'Deaktiviere...' : '2FA deaktivieren'}
                  </button>
                </div>
              )}

              <div className="border-t border-base-300 pt-6">
                <Link 
                  href="/admin"
                  className="btn btn-ghost"
                >
                  ← Zurück zum Admin-Bereich
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
