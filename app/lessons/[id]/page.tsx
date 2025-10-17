"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Lesson } from "@/types";

export default function LessonDetailPage() {
  const { id } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setLesson(data);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!lesson) return <p>Lesson not found.</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-3">{lesson.title}</h1>
      <div className="prose">
        <p>{lesson.content || "No content available."}</p>
      </div>
    </div>
  );
}
