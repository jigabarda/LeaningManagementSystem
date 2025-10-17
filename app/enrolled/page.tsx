"use client";

import { useEffect, useState } from "react";
import { listUserEnrollments } from "@/lib/api/enrollments";
import type { Enrollment } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EnrolledPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadEnrollments = async () => {
    try {
      const data = await listUserEnrollments();
      setEnrollments(data);
    } catch (err) {
      console.error("Error loading enrollments:", err);
      setError("Failed to load enrolled courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  // Optional: if user navigates back from /courses/[id], refresh automatically
  useEffect(() => {
    router.refresh();
  }, [router]);

  if (loading)
    return <div className="p-6 text-center">Loading your courses...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (enrollments.length === 0)
    return (
      <div className="p-6 text-center">
        You haven’t enrolled in any courses yet.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Enrolled Courses</h1>
      <ul className="space-y-4">
        {enrollments.map((enroll) => (
          <li
            key={enroll.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-semibold">
              {enroll.course?.title ?? "Untitled Course"}
            </h2>
            <p className="text-gray-600">{enroll.course?.description}</p>
            <Link
              href={`/courses/${enroll.course_id}`}
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              View Course →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
