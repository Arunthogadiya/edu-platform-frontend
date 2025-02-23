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
      console.log('Fetching students with params:', { class_value, section });
      const response = await api.get('/api/students', {
        params: {
          class_value,
          section,
        },
      });
      console.log('Raw API response:', response);
      
      if (!response.data) {
        console.error('No data received from API');
        return [];
      }

      // Ensure the data matches our interface
      const students = Array.isArray(response.data) ? response.data : [];
      console.log('Processed students data:', students);
      return students;
    } catch (error) {
      console.error('Students API error:', error);
      throw error; // Let the component handle the error
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
