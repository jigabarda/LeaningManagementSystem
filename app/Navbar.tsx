"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  name: string;
  role: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, name, role")
          .eq("id", sessionUser.id)
          .single();
        setProfile(profileData);
      }

      setLoading(false);
    }

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) setProfile(null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        handleCloseDropdown();
      }
    }

    if (dropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownVisible]);

  const handleOpenDropdown = () => {
    setDropdownVisible(true);
  };

  const handleCloseDropdown = () => {
    setAnimating(true);
    setTimeout(() => {
      setDropdownVisible(false);
      setAnimating(false);
    }, 150);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-blue-600">
          CourseMS
        </Link>

        {!loading && (
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/courses"
              className="hover:text-blue-600 transition-colors"
            >
              Courses
            </Link>

            {user ? (
              <>
                {/* Only show “My Courses” if NOT an instructor */}
                {profile?.role !== "instructor" && (
                  <Link
                    href="/enrolled"
                    className="hover:text-blue-600 transition-colors"
                  >
                    My Courses
                  </Link>
                )}

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={
                      dropdownVisible ? handleCloseDropdown : handleOpenDropdown
                    }
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition"
                  >
                    <span className="font-medium text-gray-700">
                      👋 {profile?.name || "User"}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 text-gray-600 transition-transform ${
                        dropdownVisible ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {dropdownVisible && (
                    <div
                      className={`absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md py-2 text-sm z-50 transition-all duration-150 ${
                        animating ? "animate-fadeOut" : "animate-fadeIn"
                      }`}
                    >
                      <Link
                        href="/profile"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={handleCloseDropdown}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
