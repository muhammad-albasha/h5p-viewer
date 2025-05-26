"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FiSettings, FiLogOut } from 'react-icons/fi';
import { BiUserCircle } from 'react-icons/bi';
import { MdDashboard } from 'react-icons/md';
import { useSession, signOut } from 'next-auth/react';

const Header = () => {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isDropdownOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
    <header className="bg-base-100 py-4 px-4 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold text-xl">
              H5P
            </div>
            <span className="ml-3 text-xl font-semibold">H5P Viewer</span>
          </Link>
        </div>
        
        {/* Mobile Menu Button */}        <button 
          className="md:hidden btn btn-ghost btn-sm px-2 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
          onClick={toggleMobileMenu}
          aria-label="Menü"
        >
          <div className="space-y-1.5">
            <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2 bg-primary' : ''}`}></div>
            <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></div>
            <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2 bg-primary' : ''}`}></div>
          </div>
          <span className="sr-only">Menü</span>
        </button>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-5">
          <Link href="/" className="text-base-content hover:text-primary transition-colors duration-200 px-2 py-1 rounded-md hover:bg-primary/10">
            Startseite
          </Link>
          <Link href="/h5p" className="text-base-content hover:text-primary transition-colors duration-200 px-2 py-1 rounded-md hover:bg-primary/10">
            Alle Inhalte
          </Link>
          <Link href="/fachbereich" className="text-base-content hover:text-primary transition-colors duration-200 px-2 py-1 rounded-md hover:bg-primary/10">
            Fachbereiche
          </Link>
          
          <div className="relative" ref={dropdownRef}>            <button 
              className="btn btn-circle btn-ghost flex items-center justify-center relative hover:bg-base-200/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
              onClick={toggleDropdown}
              aria-label="Einstellungen"
              aria-controls="settings-dropdown"
              aria-haspopup="menu"
            >
              <FiSettings 
                size={20} 
                className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-90 text-primary' : ''}`} 
              />
              <span className="sr-only">Einstellungen</span>
            </button>
            
            {isDropdownOpen && (
              <div 
                id="settings-dropdown"
                role="menu"
                className="absolute right-0 mt-2 w-52 rounded-xl glass-card dark:glass-card-dark shadow-lg p-3 z-50 animate-fade-in-down border border-gray-200 dark:border-gray-700"
              >
                <div className="space-y-1">
                  {status === "authenticated" && session?.user ? (
                    <>
                      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 mb-2">
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
        {isMobileMenuOpen && (          <div 
            ref={mobileMenuRef}
            className="absolute top-full left-0 right-0 bg-base-100 shadow-lg p-4 z-50 animate-fade-in-down md:hidden border-t border-base-200"
          >
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="text-base-content hover:text-primary px-3 py-2 rounded-md hover:bg-primary/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Startseite
              </Link>
              <Link 
                href="/h5p" 
                className="text-base-content hover:text-primary px-3 py-2 rounded-md hover:bg-primary/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Alle Inhalte
              </Link>
              <Link 
                href="/fachbereich" 
                className="text-base-content hover:text-primary px-3 py-2 rounded-md hover:bg-primary/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Fachbereiche
              </Link>
              <div className="border-t border-base-300 my-2"></div>
              {status === "authenticated" && session?.user ? (
                <>
                  <Link 
                    href="/admin" 
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <MdDashboard size={18} className="text-primary" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10 text-left w-full"
                  >
                    <FiLogOut size={18} className="text-primary" />
                    <span>Abmelden</span>
                  </button>
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BiUserCircle size={18} className="text-primary" />
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
