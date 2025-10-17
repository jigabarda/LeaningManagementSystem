// types/index.ts

export interface Instructor {
  id: string;
  name?: string | null;
}

export interface Course {
  id: string;
  title: string;
  description?: string | null;
  instructor?: Instructor | null;
  instructor_id?: string | null;
  created_at?: string;
  /** ✅ Add this field for image support */
  image_url?: string | null;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content?: string | null;
  created_at?: string;
}

export interface Profile {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: "student" | "instructor" | "admin";
  created_at?: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  created_at?: string;
  /** ✅ Allow both undefined and null */
  course?: Course | null;
}
