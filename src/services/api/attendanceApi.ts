import api from '../apiConfig';

interface AttendanceRecord {
  student_id: number;
  status: 'present' | 'absence';
  notes: string;
  attendance_date: string;
}

export const attendanceApi = {
  // Add new method to get attendance for a specific date
  getAttendanceByDate: async (date: string, class_value: string, section: string) => {
    try {
      const response = await api.get('/api/dashboard/attendance', {
        params: { 
          attendance_date: date,
          class_value,
          section
        }
      });
      
      // Debug log to see the response structure
      console.log('Raw attendance response:', response);
      
      // Ensure we return an array even if the response is empty or malformed
      const data = response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
  },

  // Get attendance by class and section
  getClassAttendance: async (class_value: string, section: string) => {
    try {
      const response = await api.get('/api/attendance', {
        params: { 
          class_value,
          section
        }
      });
      console.log('Class attendance data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching class attendance:', error);
      return [];
    }
  },

  submitAttendance: async (record: AttendanceRecord) => {
    try {
      const response = await api.post('/api/dashboard/attendance', record);
      return response.data;
    } catch (error) {
      console.error('Error submitting attendance:', error);
      throw error;
    }
  }
};
