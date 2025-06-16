"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";

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
      <>
        <Navbar />
        <Header />
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">2FA-Einstellungen werden geladen...</p>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <Navbar />
      <Header />
      
      {/* Modern Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-48 -translate-y-48 backdrop-blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48 backdrop-blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full -translate-x-32 -translate-y-32 backdrop-blur-2xl"></div>
        </div>
        
        <div className="relative container-fluid mx-auto  px-4 py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Zwei-Faktor-Authentifizierung
                </h1>
              </div>
              <p className="text-blue-100 text-lg max-w-2xl">
                Erhöhen Sie die Sicherheit Ihres Kontos mit 2FA
              </p>
            </div>
            <Link 
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105 border border-white/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Zurück zum Dashboard
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
        <div className="container-fluid mx-auto  px-4">
          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700 font-medium">{success}</span>
              </div>
            </div>
          )}

          {/* Status Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold">2FA-Status</h2>
              </div>
              <p className="text-blue-100 mt-2 text-sm">
                Aktueller Sicherheitsstatus Ihres Kontos
              </p>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${is2FAEnabled ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Status: {is2FAEnabled ? 'Aktiviert' : 'Deaktiviert'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {is2FAEnabled 
                        ? 'Ihr Konto ist mit 2FA geschützt'
                        : 'Ihr Konto ist nicht mit 2FA geschützt'
                      }
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                  is2FAEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {is2FAEnabled ? 'Sicher' : 'Unsicher'}
                </span>
              </div>
            </div>
          </div>

          {!is2FAEnabled ? (
            /* 2FA Setup Section */
            <div className="space-y-6">
              {/* Warning Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.856-.833-2.626 0L3.228 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold">Empfehlung: 2FA aktivieren</h2>
                  </div>
                  <p className="text-amber-100 mt-2 text-sm">
                    Schützen Sie Ihr Konto vor unbefugtem Zugriff
                  </p>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-700 mb-4">
                    Die Zwei-Faktor-Authentifizierung fügt eine zusätzliche Sicherheitsebene zu Ihrem Konto hinzu und schützt vor unbefugtem Zugriff.
                  </p>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold">Was ist 2FA?</h2>
                  </div>
                  <p className="text-blue-100 mt-2 text-sm">
                    Erfahren Sie mehr über die Zwei-Faktor-Authentifizierung
                  </p>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">Zusätzlicher Schutz neben Ihrem Passwort</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">Verwendung einer Authenticator-App auf Ihrem Smartphone</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">Zeitbasierte Codes, die alle 30 Sekunden wechseln</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">Schutz vor Passwort-Diebstahl und Phishing</span>
                    </li>
                  </ul>
                  
                  <div className="mt-6">
                    <Link 
                      href="/auth/2fa/setup"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      2FA jetzt einrichten
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 2FA Enabled Section */
            <div className="space-y-6">
              {/* Success Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold">Gut gemacht!</h2>
                  </div>
                  <p className="text-green-100 mt-2 text-sm">
                    Ihr Konto ist optimal geschützt
                  </p>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-700 mb-4">
                    Ihr Konto ist mit Zwei-Faktor-Authentifizierung geschützt. Bei jeder Anmeldung wird ein Code von Ihrer Authenticator-App angefordert.
                  </p>
                </div>
              </div>

              {/* Important Notes Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold">Wichtige Hinweise</h2>
                  </div>
                  <p className="text-blue-100 mt-2 text-sm">
                    Behalten Sie diese Sicherheitstipps im Auge
                  </p>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">Bewahren Sie Ihre Backup-Codes sicher auf</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">Stellen Sie sicher, dass Ihre Authenticator-App gesichert ist</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">Bei Verlust Ihres Geräts können Sie Backup-Codes verwenden</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">Kontaktieren Sie den Administrator bei Problemen</span>
                    </li>
                  </ul>
                  
                  <div className="mt-6">
                    <button
                      onClick={disableTwoFactor}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Deaktiviere...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.856-.833-2.626 0L3.228 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          2FA deaktivieren
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
