import { supabase } from "@/lib/supabaseClient";
import type { Course, Instructor } from "@/types";

/** Shape returned from Supabase query */
interface SupabaseInstructor {
  id: string;
  name?: string | null;
}

interface SupabaseCourseRow {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  instructor_id?: string | null;
  instructor?: SupabaseInstructor | SupabaseInstructor[] | null;
}

/** Fetch all courses including instructor and image */
export async function getAllCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      id,
      title,
      description,
      image_url,
      instructor_id,
      instructor:profiles(id, name)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!data) return [];

  return data.map((item: SupabaseCourseRow): Course => {
    let instructorData: Instructor | null = null;

    const instructor = item.instructor;

    if (Array.isArray(instructor)) {
      // Explicitly type the array element
      const first: SupabaseInstructor | undefined = instructor[0];
      if (first && first.id) {
        instructorData = {
          id: String(first.id),
          name: first.name ?? "Unknown Instructor",
        };
      }
    } else if (
      instructor &&
      typeof instructor === "object" &&
      "id" in instructor
    ) {
      instructorData = {
        id: String(instructor.id),
        name: instructor.name ?? "Unknown Instructor",
      };
    }

    return {
      id: String(item.id),
      title: item.title ?? "Untitled Course",
      description: item.description ?? "",
      image_url: item.image_url ?? null,
      instructor_id: item.instructor_id ?? null,
      instructor: instructorData,
    };
  });
}

/** Create a new course (with optional image upload) */
export async function createCourse(
  title: string,
  description: string,
  imageFile: File | null
): Promise<Course> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error("User not authenticated");

  let imageUrl: string | null = null;

  if (imageFile) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `thumbnails/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("course-thumbnails")
      .upload(filePath, imageFile);

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrl } = supabase.storage
      .from("course-thumbnails")
      .getPublicUrl(filePath);

    imageUrl = publicUrl.publicUrl;
  }

  const { data, error } = await supabase
    .from("courses")
    .insert({
      title,
      description,
      instructor_id: user.id,
      image_url: imageUrl,
    })
    .select(
      `
      id,
      title,
      description,
      image_url,
      instructor:profiles(id, name)
    `
    )
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("No course data returned");

  let instructorData: Instructor | null = null;
  const instr = data.instructor as
    | SupabaseInstructor
    | SupabaseInstructor[]
    | null;

  if (Array.isArray(instr)) {
    const first: SupabaseInstructor | undefined = instr[0];
    if (first && first.id) {
      instructorData = {
        id: String(first.id),
        name: first.name ?? "Unknown Instructor",
      };
    }
  } else if (instr && typeof instr === "object" && "id" in instr) {
    instructorData = {
      id: String(instr.id),
      name: instr.name ?? "Unknown Instructor",
    };
  }

  return {
    id: String(data.id),
    title: data.title,
    description: data.description,
    image_url: data.image_url ?? null,
    instructor_id: user.id,
    instructor: instructorData,
  };
}
