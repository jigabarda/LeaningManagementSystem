"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { Course } from "@/types";

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("courses")
        .select("*")
        .eq("instructor_id", user.id);

      setCourses(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Instructor Dashboard</h1>
      <Link
        href="/courses/new"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        + Create New Course
      </Link>
      <ul className="space-y-3">
        {courses.map((course) => (
          <li key={course.id} className="border p-4 rounded-md">
            <h2 className="text-lg font-semibold">{course.title}</h2>
            <p className="text-gray-600">{course.description}</p>
            <div className="mt-2 space-x-3">
              <Link
                href={`/courses/${course.id}`}
                className="text-blue-600 hover:underline"
              >
                View
              </Link>
              <Link
                href={`/courses/${course.id}/edit`}
                className="text-green-600 hover:underline"
              >
                Edit
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
