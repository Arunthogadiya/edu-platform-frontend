import api from '../apiConfig';

export interface Student {
  student_id: number;
  student_name: string;
  gender: string;
  class_value: string;
  section: string;
}

interface NewStudent {
  student_id: string;
  student_name: string;
  parent_name: string;
  parent_phone: string;  // Changed from phone_number
  gender: string;
  class_value: string;
  section: string;
  date_of_birth: string;
}

export const studentApi = {
  getStudents: async (class_value: string, section: string): Promise<Student[]> => {
    try {
      const response = await api.get('/api/students', {
        params: {
          class_value,
          section,
        },
      });
      console.log('Students API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Students API error:', error);
      return [];
    }
  },

  addStudent: async (studentData: NewStudent): Promise<any> => {
    try {
      const response = await api.post('/api/students', studentData);
      console.log('Add student response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  },
};
