"use client";

import { Suspense } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";

// Separate component that uses useSearchParams
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError("Bitte geben Sie Benutzername und Passwort ein");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      const result = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (result?.error) {
        setError("Ungültiger Benutzername oder Passwort");
      } else {
        router.push(callbackUrl);
      }
    } catch (error) {
      // Login failed - show error message
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-base-200 min-h-screen">
      <div className="container mx-auto max-w-md py-12 px-4">
        <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-base-300">
            <h2 className="text-xl font-bold">Anmeldung</h2>
            <p className="text-sm opacity-70">Geben Sie Ihren Benutzernamen und Passwort ein</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-error/10 border-l-4 border-error p-4 rounded-r text-error-content">
                <p>{error}</p>
              </div>
            )}
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Benutzername</span>
              </label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input input-bordered w-full" 
                placeholder="admin"
              />
            </div>
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Passwort</span>
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full" 
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Anmeldung...' : 'Anmelden'}
            </button>
            
            <div className="text-center text-sm opacity-70 pt-4">
              <p>Zurück zur <Link href="/" className="text-primary hover:underline">Startseite</Link></p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

// Fallback component for Suspense
function LoginFormFallback() {
  return (
    <main className="bg-base-200 min-h-screen">
      <div className="container mx-auto max-w-md py-12 px-4">
        <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-base-300">
            <h2 className="text-xl font-bold">Anmeldung</h2>
            <p className="text-sm opacity-70">Lade Anmeldeformular...</p>
          </div>
          <div className="p-6 flex justify-center">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <Header />
      
      <div className="bg-gradient-to-br from-primary to-secondary text-primary-content py-12 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots pattern-opacity-10 pattern-white pattern-size-2"></div>
        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Administrator Login</h1>
          <p className="text-primary-content/80 mt-2">Melden Sie sich an, um H5P-Inhalte zu verwalten</p>
        </div>
      </div>
      
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </>
  );
}
