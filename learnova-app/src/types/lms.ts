export interface Lesson {
  id: string;
  title: string;
  type: "video" | "document" | "image";
  duration: string;
  responsible: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  tags: string[];
  views: number;
  totalLessons: number;
  totalDuration: string;
  published: boolean;
  image: string;
  createdAt: string;
  lessons: Lesson[];
}
