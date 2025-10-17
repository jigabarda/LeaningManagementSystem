"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import {
  enrollInCourse,
  unenrollFromCourse,
  checkIfEnrolled,
} from "@/lib/api/enrollments";
import type { Course } from "@/types";

export default function CourseDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const courseId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";

  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!courseId) return;

    async function fetchData() {
      try {
        setLoading(true);
        setErrorMessage("");

        // ✅ Fetch course details including optional thumbnail
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("id, title, description, image_url, instructor_id")
          .eq("id", courseId)
          .single();

        if (courseError) throw new Error(courseError.message);
        setCourse(courseData as Course);

        // ✅ Check enrollment status
        const enrolled = await checkIfEnrolled(courseId);
        setIsEnrolled(enrolled);
      } catch (err: unknown) {
        console.error("Error fetching course data:", err);
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to load course"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [courseId]);

  // ✅ Enroll handler
  async function handleEnroll(): Promise<void> {
    if (!courseId) return;
    try {
      setLoading(true);
      await enrollInCourse(courseId);
      alert("Successfully enrolled in this course!");
      setIsEnrolled(true);
      router.refresh();
    } catch (err: unknown) {
      console.error("Error enrolling:", err);
      alert("Failed to enroll in course.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Unenroll handler
  async function handleUnenroll(): Promise<void> {
    if (!courseId) return;
    if (!confirm("Are you sure you want to unenroll?")) return;

    try {
      setLoading(true);
      await unenrollFromCourse(courseId);
      alert("Successfully unenrolled from this course.");
      setIsEnrolled(false);
      router.refresh();
    } catch (err: unknown) {
      console.error("Error unenrolling:", err);
      alert("Failed to unenroll from course.");
    } finally {
      setLoading(false);
    }
  }

  // --- UI states ---
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading course details...
      </div>
    );

  if (errorMessage)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {errorMessage}
      </div>
    );

  if (!course)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Course not found.
      </div>
    );

  // --- Render Course Page ---
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* ✅ Optimized Thumbnail */}
      {course.image_url ? (
        <div className="relative w-full h-64 md:h-80 mb-6 rounded-xl overflow-hidden shadow-md">
          <Image
            src={course.image_url}
            alt={course.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-gray-400 rounded-xl mb-6">
          No image available
        </div>
      )}

      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="text-gray-700 mb-8">
        {course.description || "No description provided."}
      </p>

      {/* ✅ Enroll / Unenroll Buttons */}
      <div className="flex gap-3">
        {isEnrolled ? (
          <button
            onClick={handleUnenroll}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Unenroll"}
          </button>
        ) : (
          <button
            onClick={handleEnroll}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Enroll"}
          </button>
        )}

        <button
          onClick={() => router.push("/courses")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md transition"
        >
          Back
        </button>
      </div>
    </div>
  );
}
