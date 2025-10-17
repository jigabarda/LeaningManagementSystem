"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllCourses } from "@/lib/api/courses";
import { supabase } from "@/lib/supabaseClient";
import type { Course } from "@/types";

interface Profile {
  id: string;
  name: string;
  role: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1️⃣ Get current session
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) console.warn("Session error:", sessionError);

        const user = sessionData?.session?.user ?? null;

        // 2️⃣ Try to fetch profile (if user exists)
        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id, name, role")
            .eq("id", user.id)
            .single();

          if (profileError && profileError.code !== "PGRST116") {
            console.warn("Profile load error:", profileError);
          } else if (profileData) {
            setProfile(profileData);
          }
        }

        // 3️⃣ Always fetch courses
        const fetchedCourses = await getAllCourses();
        setCourses(fetchedCourses);
      } catch (err: unknown) {
        console.error("Error loading courses:", err);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="text-center p-6">Loading courses...</div>;
  if (error) return <div className="text-center text-red-500 p-6">{error}</div>;
  if (courses.length === 0)
    return <div className="text-center p-6">No courses available.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Available Courses</h1>

        {/* ✅ Add Course button only for instructors */}
        {profile?.role === "instructor" && (
          <Link
            href="/courses/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Add Course
          </Link>
        )}
      </div>

      <ul className="space-y-4">
        {courses.map((course) => (
          <li
            key={course.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow flex gap-4"
          >
            {/* ✅ Course Image (from Supabase storage) */}
            <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 relative">
              {course.image_url ? (
                <Image
                  src={course.image_url}
                  alt={course.title}
                  fill
                  sizes="96px"
                  className="object-cover rounded-md"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-200">
                  No Image
                </div>
              )}
            </div>

            {/* ✅ Course Info */}
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{course.title}</h2>
              <p className="text-gray-600">{course.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                Instructor: {course.instructor?.name ?? "Unknown Instructor"}
              </p>
              <Link
                href={`/courses/${course.id}`}
                className="inline-block mt-3 text-blue-600 hover:underline"
              >
                View Course Details →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
