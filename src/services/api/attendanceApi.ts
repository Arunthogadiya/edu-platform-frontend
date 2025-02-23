import api from '../apiConfig';

interface AttendanceRecord {
  student_id: number;
  status: 'present' | 'absence';
  notes: string;
  attendance_date: string;
}

interface ClassAttendanceRecord {
  date: string;
  present_count: number;
  absent_count: number;
}

interface AttendanceResponse {
  student_id: number;
  status: 'present' | 'absence';
  notes?: string;
  attendance_date: string;
}

export const attendanceApi = {
  // Add new method to get attendance for a specific date
  getAttendanceByDate: async (date: string, class_value: string, section: string): Promise<AttendanceResponse[]> => {
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

  // Add new method to get class-wise attendance
  getClassAttendance: async (class_value: string, section: string): Promise<ClassAttendanceRecord[]> => {
    try {
      const response = await api.get('/api/dashboard/attendance', {
        params: { 
          class_value,
          section
        }
      });
      
      // Ensure we return an array of attendance records
      const data = response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching class attendance:', error);
      return [];
    }
  },

  getClassOverview: async (class_value: string, section: string) => {
    try {
      const response = await api.get(`/api/dashboard/attendance/${class_value}/${section}`);
      return {
        totalRecords: response.data?.length || 0,
        presentCount: response.data?.filter((r: any) => r.status === 'present').length || 0,
        absentCount: response.data?.filter((r: any) => r.status === 'absence').length || 0,
      };
    } catch (error) {
      console.error('Error fetching class overview:', error);
      return { totalRecords: 0, presentCount: 0, absentCount: 0 };
    }
  },

  submitAttendance: async (record: AttendanceRecord) => {
    try {
      const response = await api.post('/api/dashboard/attendance', record);
      
      // After successful submission, fetch updated class attendance
      const updatedAttendance = await attendanceApi.getClassAttendance(
        record.class_value,
        record.section
      );
      
      return {
        submission: response.data,
        updatedAttendance
      };
    } catch (error) {
      console.error('Error submitting attendance:', error);
      throw error;
    }
  }
};
