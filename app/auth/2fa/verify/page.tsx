"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";
import { withBasePath } from "../../../utils/paths";

function TwoFactorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl") || withBasePath("/h5p");
  // If the callback URL is just the root path, redirect to H5P viewer instead
  const callbackUrl = rawCallbackUrl === "/" || rawCallbackUrl === withBasePath("/") 
    ? withBasePath("/h5p") 
    : rawCallbackUrl;

  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already fully authenticated
    const checkAuth = async () => {
      const session = await getSession();
      if (session && !session.user?.requiresTwoFactor) {
        router.push(callbackUrl);
      }
    };
    checkAuth();
  }, [router, callbackUrl]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || token.length !== 6) {
      setError("Bitte geben Sie einen 6-stelligen Code ein");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      console.log("Completing 2FA verification with token:", token);

      // Complete the 2FA verification and update session
      const response = await fetch(withBasePath("/api/auth/2fa/complete"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token.trim(),
        }),
      });

      const data = await response.json();
      console.log("2FA completion response:", data);

      if (!response.ok) {
        console.error("2FA completion failed:", data);
        setError(data.error || "Verifikation fehlgeschlagen");
        return;
      }

      if (data.verified) {
        console.log("2FA verification successful, redirecting...");
        // Force a page refresh to update the session
        window.location.href = callbackUrl;
      } else {
        setError("Ungültiger Code. Bitte versuchen Sie es erneut.");
      }
    } catch (error) {
      console.error("2FA completion error:", error);
      setError(
        "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-base-200 min-h-screen">
      <div className="container-fluid mx-auto max-w-md py-12 px-4">
        <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-base-300">
            <h2 className="text-xl font-bold">Zwei-Faktor-Authentifizierung</h2>
            <p className="text-sm opacity-70">
              Geben Sie den Code aus Ihrer Authenticator-App ein
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-error/10 border-l-4 border-error p-4 rounded-r text-error-content">
                <p>{error}</p>
              </div>
            )}

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">6-stelliger Code</span>
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) =>
                  setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="input input-bordered w-full text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                autoComplete="one-time-code"
              />
              <label className="label">
                <span className="label-text-alt opacity-70">
                  Code aus Google Authenticator, Authy oder ähnlicher App
                </span>
              </label>
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full ${isLoading ? "loading" : ""}`}
              disabled={isLoading || token.length !== 6}
            >
              {isLoading ? "Verifiziere..." : "Code verifizieren"}
            </button>

            <div className="text-center text-sm opacity-70 pt-4">
              <p>
                Haben Sie Probleme? Verwenden Sie einen Ihrer{" "}
                <span className="text-primary font-medium">Backup-Codes</span>
              </p>
              <p className="mt-2">
                Zurück zur{" "}
                <button
                  type="button"
                  onClick={() => router.push(withBasePath("/login"))}
                  className="text-primary hover:underline"
                >
                  Anmeldung
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function TwoFactorFormFallback() {
  return (
    <main className="bg-base-200 min-h-screen">
      <div className="container-fluid mx-auto max-w-md py-12 px-4">
        <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-base-300">
            <h2 className="text-xl font-bold">Zwei-Faktor-Authentifizierung</h2>
            <p className="text-sm opacity-70">Lade Verifizierungsformular...</p>
          </div>
          <div className="p-6 flex justify-center">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function TwoFactorPage() {
  return (
    <>
      <Navbar />
      <Header />

      <div className="bg-gradient-to-br from-primary to-secondary text-primary-content py-12 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots pattern-opacity-10 pattern-white pattern-size-2"></div>
        <div className="container-fluid mx-auto  px-4 relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Sicherheitsverifizierung
          </h1>
          <p className="text-primary-content/80 mt-2">
            Bestätigen Sie Ihre Identität mit 2FA
          </p>
        </div>
      </div>

      <Suspense fallback={<TwoFactorFormFallback />}>
        <TwoFactorForm />
      </Suspense>
    </>
  );
}
