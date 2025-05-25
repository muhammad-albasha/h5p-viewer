import React from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/layout/Navbar';
import Header from '@/app/components/layout/Header';

export default function SetupHelpPage() {
  return (
    <>
      <Navbar />
      <Header />
      
      <div className="bg-gradient-to-br from-primary to-secondary text-primary-content py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Datenbank-Konfiguration
          </h1>
          <p className="text-primary-content/80 mt-2">
            Hilfe zur Einrichtung der Datenbank
          </p>
        </div>
      </div>
      
      <div className="bg-base-200 min-h-screen py-10">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-base-300">
              <h2 className="text-xl font-bold">Fehlerbehebung bei der Datenbankverbindung</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="prose max-w-none">
                <h3>Docker ist nicht gestartet</h3>
                <p>
                  Stellen Sie sicher, dass Docker auf Ihrem System installiert ist und läuft.
                  Führen Sie folgende Befehle aus:
                </p>
                <pre className="bg-base-200 p-4 rounded-lg overflow-x-auto">
                  <code>
                    docker --version
                    {'\n'}
                    docker-compose --version
                  </code>
                </pre>
                
                <h3>MySQL-Container starten</h3>
                <p>
                  Führen Sie folgenden Befehl im Projektverzeichnis aus, um die MySQL-Datenbank zu starten:
                </p>
                <pre className="bg-base-200 p-4 rounded-lg overflow-x-auto">
                  <code>docker-compose up -d</code>
                </pre>
                <p>
                  Überprüfen Sie, ob der Container läuft:
                </p>
                <pre className="bg-base-200 p-4 rounded-lg overflow-x-auto">
                  <code>docker ps</code>
                </pre>
                
                <h3>Umgebungsvariablen prüfen</h3>
                <p>
                  Stellen Sie sicher, dass die Datei <code>.env.local</code> im Hauptverzeichnis vorhanden ist
                  und folgende Werte enthält:
                </p>
                <pre className="bg-base-200 p-4 rounded-lg overflow-x-auto">
                  <code>
                    DB_HOST=localhost{'\n'}
                    DB_USER=root{'\n'}
                    DB_PASSWORD=12345{'\n'}
                    DB_NAME=h5p
                  </code>
                </pre>
                
                <h3>Datenbank manuell prüfen</h3>
                <p>
                  Sie können PHPMyAdmin unter <a href="http://localhost:8080" target="_blank" rel="noopener noreferrer">http://localhost:8080</a> aufrufen,
                  um die Datenbank zu überprüfen. Loggen Sie sich mit folgenden Daten ein:
                </p>
                <ul>
                  <li>Benutzername: <code>root</code></li>
                  <li>Passwort: <code>12345</code></li>
                </ul>
              </div>
              
              <Link href="/" className="btn btn-primary">
                Zurück zur Startseite
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
