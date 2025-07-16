"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { BiFont, BiUserCircle } from "react-icons/bi";
import { TbLanguage } from "react-icons/tb";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "../theme/ThemeProvider";

const Navbar = () => {
  const { data: session, status } = useSession();
  const { theme, toggleTheme, isHydrated } = useTheme();
  const isDarkMode = theme === 'dark';

  const increaseFontSize = () => {
    document.documentElement.style.fontSize =
      "calc(var(--font-size, 1rem) * 1.1)";
    document.documentElement.style.setProperty(
      "--font-size",
      `${
        (parseFloat(getComputedStyle(document.documentElement).fontSize) *
          1.1) /
        16
      }rem`
    );
  };

  const decreaseFontSize = () => {
    document.documentElement.style.fontSize =
      "calc(var(--font-size, 1rem) * 0.9)";
    document.documentElement.style.setProperty(
      "--font-size",
      `${
        (parseFloat(getComputedStyle(document.documentElement).fontSize) *
          0.9) /
        16
      }rem`
    );
  };
  return (
    <nav className="bg-base-100 shadow-md py-2 px-4 sticky top-0 z-50 responsive-hide-print">
      <div className="container-fluid flex justify-end items-center">
        <div className="flex gap-2 md:gap-3">
          <div className="flex items-center gap-1">
            <button
              className="btn btn-sm btn-ghost p-2 md:p-3"
              onClick={decreaseFontSize}
              title="Schriftgröße verkleinern"
              aria-label="Schriftgröße verkleinern"
            >
              <BiFont className="text-sm" />
              <span className="sr-only">Schriftgröße verkleinern</span>
            </button>
            <button
              className="btn btn-sm btn-ghost p-2 md:p-3"
              onClick={increaseFontSize}
              title="Schriftgröße vergrößern"
              aria-label="Schriftgröße vergrößern"
            >
              <BiFont className="text-lg" />
              <span className="sr-only">Schriftgröße vergrößern</span>
            </button>
            <button
              className="btn btn-sm btn-ghost normal-case p-2 md:p-3"
              onClick={toggleTheme}
              aria-label={
                isDarkMode
                  ? "Zum hellen Modus wechseln"
                  : "Zum dunklen Modus wechseln"
              }
            >
              {isHydrated ? (isDarkMode ? <FiSun /> : <FiMoon />) : <FiMoon />}
              <span className="hidden md:inline ml-1 text-fluid-sm">Kontrast</span>
            </button>
            <Link
              href="/easy-language"
              className="btn btn-sm btn-ghost normal-case p-2 md:p-3"
            >
              <TbLanguage className="mr-0 md:mr-1" />
              <span className="hidden lg:inline text-fluid-sm">Leichte Sprache</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
