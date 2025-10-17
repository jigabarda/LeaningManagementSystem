"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
      <h1 className="text-4xl font-bold mb-4 text-blue-600">
        Course Management System
      </h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Welcome! Manage your courses, enroll in lessons, and explore learning
        materials — all in one place.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/courses"
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Browse Courses
        </Link>
        <Link
          href="/courses/enrolled"
          className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          My Enrolled Courses
        </Link>
        <Link
          href="/profile"
          className="px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
        >
          My Profile
        </Link>
        <Link
          href="/login"
          className="px-5 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
        >
          Login
        </Link>
      </div>
    </main>
  );
}
