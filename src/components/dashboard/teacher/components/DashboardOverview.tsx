import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ClipboardCheck, FileText, BookOpen, TrendingUp, Calendar, Search, UserPlus, X } from 'lucide-react';
import { studentApi, Student } from '../../../../services/api/studentApi';
import { attendanceApi } from '../../../../services/api/attendanceApi';
import { useAttendance } from '../../../../context/AttendanceContext';

interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  avgPerformance: number;
  upcomingTests: number;
}

const DashboardOverview: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('6');
  const [selectedSection, setSelectedSection] = useState('A');
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    presentToday: 0,
    avgPerformance: 0,
    upcomingTests: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewStudentModal, setShowNewStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    student_id: '',
    student_name: '',
    parent_name: '',
    parent_phone: '',  // Changed from phone_number
    gender: '',
    date_of_birth: '',
  });
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { attendanceStats, refreshAttendance } = useAttendance();

  const classes = ['6', '7', '8', '9', '10'];
  const sections = ['A', 'B', 'C'];

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading data for:', { selectedClass, selectedSection });

      // Get students data
      const studentsData = await studentApi.getStudents(selectedClass, selectedSection);
      setStudents(Array.isArray(studentsData) ? studentsData : []);

      // Get attendance overview for the class
      const attendanceOverview = await attendanceApi.getClassOverview(selectedClass, selectedSection);
      
      setStats({
        totalStudents: studentsData.length,
        presentToday: attendanceOverview.presentCount,
        avgPerformance: Math.round((attendanceOverview.presentCount / attendanceOverview.totalRecords) * 100) || 0,
        upcomingTests: 0
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load data. Please try again.');
      setStats({
        totalStudents: 0,
        presentToday: 0,
        avgPerformance: 0,
        upcomingTests: 0
      });
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data when component mounts or class/section changes
  useEffect(() => {
    if (selectedClass && selectedSection) {
      refreshAttendance(selectedClass, selectedSection);
      loadData();
    }
  }, [selectedClass, selectedSection, refreshAttendance]);

  // Add a refresh interval (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedClass && selectedSection) {
        loadData();
      }
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [selectedClass, selectedSection]);

  const filteredStudents = students.filter(student =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const quickActions = [
    {
      title: 'Take Attendance',
      icon: ClipboardCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      path: '/teacher/dashboard/attendance'
    },
    {
      title: 'Add Assessment',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      path: '/teacher/dashboard/assessments'
    },
    {
      title: 'Record Behavior',
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      path: '/teacher/dashboard/behavior'
    },
    {
      title: 'Generate Report',
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      path: '/teacher/dashboard/performance'
    }
  ];

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true); // Show loading state while submitting
      const response = await studentApi.addStudent({
        ...newStudent,
        class_value: selectedClass,
        section: selectedSection,
      });
      
      // Close modal and reset form
      setShowNewStudentModal(false);
      setNewStudent({
        student_id: '',
        student_name: '',
        parent_name: '',
        parent_phone: '',
        gender: '',
        date_of_birth: '',
      });

      // Immediately reload the students data
      await loadData();

      // Show success message (optional)
      alert('Student added successfully!');
      
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAttendanceStats = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Present Today</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">
              {attendanceStats.presentToday}
            </p>
            <p className="ml-2 text-sm text-gray-500">
              / {attendanceStats.totalStudents}
            </p>
          </div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <ClipboardCheck className="h-6 w-6 text-green-600" />
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg">
        {error}
        <button 
          onClick={() => loadData()}
          className="ml-4 text-blue-600 hover:text-blue-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Enhanced Class and Section Selection */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-64">
          <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Class
          </label>
          <div className="relative">
            <select
              id="class-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="block w-full rounded-lg border-gray-300 bg-white py-2.5 pl-4 pr-10 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition duration-150"
            >
              {classes.map((cls) => (
                <option key={cls} value={cls}>Class {cls}th</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="w-64">
          <label htmlFor="section-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Section
          </label>
          <div className="relative">
            <select
              id="section-select"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="block w-full rounded-lg border-gray-300 bg-white py-2.5 pl-4 pr-10 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition duration-150"
            >
              {sections.map((section) => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Class Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalStudents || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {renderAttendanceStats()}

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Class Average</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgPerformance}%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Tests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingTests}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Student List Section with New Button */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Class Students</h2>
            <button
              onClick={() => setShowNewStudentModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <UserPlus className="h-5 w-5" />
              <span>New Student</span>
            </button>
          </div>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          {students.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No students found for the selected class and section.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.student_id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.student_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.student_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.gender}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => navigate(`/teacher/dashboard/student/${student.student_id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* New Student Modal */}
      {showNewStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add New Student</h2>
              <button
                onClick={() => setShowNewStudentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudent.student_id}
                    onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter student ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudent.student_name}
                    onChange={(e) => setNewStudent({ ...newStudent, student_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter student name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    required
                    value={newStudent.date_of_birth}
                    onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    required
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudent.parent_name}
                    onChange={(e) => setNewStudent({ ...newStudent, parent_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter parent name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={newStudent.parent_phone}
                    onChange={(e) => setNewStudent({ ...newStudent, parent_phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter parent phone number"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewStudentModal(false)}
                  className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Overview Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance Overview</h2>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            Present: {stats.presentToday} / {stats.totalStudents} students
          </div>
          <div className="text-sm text-gray-500">
            {Math.round((stats.presentToday / stats.totalStudents) * 100)}% attendance rate
          </div>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${(stats.presentToday / stats.totalStudents) * 100}%` }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className={`${action.bgColor} p-4 rounded-lg hover:shadow-md transition-all duration-200
                flex flex-col items-center justify-center text-center space-y-2 group`}
            >
              <action.icon className={`h-8 w-8 ${action.color} group-hover:scale-110 transition-transform duration-200`} />
              <span className={`font-medium ${action.color}`}>{action.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          {/* <h3 className="font-bold">Debug Info:</h3> */}
          {/* <pre className="mt-2 text-sm">
            {JSON.stringify(
              {
                selectedClass,
                selectedSection,
                studentsCount: students.length,
                stats,
                firstStudent: students[0],
              },
              null,
              2
            )}
          </pre> */}
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
