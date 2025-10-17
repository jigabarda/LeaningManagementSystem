// types/course.ts
export interface Course {
  id: string;
  title: string;
  description?: string;
  instructor_id?: string;
  created_at?: string;
  instructor?: {
    id: string;
    name?: string;
  };
}
