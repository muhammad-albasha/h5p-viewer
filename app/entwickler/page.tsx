"use client";

import { useState } from "react";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";
import Image from "next/image";

export default function EntwicklerPage() {
  const [imageError, setImageError] = useState(false);

  return (
    <>
      <Navbar />
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-secondary text-primary-content py-16 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots pattern-opacity-10 pattern-white pattern-size-2"></div>
        <div className="container-fluid mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Entwickler
            </h1>
            <p className="text-primary-content/80 text-lg">
              Informationen über den Entwickler des H5P-Viewers
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
        <div className="container-fluid mx-auto max-w-4xl px-4">
          
          {/* Developer Profile Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20 mb-8">
            <div className="relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-10"></div>
              
              <div className="relative p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  
                  {/* Profile Image */}
                  <div className="relative">
                    <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      {!imageError ? (
                        <Image
                          src="/uploads/developer/muhammad-albasha.jpg"
                          alt="Muhammad Albasha"
                          width={192}
                          height={192}
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="text-white text-center">
                          <svg
                            className="w-20 h-20 mx-auto mb-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div className="text-2xl font-bold">MA</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Information */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      Muhammad Albasha
                    </h2>
                    <p className="text-xl text-primary font-semibold mb-4">
                      IT-Entwickler
                    </p>
                    
                    {/* Contact Information */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <svg
                            className="w-5 h-5 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <a
                          href="mailto:muhammad.albasha@gmail.com"
                          className="text-gray-700 hover:text-primary transition-colors font-medium"
                        >
                          muhammad.albasha@gmail.com
                        </a>
                      </div>
                      
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <svg
                            className="w-5 h-5 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8z"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-700 font-medium">
                          Bereich: Informationstechnologie
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/20 mb-8">
            <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Technische Expertise</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Frontend-Entwicklung</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-gray-700">React.js & Next.js</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-gray-700">TypeScript</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-gray-700">Tailwind CSS</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Backend-Entwicklung</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-gray-700">Node.js</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-gray-700">Datenbank-Design</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-gray-700">API-Entwicklung</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-gray-700">Java</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-gray-700">Springboot</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Project Information */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/20">
            <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">H5P-Viewer Projekt</h3>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                Der H5P-Viewer ist eine moderne Webanwendung, die entwickelt wurde, um 
                interaktive H5P-Inhalte einfach und effektiv zu präsentieren. Das Projekt 
                umfasst Features wie:
              </p>
              
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-gray-700">Benutzerfreundliche Oberfläche</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-gray-700">Responsive Design</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-gray-700">Sichere Authentifizierung mit 2FA</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-gray-700">Content-Management-System</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-gray-700">Erweiterte Filtermöglichkeiten</span>
                </li>
              </ul>
              
              <div className="mt-6">
                <a
                  href="mailto:muhammad.albasha@gmail.com"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Kontakt aufnehmen
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
