import { supabase } from "@/lib/supabaseClient";

export interface Lesson {
  id: string;
  title: string;
  content: string | null;
  course_id: string;
  created_at: string;
}

/**
 * Fetch all lessons for a specific course.
 * @param courseId - The ID of the course to list lessons for
 * @returns Array of lessons
 */
export async function listLessons(courseId: string): Promise<Lesson[]> {
  try {
    const { data, error } = await supabase
      .from("lessons")
      .select("id, title, content, course_id, created_at")
      .eq("course_id", courseId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error loading lessons:", err.message);
      throw new Error(err.message);
    }
    console.error("Unknown error loading lessons:", err);
    throw new Error("An unknown error occurred while loading lessons.");
  }
}

/**
 * Fetch a single lesson by ID.
 * @param lessonId - The ID of the lesson
 * @returns The lesson object
 */
export async function getLesson(lessonId: string): Promise<Lesson> {
  try {
    const { data, error } = await supabase
      .from("lessons")
      .select("id, title, content, course_id, created_at")
      .eq("id", lessonId)
      .single();

    if (error || !data) throw new Error(error?.message || "Lesson not found");
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error fetching lesson:", err.message);
      throw new Error(err.message);
    }
    console.error("Unknown error fetching lesson:", err);
    throw new Error("An unknown error occurred while fetching lesson.");
  }
}
