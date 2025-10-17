// types/enrollment.ts
export interface Enrollment {
  id: string;
  course_id: string;
  user_id: string;
  enrolled_at?: string;
  course?: {
    id: string;
    title: string;
    description?: string;
  };
}
