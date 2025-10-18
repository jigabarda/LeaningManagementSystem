"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { Course } from "@/types";

interface Profile {
  id: string;
  name: string;
  role: string;
}

interface Lesson {
  id: string;
  title: string;
  file_url: string;
  created_at: string;
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newLessonFile, setNewLessonFile] = useState<File | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");

  // ✅ Load course, profile, and lessons
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const user = sessionData?.session?.user ?? null;

        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id, name, role")
            .eq("id", user.id)
            .single();

          if (profileError) throw profileError;
          setProfile(profileData);
        }

        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("*, instructor:profiles(name)")
          .eq("id", id)
          .single();

        if (courseError) throw courseError;
        setCourse(courseData);

        const { data: lessonsData, error: lessonError } = await supabase
          .from("lessons")
          .select("*")
          .eq("course_id", id)
          .order("created_at", { ascending: true });

        if (lessonError) throw lessonError;
        setLessons(lessonsData ?? []);
      } catch (err) {
        console.error("Error loading course:", err);
        setError("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // ✅ Upload lesson file
  const handleLessonUpload = async () => {
    if (!newLessonFile || !profile || !course) return;

    try {
      const fileExt = newLessonFile.name.split(".").pop();
      const safeTitle =
        newLessonTitle.trim() || `Lesson-${new Date().getTime()}`;
      const fileName = `${course.id}-${Date.now()}.${fileExt}`;
      const filePath = `${course.id}/${fileName}`; // keep bucket organized by course id

      // ✅ Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("course_resources")
        .upload(filePath, newLessonFile, {
          upsert: true,
          cacheControl: "3600",
          contentType: newLessonFile.type,
        });

      if (uploadError) {
        console.error("❌ Upload error:", uploadError);
        alert(`Upload failed: ${uploadError.message}`);
        return;
      }

      // ✅ Get public file URL
      const { data: publicUrlData } = supabase.storage
        .from("course_resources")
        .getPublicUrl(filePath);

      const fileUrl = publicUrlData?.publicUrl;
      if (!fileUrl) {
        alert("Failed to get file URL.");
        return;
      }

      // ✅ Save lesson record in DB
      const { error: insertError } = await supabase.from("lessons").insert([
        {
          title: safeTitle,
          file_url: fileUrl,
          course_id: course.id,
        },
      ]);

      if (insertError) {
        console.error("❌ Insert error:", insertError);
        alert(`Failed to save lesson record: ${insertError.message}`);
        return;
      }

      alert("✅ Lesson uploaded successfully!");

      // ✅ Refresh lessons
      const { data: updatedLessons } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", id)
        .order("created_at", { ascending: true });

      setLessons(updatedLessons ?? []);
      setNewLessonFile(null);
      setNewLessonTitle("");
    } catch (err) {
      console.error("Lesson upload error:", err);
      alert(
        "Unexpected error occurred during upload. Check console for details."
      );
    }
  };

  // ✅ Delete course
  const handleDeleteCourse = async () => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;

      alert("✅ Course deleted successfully!");
      router.push("/courses");
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("❌ Failed to delete course.");
    }
  };

  // ✅ Rendering UI
  if (loading)
    return <div className="text-center p-6">Loading course details...</div>;
  if (error) return <div className="text-center text-red-500 p-6">{error}</div>;
  if (!course) return <div className="text-center p-6">Course not found.</div>;

  const isInstructor = profile?.role === "instructor";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Course Header */}
      <div className="flex items-start gap-6">
        {course.image_url ? (
          <Image
            src={course.image_url}
            alt={course.title}
            width={180}
            height={180}
            className="rounded-lg object-cover"
          />
        ) : (
          <div className="w-[180px] h-[180px] flex items-center justify-center bg-gray-200 text-gray-500 rounded-lg">
            No Image
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-700 mt-2">{course.description}</p>
          <p className="text-sm text-gray-500 mt-1">
            Instructor: {course.instructor?.name ?? "Unknown"}
          </p>

          {isInstructor && (
            <div className="mt-4 flex gap-3">
              <Link
                href={`/courses/${course.id}/edit`}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
              >
                Edit Course
              </Link>
              <button
                onClick={handleDeleteCourse}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Delete Course
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lessons List */}
      <div>
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">
          Course Resources
        </h2>

        {lessons.length > 0 ? (
          <ul className="space-y-2">
            {lessons.map((lesson) => (
              <li
                key={lesson.id}
                className="border p-3 rounded-md flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{lesson.title}</p>
                  <p className="text-sm text-gray-500">
                    Uploaded on{" "}
                    {new Date(lesson.created_at).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={lesson.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Resource →
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No lessons or resources yet.</p>
        )}
      </div>

      {/* Upload Section (Instructors Only) */}
      {isInstructor && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Upload New Lesson or Resource
          </h3>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="lessonTitle"
                className="block font-medium text-gray-700"
              >
                Lesson Title
              </label>
              <input
                id="lessonTitle"
                type="text"
                title="Lesson Title"
                placeholder="Enter lesson title"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                className="block w-full mt-1 p-2 border rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="lessonFile"
                className="block font-medium text-gray-700"
              >
                Upload Lesson File
              </label>
              <input
                id="lessonFile"
                type="file"
                title="Lesson File"
                accept=".pdf,.ppt,.zip,.doc,.mp4"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewLessonFile(e.target.files?.[0] ?? null)
                }
                className="block w-full mt-1 p-2 border rounded-md"
              />
            </div>

            <button
              onClick={handleLessonUpload}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              disabled={!newLessonFile}
            >
              Upload Lesson
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
