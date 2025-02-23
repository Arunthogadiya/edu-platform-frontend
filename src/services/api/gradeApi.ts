import axiosInstance from '@/lib/axios';

export const GRADE_OPTIONS = {
  'A+': '95-100',
  'A': '90-94',
  'A-': '85-89',
  'B+': '80-84',
  'B': '75-79',
  'B-': '70-74',
  'C+': '65-69',
  'C': '60-64',
  'C-': '55-59',
  'D': '50-54',
  'F': 'Below 50'
} as const;

export type GradeValue = keyof typeof GRADE_OPTIONS;

export interface GradeSubmission {
  student_id: string;
  subject: string;
  grade: GradeValue;
  record_date: string;
}

export interface SubjectGrade {
  date: string;
  grade: GradeValue;
}

export interface SubjectData {
  subject: string;
  grades: SubjectGrade[];
  alert: boolean;
}

export interface StudentGradeData {
  student_id: number;
  student_name: string;
  gender: string;
  subjects: SubjectData[];
}

export interface GradesResponse {
  students: StudentGradeData[];
}

export const gradeApi = {
  postGrade: async (gradeData: GradeSubmission) => {
    const response = await axiosInstance.post('/api/dashboard/grades', gradeData);
    return response.data;
  },

  getGrades: async (class_value: string, section: string): Promise<GradesResponse> => {
    try {
      console.log('Fetching grades with:', { class_value, section });
      const response = await axiosInstance.get('/api/dashboard/grades', {
        params: { class_value, section }
      });
      console.log('Grade API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getGrades:', error);
      throw error;
    }
  }
};
