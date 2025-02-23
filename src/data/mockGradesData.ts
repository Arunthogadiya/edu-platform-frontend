// Mock data types
interface Grade {
  grade: string;
  date?: string;
  assignment?: string;
  score?: number;
}

interface SubjectGrades {
  subject: string;
  grades: Grade[];
  averageScore?: number;
  trend?: 'up' | 'down' | 'stable';
}

export const mockGradesData = {
  subjects: [
    {
      subject: "Mathematics",
      grades: [
        { grade: "A", score: 92, assignment: "Algebra Test", date: "2024-02-15" },
        { grade: "B+", score: 88, assignment: "Geometry Quiz", date: "2024-02-10" }
      ],
      averageScore: 90,
      trend: "up" as const
    },
    {
      subject: "Science",
      grades: [
        { grade: "B", score: 85, assignment: "Chemistry Lab", date: "2024-02-14" },
        { grade: "B+", score: 87, assignment: "Physics Quiz", date: "2024-02-09" }
      ],
      averageScore: 86,
      trend: "stable" as const
    },
    {
      subject: "English",
      grades: [
        { grade: "A-", score: 91, assignment: "Essay Writing", date: "2024-02-13" },
        { grade: "B", score: 85, assignment: "Literature Quiz", date: "2024-02-08" }
      ],
      averageScore: 88,
      trend: "up" as const
    },
    {
      subject: "History",
      grades: [
        { grade: "C+", score: 77, assignment: "World War II Test", date: "2024-02-12" },
        { grade: "B-", score: 82, assignment: "Civil Rights Movement Quiz", date: "2024-02-07" }
      ],
      averageScore: 79.5,
      trend: "down" as const
    }
  ]
};

export type { Grade, SubjectGrades };