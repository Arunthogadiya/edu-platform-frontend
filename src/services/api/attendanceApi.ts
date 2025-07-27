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

interface StudentAttendanceResponse {
  student_id: number;
  student_name: string;
  gender: string;
  attendance: Array<{
    date: string;
    notes: string;
    status: 'present' | 'absence';
  }>;
}

export const attendanceApi = {
  // Get attendance for a specific date - updated to handle actual API response
  getAttendanceByDate: async (date: string, class_value: string, section: string): Promise<AttendanceResponse[]> => {
    try {
      const response = await api.get('/api/dashboard/attendance', {
        params: { 
          attendance_date: date,
          class_value,
          section
        }
      });
      
      console.log(`📊 Raw attendance response for ${date}:`, response.data);
      console.log(`📊 Response type:`, typeof response.data, `Array:`, Array.isArray(response.data));
      
      // Handle the actual API response structure - API returns {students: [...]}
      let data;
      if (response.data && typeof response.data === 'object' && 'students' in response.data) {
        console.log(`📊 Found 'students' property in response`);
        data = response.data.students;
      } else if (Array.isArray(response.data)) {
        console.log(`📊 Response is already an array`);
        data = response.data;
      } else {
        console.warn(`⚠️ Unexpected response structure:`, response.data);
        return [];
      }
      
      if (!Array.isArray(data)) {
        console.warn(`⚠️ Expected array but got:`, typeof data, data);
        return [];
      }
      
      console.log(`👥 Processing ${data.length} student records for date ${date}`);
      
      // Transform the response from student-based to attendance record-based
      const attendanceRecords: AttendanceResponse[] = [];
      
      data.forEach((studentData: StudentAttendanceResponse) => {
        if (studentData.attendance && Array.isArray(studentData.attendance)) {
          // Find attendance record for the specific date
          const targetDateStr = date; // Expected format: YYYY-MM-DD
          const attendanceForDate = studentData.attendance.find(att => {
            let attDateStr: string;
            
            // Handle different possible date formats from API
            if (typeof att.date === 'string') {
              if (att.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // Already in YYYY-MM-DD format (database format)
                attDateStr = att.date;
              } else {
                // Parse as Date object and convert to YYYY-MM-DD
                const attDate = new Date(att.date);
                attDateStr = attDate.toISOString().split('T')[0];
              }
            } else {
              // Fallback: treat as Date object
              const attDate = new Date(att.date);
              attDateStr = attDate.toISOString().split('T')[0];
            }
            
            console.log(`🔍 Comparing dates: API date "${att.date}" -> normalized "${attDateStr}" vs target "${targetDateStr}"`);
            
            return attDateStr === targetDateStr;
          });
          
          if (attendanceForDate) {
            console.log(`Found attendance for student ${studentData.student_id} on ${date}:`, attendanceForDate);
            attendanceRecords.push({
              student_id: studentData.student_id,
              status: attendanceForDate.status,
              notes: attendanceForDate.notes || '',
              attendance_date: date
            });
          } else {
            console.log(`No attendance found for student ${studentData.student_id} on ${date}`);
          }
        }
      });
      
      console.log(`Transformed attendance records for ${date}:`, attendanceRecords);
      return attendanceRecords;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
  },

  // Get class-wise attendance for all dates
  getClassAttendance: async (class_value: string, section: string): Promise<StudentAttendanceResponse[]> => {
    try {
      const response = await api.get('/api/dashboard/attendance', {
        params: { 
          class_value,
          section
        }
      });
      
      console.log('Class attendance response:', response.data);
      const data = response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching class attendance:', error);
      return [];
    }
  },

  getClassOverview: async (class_value: string, section: string) => {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      console.log(`🏫 Fetching class overview for Class ${class_value}${section} on ${today}`);
      
      // First try to get today's attendance specifically
      const todayAttendance = await attendanceApi.getAttendanceByDate(today, class_value, section);
      console.log(`📊 Today's attendance records:`, todayAttendance);
      
      // Also get all students to calculate total count
      const allStudentsResponse = await api.get('/api/students', {
        params: { class_value, section }
      });
      
      const totalStudents = Array.isArray(allStudentsResponse.data) ? allStudentsResponse.data.length : 0;
      const presentCount = todayAttendance.filter(record => record.status === 'present').length;
      const absentCount = todayAttendance.filter(record => record.status === 'absence').length;
      
      console.log(`📈 Class overview stats: Total=${totalStudents}, Present=${presentCount}, Absent=${absentCount}`);
      
      return {
        totalRecords: totalStudents,
        presentCount: presentCount,
        absentCount: absentCount,
        totalStudents: totalStudents, // Add this for consistency
      };
    } catch (error) {
      console.error('Error fetching class overview:', error);
      return { totalRecords: 0, presentCount: 0, absentCount: 0, totalStudents: 0 };
    }
  },

  // Updated to match actual API structure - removed class_value and section
  submitAttendance: async (record: AttendanceRecord) => {
    try {
      console.log('Submitting attendance record:', record);
      
      // Only send the fields expected by the API
      const apiRecord = {
        student_id: record.student_id,
        attendance_date: record.attendance_date,
        status: record.status,
        notes: record.notes || ''
      };
      
      const response = await api.post('/api/dashboard/attendance', apiRecord);
      console.log('Attendance submission response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error submitting attendance:', error);
      throw error;
    }
  },

  // Bulk submit attendance for multiple students
  submitBulkAttendance: async (records: AttendanceRecord[]) => {
    try {
      console.log('Submitting bulk attendance:', records.length, 'records');
      
      const results = [];
      const errors = [];
      
      for (const record of records) {
        try {
          const result = await attendanceApi.submitAttendance(record);
          results.push({ student_id: record.student_id, success: true, data: result });
        } catch (error) {
          console.error(`Failed to submit attendance for student ${record.student_id}:`, error);
          errors.push({ student_id: record.student_id, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }
      
      return {
        successful: results,
        failed: errors,
        total: records.length,
        successCount: results.length,
        errorCount: errors.length
      };
    } catch (error) {
      console.error('Error in bulk attendance submission:', error);
      throw error;
    }
  },

  // Check if attendance already exists for a student on a specific date
  checkExistingAttendance: async (studentId: number, date: string, class_value: string, section: string): Promise<boolean> => {
    try {
      console.log(`Checking existing attendance for student ${studentId} on ${date}`);
      const existingRecords = await attendanceApi.getAttendanceByDate(date, class_value, section);
      const exists = existingRecords.some(record => record.student_id === studentId);
      console.log(`Student ${studentId} attendance exists for ${date}: ${exists}`);
      return exists;
    } catch (error) {
      console.error('Error checking existing attendance:', error);
      return false;
    }
  }
};
