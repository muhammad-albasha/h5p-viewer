"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { BiFont, BiUserCircle } from "react-icons/bi";
import { TbLanguage } from "react-icons/tb";
import { useSession, signOut } from "next-auth/react";

const Navbar = () => {
  const { data: session, status } = useSession();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if user has a theme preference in localStorage
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      setDarkMode(false);
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    const theme = newMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

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
    <nav className="bg-base-100 shadow-md py-2 px-4">
      {" "}
      <div className="container mx-auto flex justify-end items-center">
        <div className="flex gap-3">


          <div className="flex items-center gap-1">
            <button
              className="btn btn-sm btn-ghost"
              onClick={decreaseFontSize}
              title="Schriftgröße verkleinern"
              aria-label="Schriftgröße verkleinern"
            >
              <BiFont className="text-sm" />
              <span className="sr-only">Schriftgröße verkleinern</span>
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={increaseFontSize}
              title="Schriftgröße vergrößern"
              aria-label="Schriftgröße vergrößern"
            >
              <BiFont className="text-lg" />
              <span className="sr-only">Schriftgröße vergrößern</span>
            </button>{" "}
          <button
            className="btn btn-sm btn-ghost normal-case"
            onClick={toggleDarkMode}
            aria-label={
              darkMode
                ? "Zum hellen Modus wechseln"
                : "Zum dunklen Modus wechseln"
            }
          >
            {darkMode ? <FiSun /> : <FiMoon />}
            <span className="hidden md:inline ml-1">Kontrast</span>
          </button>
          <Link href="#" className="btn btn-sm btn-ghost normal-case">
            <TbLanguage className="mr-1" />
            <span className="hidden md:inline">Leichte Sprache</span>
          </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
