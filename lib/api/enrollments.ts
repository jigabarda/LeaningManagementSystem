import { supabase } from "@/lib/supabaseClient";
import type { Enrollment, Course } from "@/types";

/**
 * Enroll the current user in a course.
 * Returns the created Enrollment row or throws.
 */
export async function enrollInCourse(courseId: string): Promise<Enrollment> {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);

  const userId = sessionData?.session?.user?.id;
  if (!userId) throw new Error("User not authenticated");

  // Insert enrollment
  const { data, error } = await supabase
    .from("enrollments")
    .insert([{ course_id: courseId, user_id: userId }])
    .select()
    .single();

  if (error) {
    console.error("enrollInCourse error:", error);
    throw new Error(error.message);
  }

  return data as Enrollment;
}

/**
 * Unenroll current user from a course.
 * Returns true if a row was deleted, false if none found.
 */
export async function unenrollFromCourse(courseId: string): Promise<boolean> {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);

  const userId = sessionData?.session?.user?.id;
  if (!userId) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("enrollments")
    .delete()
    .match({ course_id: courseId, user_id: userId })
    .select();

  if (error) {
    console.error("unenrollFromCourse error:", error);
    throw new Error(error.message);
  }

  return Array.isArray(data) ? data.length > 0 : !!data;
}

/**
 * List enrollments for current user (join course data)
 */
export async function listUserEnrollments(): Promise<Enrollment[]> {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);

  const userId = sessionData?.session?.user?.id;
  if (!userId) throw new Error("User not authenticated");

  // Define the shape of Supabase response
  interface RawCourse {
    id: string;
    title: string;
    description?: string | null;
    thumbnail_url?: string | null;
  }

  interface RawEnrollment {
    id: string;
    user_id: string;
    course_id: string;
    created_at?: string;
    course?: RawCourse | RawCourse[] | null;
  }

  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `
      id,
      user_id,
      course_id,
      created_at,
      course:courses (
        id,
        title,
        description,
        thumbnail_url
      )
    `
    )
    .eq("user_id", userId);

  if (error) {
    console.error("listUserEnrollments error:", error);
    throw new Error(error.message);
  }

  // Safely handle both array and object for `course`
  const enrollments: Enrollment[] = (data ?? []).map(
    (item: RawEnrollment): Enrollment => {
      let course: Course | null = null;

      if (Array.isArray(item.course)) {
        const first = item.course[0];
        if (first && first.id) {
          course = {
            id: String(first.id),
            title: first.title,
            description: first.description ?? null,
            image_url: first.thumbnail_url ?? null,
          };
        }
      } else if (item.course && typeof item.course === "object") {
        course = {
          id: String(item.course.id),
          title: item.course.title,
          description: item.course.description ?? null,
          image_url: item.course.thumbnail_url ?? null,
        };
      }

      return {
        id: String(item.id),
        user_id: String(item.user_id),
        course_id: String(item.course_id),
        created_at: item.created_at ?? undefined,
        course,
      };
    }
  );

  return enrollments;
}

/**
 * Check if current user is enrolled in a course
 */
export async function checkIfEnrolled(courseId: string): Promise<boolean> {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);

  const userId = sessionData?.session?.user?.id;
  if (!userId) return false;

  const { data, error } = await supabase
    .from("enrollments")
    .select("id")
    .match({ course_id: courseId, user_id: userId })
    .maybeSingle();

  if (error) {
    console.error("checkIfEnrolled error:", error);
    throw new Error(error.message);
  }

  return !!data;
}
