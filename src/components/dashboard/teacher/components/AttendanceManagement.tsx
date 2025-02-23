import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Save, Users } from 'lucide-react';
import { studentApi, Student } from '../../../../services/api/studentApi';
import { attendanceApi } from '../../../../services/api/attendanceApi';
import { mockLeaveRequests } from '@/data/dummyTeacherData';

interface ClassAttendanceRecord {
  date: string;
  present_count: number;
  absent_count: number;
}

const AttendanceManagement: React.FC = () => {
  const { t } = useTranslation();
  const [selectedClass, setSelectedClass] = useState('6');
  const [selectedSection, setSelectedSection] = useState('A');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<{ [key: number]: 'present' | 'absence' }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<'daily' | 'trends'>('daily');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<{ [key: number]: string }>({});
  const [savingStates, setSavingStates] = useState<{ [key: number]: boolean }>({});
  const [saveStatus, setSaveStatus] = useState<{ [key: number]: 'idle' | 'saving' | 'saved' | 'error' }>({});
  const [savedData, setSavedData] = useState<{ [key: number]: { status: string; notes: string } }>({});
  const [classAttendance, setClassAttendance] = useState<ClassAttendanceRecord[]>([]);

  const classes = ['6', '7', '8', '9', '10'];
  const sections = ['A', 'B', 'C'];

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadStudents();
      loadClassAttendance();
    }
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    if (attendanceDate && selectedClass && selectedSection) {
      loadExistingAttendance();
    }
  }, [attendanceDate, selectedClass, selectedSection]);

  const loadExistingAttendance = async () => {
    try {
      setIsLoading(true);
      const response = await attendanceApi.getAttendanceByDate(
        attendanceDate,
        selectedClass,
        selectedSection
      );
      
      // Debug log to see the response structure
      console.log('Existing attendance data:', response);

      const attendanceMap: { [key: number]: 'present' | 'absence' } = {};
      const notesMap: { [key: number]: string } = {};
      const savedDataMap: { [key: number]: { status: string; notes: string } } = {};

      // Check if response.data exists and is an array
      const records = Array.isArray(response) ? response : 
                     Array.isArray(response?.data) ? response.data : [];

      records.forEach((record: any) => {
        if (record && record.student_id) {
          attendanceMap[record.student_id] = record.status;
          notesMap[record.student_id] = record.notes || '';
          savedDataMap[record.student_id] = {
            status: record.status,
            notes: record.notes || ''
          };
          setSaveStatus(prev => ({
            ...prev,
            [record.student_id]: 'saved'
          }));
        }
      });

      setAttendance(attendanceMap);
      setNotes(notesMap);
      setSavedData(savedDataMap);
    } catch (error) {
      console.error('Error loading existing attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const data = await studentApi.getStudents(selectedClass, selectedSection);
      setStudents(data);
      
      const initialAttendance = data.reduce((acc, student) => {
        if (!attendance[student.student_id]) {
          acc[student.student_id] = 'present';
        }
        return acc;
      }, {});
      
      setAttendance(prev => ({
        ...prev,
        ...initialAttendance
      }));

      await loadExistingAttendance();
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClassAttendance = async () => {
    try {
      const response = await attendanceApi.getClassAttendance(selectedClass, selectedSection);
      // Ensure the response is an array
      const attendanceData = Array.isArray(response) ? response : [];
      setClassAttendance(attendanceData);
    } catch (error) {
      console.error('Error loading class attendance:', error);
      setClassAttendance([]); // Set empty array on error
    }
  };

  const handleAttendanceChange = (studentId: number, status: 'present' | 'absence') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
    setSaveStatus(prev => ({ ...prev, [studentId]: 'idle' }));
  };

  const handleNotesChange = (studentId: number, value: string) => {
    setNotes(prev => ({
      ...prev,
      [studentId]: value
    }));
    setSaveStatus(prev => ({ ...prev, [studentId]: 'idle' }));
  };

  const handleAttendanceSubmit = async (studentId: number) => {
    try {
      setSaveStatus(prev => ({ ...prev, [studentId]: 'saving' }));
      
      const data = {
        student_id: studentId,
        status: attendance[studentId],
        notes: notes[studentId] || '',
        attendance_date: attendanceDate,
        class_value: selectedClass,  // Add class value
        section: selectedSection     // Add section
      };

      const { submission, updatedAttendance } = await attendanceApi.submitAttendance(data);

      // Update the class attendance state
      setClassAttendance(updatedAttendance);

      setSavedData(prev => ({
        ...prev,
        [studentId]: {
          status: data.status,
          notes: data.notes
        }
      }));

      setSaveStatus(prev => ({ ...prev, [studentId]: 'saved' }));
    } catch (error) {
      console.error('Error saving attendance:', error);
      setSaveStatus(prev => ({ ...prev, [studentId]: 'error' }));
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [studentId]: 'idle' }));
      }, 3000);
    }
  };

  const hasDataChanged = (studentId: number) => {
    const savedState = savedData[studentId];
    if (!savedState) return true;

    return (
      savedState.status !== attendance[studentId] ||
      savedState.notes !== (notes[studentId] || '')
    );
  };

  const activeLeaveRequests = mockLeaveRequests.filter(request => request.status === 'pending');

  const renderAttendanceSummary = () => {
    if (!classAttendance || classAttendance.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow mt-6 p-4">
          <h3 className="text-lg font-semibold mb-4">Class Attendance Summary</h3>
          <p className="text-gray-500">No attendance records available.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow mt-6 p-4">
        <h3 className="text-lg font-semibold mb-4">Class Attendance Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Absent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classAttendance.map((day, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(day.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {day.present_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {day.absent_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {Math.round((day.present_count / (day.present_count + day.absent_count)) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="block w-full rounded-lg border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {classes.map((cls) => (
              <option key={cls} value={cls}>Class {cls}th</option>
            ))}
          </select>
        </div>

        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Section
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="block w-full rounded-lg border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {sections.map((section) => (
              <option key={section} value={section}>Section {section}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6 flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attendance Date
          </label>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="block w-64 rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={loadExistingAttendance}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
        >
          Refresh Data
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center p-4 border-b">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Mark Attendance</h2>
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.student_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.student_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.student_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAttendanceChange(student.student_id, 'present')}
                      className={`p-2 rounded-lg ${
                        attendance[student.student_id] === 'present'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(student.student_id, 'absence')}
                      className={`p-2 rounded-lg ${
                        attendance[student.student_id] === 'absence'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    value={notes[student.student_id] || ''}
                    onChange={(e) => handleNotesChange(student.student_id, e.target.value)}
                    className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add notes..."
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {saveStatus[student.student_id] === 'saving' ? (
                      <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg flex items-center gap-2" disabled>
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                        Saving...
                      </button>
                    ) : saveStatus[student.student_id] === 'saved' && !hasDataChanged(student.student_id) ? (
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Saved
                      </span>
                    ) : saveStatus[student.student_id] === 'error' ? (
                      <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Failed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAttendanceSubmit(student.student_id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        Save
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderAttendanceSummary()}

      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h2 className="text-lg font-semibold mb-4">{t('teacher.attendance.leaveRequests')}</h2>
        <div className="space-y-4">
          {activeLeaveRequests.map((request) => (
            <div key={request.id} className="p-3 bg-gray-50 rounded">
              <div className="flex justify-between">
                <p className="font-medium">{request.studentName}</p>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  {request.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {request.startDate} to {request.endDate}
              </p>
              <p className="text-sm mt-1">{request.reason}</p>
              <div className="mt-2 flex gap-2">
                <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                  Approve
                </button>
                <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                  Reject
                </button>
              </div>
            </div>
          ))}
          {activeLeaveRequests.length === 0 && (
            <p className="text-gray-500 text-sm">No pending leave requests</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;