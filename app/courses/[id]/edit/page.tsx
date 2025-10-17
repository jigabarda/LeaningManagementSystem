"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Course } from "@/types";

export default function EditCoursePage() {
  const router = useRouter();
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setCourse(data);
        setTitle(data.title);
        setDescription(data.description);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSave() {
    const { error } = await supabase
      .from("courses")
      .update({ title, description })
      .eq("id", id);

    if (!error) router.push(`/courses/${id}`);
  }

  async function handleDelete() {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (!error) router.push("/courses");
  }

  if (loading) return <p>Loading...</p>;
  if (!course) return <p>Course not found.</p>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Course</h1>
      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Course title"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Course description"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
