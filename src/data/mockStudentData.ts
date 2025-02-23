// Mock class and student data structure
export interface StudentGrade {
  testId: string;
  score: number;
  maxScore: number;
  date: string;
  type: 'test' | 'assignment' | 'project';
  subject: string;
  title: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  score?: number;
  maxScore: number;
  submittedDate?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  class: string;
  section: string;
  grades: StudentGrade[];
  assignments: Assignment[];
}

export interface Class {
  id: string;
  name: string; // e.g., "Class 10"
  section: string; // e.g., "A"
  subject: string;
  students: Student[];
}

export const mockClasses: Class[] = [
  {
    id: "C101",
    name: "Class 10",
    section: "A",
    subject: "Mathematics",
    students: [
      {
        id: "S101",
        name: "Alex Johnson",
        rollNo: "1001",
        class: "Class 10",
        section: "A",
        grades: [
          {
            testId: "T1",
            score: 85,
            maxScore: 100,
            date: "2024-01-10",
            type: "test",
            subject: "Mathematics",
            title: "Unit Test 1 - Algebra"
          },
          {
            testId: "T2",
            score: 78,
            maxScore: 100,
            date: "2024-01-15",
            type: "assignment",
            subject: "Mathematics",
            title: "Homework - Quadratic Equations"
          }
        ],
        assignments: [
          {
            id: "A1",
            title: "Problem Set 1",
            subject: "Mathematics",
            dueDate: "2024-01-20",
            status: "submitted",
            score: 18,
            maxScore: 20,
            submittedDate: "2024-01-19"
          },
          {
            id: "A2",
            title: "Problem Set 2",
            subject: "Mathematics",
            dueDate: "2024-01-25",
            status: "pending",
            maxScore: 20
          }
        ]
      },
      // Add more students...
    ]
  },
  {
    id: "C102",
    name: "Class 9",
    section: "B",
    subject: "Mathematics",
    students: [
      // Similar structure for Class 9 students...
    ]
  }
];

// Helper function to calculate average scores
export const calculateClassAverage = (students: Student[], testId: string): number => {
  const scores = students
    .map(student => student.grades.find(grade => grade.testId === testId))
    .filter(grade => grade !== undefined)
    .map(grade => (grade!.score / grade!.maxScore) * 100);

  return scores.length > 0 
    ? scores.reduce((acc, score) => acc + score, 0) / scores.length 
    : 0;
};

// Helper function to get pending assignments count
export const getPendingAssignmentsCount = (students: Student[]): number => {
  return students.reduce((acc, student) => 
    acc + student.assignments.filter(a => a.status === 'pending').length, 0);
};