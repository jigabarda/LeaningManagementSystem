// types/lesson.ts
export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content?: string;
  order_index?: number;
  created_at?: string;
}
