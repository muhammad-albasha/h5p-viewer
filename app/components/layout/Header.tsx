"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { BiUserCircle } from "react-icons/bi";
import { MdDashboard } from "react-icons/md";
import { useSession, signOut } from "next-auth/react";

const Header = () => {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isDropdownOpen || isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isMobileMenuOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isDropdownOpen) setIsDropdownOpen(false);
  };

  return (
    <header className="bg-primary py-4 px-4 shadow-sm relative">
      <div className="container-fluid mx-auto flex justify-between items-center">
        {" "}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img
              src="/assets/logo_header_white.svg"
              alt="H5P Logo"
              className="h-12 w-auto sm:h-16 md:h-20 sm:w-auto md:w-60 brightness-100 dark:brightness-0 transition-all duration-200"
            />
          </Link>
        </div>
        <button
          className={`md:hidden btn btn-ghost btn-sm min-w-12 min-h-12 p-3 focus:outline-none focus:ring-2 focus:ring-white/30 rounded-lg transition-all duration-200 ${
            isMobileMenuOpen ? "bg-white/10" : "hover:bg-white/10"
          }`}
          onClick={toggleMobileMenu}
          aria-label="Menü"
          
        >
          <div className="space-y-1.5 w-6 h-6 flex flex-col justify-center">
            <div
              className={`w-6 h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            ></div>
            <div
              className={`w-6 h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            ></div>
            <div
              className={`w-6 h-0.5 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            ></div>
          </div>
          <span className="sr-only">Menü</span>
        </button>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-5">
          <Link
            href="/"
            className="text-white hover:scale-105 transition-colors duration-200 px-2 py-1 rounded-md hover:bg-primary/10"
          >
            Startseite
          </Link>
          <Link
            href="/h5p"
            className="text-white hover:scale-105 transition-colors duration-200 px-2 py-1 rounded-md hover:bg-primary/10"
          >
            Alle Inhalte
          </Link>
          <Link
            href="/bereiche"
            className="text-white hover:scale-105 transition-colors duration-200 px-2 py-1 rounded-md hover:bg-primary/10"
          >
            Bereiche
          </Link>
          <div className="relative" ref={dropdownRef}>
            {" "}
            <button
              className={`w-8 h-8 rounded-full hover:bg-base-content/5 flex items-center justify-center transition-all duration-150 focus:outline-none focus:bg-base-content/10 active:scale-95 ${
                isDropdownOpen ? "bg-base-content/10" : ""
              }`}
              onClick={toggleDropdown}
              aria-label="Einstellungen"
              aria-controls="settings-dropdown"
              aria-haspopup="menu"
            >
              <FiSettings
                size={16}
                className={`transition-all duration-200 text-white ${
                  isDropdownOpen ? "rotate-90 text-base-content" : ""
                }`}
              />
              <span className="sr-only">Einstellungen</span>
            </button>
            {isDropdownOpen && (
              <div
                id="settings-dropdown"
                role="menu"
                className="absolute right-0 mt-2 w-52 rounded-xl bg-base-100 shadow-xl p-3 z-50 animate-fade-in-down border border-base-300"
              >
                <div className="space-y-1">
                  {status === "authenticated" && session?.user ? (
                    <>
                      {" "}
                      <div className="px-3 py-2 text-sm text-base-content/70 border-b border-base-300 mb-2">
                        {session.user.name || "Benutzer"}
                      </div>
                      <Link
                        href="/admin"
                        role="menuitem"
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-primary/10 transition-all duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <MdDashboard size={18} className="text-primary" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        role="menuitem"
                        onClick={() => {
                          signOut({ callbackUrl: "/" });
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-primary/10 transition-all duration-200 text-left"
                      >
                        <FiLogOut size={18} className="text-primary" />
                        <span>Abmelden</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      role="menuitem"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-primary/10 transition-all duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <BiUserCircle size={18} className="text-primary" />
                      <span>Anmelden</span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="absolute top-full left-0 right-0 bg-base-100 shadow-xl p-4 z-[60] animate-fade-in-down md:hidden border-t border-base-200"
          >
            <nav className="flex flex-col space-y-1">
              <Link
                href="/"
                className="text-base-content hover:text-primary px-4 py-3 rounded-md hover:bg-primary/10 transition-all duration-200 text-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Startseite
              </Link>
              <Link
                href="/h5p"
                className="text-base-content hover:text-primary px-4 py-3 rounded-md hover:bg-primary/10 transition-all duration-200 text-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Alle Inhalte
              </Link>
              <Link
                href="/bereiche"
                className="text-base-content hover:text-primary px-4 py-3 rounded-md hover:bg-primary/10 transition-all duration-200 text-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Bereiche
              </Link>
              <div className="border-t border-base-300 my-3"></div>
              {status === "authenticated" && session?.user ? (
                <>
                  <div className="px-4 py-2 text-sm text-base-content/70 border-b border-base-300 mb-2">
                    Angemeldet als: {session.user.name || "Benutzer"}
                  </div>
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-primary/10 transition-all duration-200 text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <MdDashboard size={20} className="text-primary" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-primary/10 transition-all duration-200 text-left w-full text-lg font-medium"
                  >
                    <FiLogOut size={20} className="text-primary" />
                    <span>Abmelden</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-primary/10 transition-all duration-200 text-lg font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BiUserCircle size={20} className="text-primary" />
                  <span>Anmelden</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
