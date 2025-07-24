import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ClipboardCheck, FileText, BookOpen, TrendingUp, Calendar, Search, UserPlus, X, BarChart3, Activity, Award, Clock } from 'lucide-react';
import { studentApi, Student } from '../../../../services/api/studentApi';
import { attendanceApi } from '../../../../services/api/attendanceApi';
import { useAttendance } from '../../../../context/AttendanceContext';
import TeacherCard from '../../../ui/TeacherCard';

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
    parent_phone: '',
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

  // Quick actions data
  const quickActions = [
    {
      title: 'Take Attendance',
      icon: ClipboardCheck,
      path: '/teacher/dashboard/attendance',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100'
    },
    {
      title: 'View Grades',
      icon: FileText,
      path: '/teacher/dashboard/assessments',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100'
    },
    {
      title: 'Messages',
      icon: Users,
      path: '/teacher/dashboard/communication',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      title: 'Resources',
      icon: BookOpen,
      path: '/teacher/dashboard/resources',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 hover:bg-amber-100'
    }
  ];

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStudent.student_id || !newStudent.student_name || !newStudent.parent_name || !newStudent.parent_phone || !newStudent.gender || !newStudent.date_of_birth) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Adding student:', newStudent);

      const studentData = {
        ...newStudent,
        class_value: selectedClass,
        section: selectedSection,
      };

      await studentApi.addStudent(studentData);

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
    <TeacherCard variant="gradient" className="hover:scale-105">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Present Today</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-display font-bold text-gray-900">
              {attendanceStats.presentToday}
            </p>
            <p className="ml-2 text-sm text-gray-500">
              / {attendanceStats.totalStudents}
            </p>
          </div>
        </div>
        <div className="p-3 bg-gradient-to-br from-success to-mint rounded-xl">
          <ClipboardCheck className="h-6 w-6 text-white" />
        </div>
      </div>
    </TeacherCard>
  );



  // Quick actions data
  const quickActions = [
    {
      title: 'Take Attendance',
      icon: ClipboardCheck,
      path: '/teacher/dashboard/attendance',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100'
    },
    {
      title: 'View Grades',
      icon: FileText,
      path: '/teacher/dashboard/assessments',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100'
    },
    {
      title: 'Messages',
      icon: Users,
      path: '/teacher/dashboard/communication',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      title: 'Resources',
      icon: BookOpen,
      path: '/teacher/dashboard/resources',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 hover:bg-amber-100'
    }
  ];

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStudent.student_id || !newStudent.student_name || !newStudent.parent_name || !newStudent.parent_phone || !newStudent.gender || !newStudent.date_of_birth) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Adding student:', newStudent);

      const studentData = {
        ...newStudent,
        class_value: selectedClass,
        section: selectedSection,
      };

      await studentApi.addStudent(studentData);

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
    <TeacherCard variant="gradient" className="hover:scale-105">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Present Today</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-display font-bold text-gray-900">
              {attendanceStats.presentToday}
            </p>
            <p className="ml-2 text-sm text-gray-500">
              / {attendanceStats.totalStudents}
            </p>
          </div>
        </div>
        <div className="p-3 bg-gradient-to-br from-success to-mint rounded-xl">
          <ClipboardCheck className="h-6 w-6 text-white" />
        </div>
      </div>
    </TeacherCard>
  );

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <TeacherCard variant="glass" className="max-w-md text-center">
          <div className="text-red-600 mb-4">
            <X className="h-12 w-12 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={() => loadData()}
            className="btn-primary w-full"
          >
            Try Again
          </button>
        </TeacherCard>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="shimmer w-16 h-16 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Modern Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-neutral-900 tracking-tight">
            Class Dashboard
          </h1>
          <p className="text-neutral-600 text-lg">
            Manage your class {selectedClass}{selectedSection} • {stats.totalStudents} students enrolled
          </p>
        </div>
        
        {/* Enhanced Class Selection */}
        <div className="flex gap-4">
          <div className="stats-card p-4 min-w-0">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent border-0 focus:ring-0 font-bold text-neutral-900 cursor-pointer 
                       text-lg appearance-none pr-8"
              style={{backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em'}}
            >
              {classes.map((cls) => (
                <option key={cls} value={cls}>Class {cls}th</option>
              ))}
            </select>
          </div>
          
          <div className="stats-card p-4 min-w-0">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-transparent border-0 focus:ring-0 font-bold text-neutral-900 cursor-pointer 
                       text-lg appearance-none pr-8"
              style={{backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em'}}
            >
              {sections.map((section) => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Modern Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="stats-card group cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl 
              shadow-lg group-hover:shadow-xl transition-shadow">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total</div>
              <div className="text-2xl font-display font-bold text-neutral-900">
                {stats.totalStudents || 0}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-700 mb-1">Total Students</h3>
            <p className="text-xs text-neutral-500">Enrolled in your class</p>
          </div>
        </div>

        {/* Present Today */}
        <div className="stats-card group cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-mint to-success rounded-2xl 
              shadow-lg group-hover:shadow-xl transition-shadow">
              <ClipboardCheck className="h-7 w-7 text-white" />
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Present</div>
              <div className="text-2xl font-display font-bold text-neutral-900">
                {attendanceStats.presentToday || stats.presentToday}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-700 mb-1">Present Today</h3>
            <p className="text-xs text-neutral-500">Out of {attendanceStats.totalStudents || stats.totalStudents} students</p>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="stats-card group cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-coral to-accent rounded-2xl 
              shadow-lg group-hover:shadow-xl transition-shadow">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Rate</div>
              <div className="text-2xl font-display font-bold text-neutral-900">
                {stats.avgPerformance}%
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-700 mb-1">Attendance Rate</h3>
            <p className="text-xs text-neutral-500">This week's average</p>
          </div>
        </div>

        {/* Upcoming Tests */}
        <div className="stats-card group cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-amber to-warning rounded-2xl 
              shadow-lg group-hover:shadow-xl transition-shadow">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Upcoming</div>
              <div className="text-2xl font-display font-bold text-neutral-900">
                {stats.upcomingTests || 0}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-700 mb-1">Upcoming Tests</h3>
            <p className="text-xs text-neutral-500">Scheduled this week</p>
          </div>
        </div>
      </div>
            </div>
          </div>
        </TeacherCard>

        
      </div>

      {/* Enhanced Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <button
            key={action.title}
            onClick={() => navigate(action.path)}
            className="stats-card group cursor-pointer text-left p-6 hover:scale-105 
              transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow
                ${action.title === 'Take Attendance' ? 'bg-gradient-to-br from-mint to-success' :
                  action.title === 'View Grades' ? 'bg-gradient-to-br from-primary-500 to-primary-700' :
                  action.title === 'Messages' ? 'bg-gradient-to-br from-coral to-accent' :
                  'bg-gradient-to-br from-amber to-warning'}`}> 
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-700 mb-1">{action.title}</h3>
              <p className="text-xs text-neutral-500">
                {action.title === 'Take Attendance' ? 'Mark today\u2019s attendance' :
                 action.title === 'View Grades' ? 'Review assessments' :
                 action.title === 'Messages' ? 'Communicate with parents' :
                 'Access learning materials'}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Enhanced Student Management Section */}
      <div className="stats-card p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h2 className="text-xl font-display font-bold text-neutral-900 mb-2">
              Class Students
            </h2>
            <p className="text-neutral-600">
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 
                         focus:ring-primary-500/20 focus:border-primary-300 transition-all"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            </div>
            <button
              onClick={() => setShowNewStudentModal(true)}
              className="btn-primary flex items-center gap-2 px-6"
            >
              <UserPlus className="w-4 h-4" />
              Add Student
            </button>
          </div>
        </div>

        {/* Enhanced Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.slice(0, 6).map((student) => (
            <div key={student.student_id} 
              className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg 
                        transition-all duration-300 hover:scale-102 cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 
                  rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {student.student_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900 truncate group-hover:text-primary-700">
                    {student.student_name}
                  </h3>
                  <p className="text-sm text-neutral-500">ID: {student.student_id}</p>
                  <p className="text-xs text-neutral-400">{student.parent_name}</p>
                </div>
              </div>
            </div>
          ))}
          
          {filteredStudents.length > 6 && (
            <div className="bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-xl 
              p-6 flex items-center justify-center hover:border-primary-300 transition-colors cursor-pointer">
              <div className="text-center">
                <p className="text-neutral-600 font-medium">
                  +{filteredStudents.length - 6} more students
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  Click to view all students
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Modal */}
      {showNewStudentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-display font-bold text-neutral-900">Add New Student</h3>
                <button
                  onClick={() => setShowNewStudentModal(false)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Student ID</label>
                <input
                  type="text"
                  value={newStudent.student_id}
                  onChange={(e) => setNewStudent({...newStudent, student_id: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 
                           focus:ring-primary-500/20 focus:border-primary-300 transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Student Name</label>
                <input
                  type="text"
                  value={newStudent.student_name}
                  onChange={(e) => setNewStudent({...newStudent, student_name: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 
                           focus:ring-primary-500/20 focus:border-primary-300 transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Parent Name</label>
                <input
                  type="text"
                  value={newStudent.parent_name}
                  onChange={(e) => setNewStudent({...newStudent, parent_name: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 
                           focus:ring-primary-500/20 focus:border-primary-300 transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Parent Phone</label>
                <input
                  type="tel"
                  value={newStudent.parent_phone}
                  onChange={(e) => setNewStudent({...newStudent, parent_phone: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 
                           focus:ring-primary-500/20 focus:border-primary-300 transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Gender</label>
                <select
                  value={newStudent.gender}
                  onChange={(e) => setNewStudent({...newStudent, gender: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 
                           focus:ring-primary-500/20 focus:border-primary-300 transition-all"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={newStudent.date_of_birth}
                  onChange={(e) => setNewStudent({...newStudent, date_of_birth: e.target.value})}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 
                           focus:ring-primary-500/20 focus:border-primary-300 transition-all"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewStudentModal(false)}
                  className="flex-1 px-4 py-3 border border-neutral-200 text-neutral-700 rounded-xl 
                           hover:bg-neutral-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 btn-primary"
                >
                  {isLoading ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
      </div>

      {/* Student Management Section */}
      <TeacherCard 
        title="Class Students" 
        subtitle={`${filteredStudents.length} student${filteredStudents.length !== 1 ? 's' : ''} found`}
        action={
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-colors"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={() => setShowNewStudentModal(true)}
              className="btn-accent flex items-center gap-2"
            >
              <UserPlus className="h-5 w-5" />
              New Student
            </button>
          </div>
        }
      >
        <div className="overflow-hidden rounded-xl border border-gray-200/50">
          {students.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-1">No students found</p>
              <p className="text-sm">Add students to get started with your class management.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200/50">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200/30">
                {filteredStudents.map((student) => (
                  <tr key={student.student_id} className="hover:bg-gray-50/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.student_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.student_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {student.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => navigate(`/teacher/dashboard/student/${student.student_id}`)}
                        className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
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
      </TeacherCard>

      {/* Quick Actions */}
      <TeacherCard title="Quick Actions" subtitle="Access commonly used features">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className={`${action.bgColor} p-6 rounded-xl hover:shadow-md transition-all duration-200
                flex flex-col items-center justify-center text-center space-y-3 group border border-gray-100`}
            >
              <action.icon className={`h-8 w-8 ${action.color} group-hover:scale-110 transition-transform duration-200`} />
              <span className={`font-medium ${action.color}`}>{action.title}</span>
            </button>
          ))}
        </div>
      </TeacherCard>

      {/* Add Student Modal */}
      {showNewStudentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900">Add New Student</h2>
                <p className="text-gray-500 mt-1">Fill in the student details below</p>
              </div>
              <button
                onClick={() => setShowNewStudentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Student ID
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudent.student_id}
                    onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-colors"
                    placeholder="Enter student ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Student Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudent.student_name}
                    onChange={(e) => setNewStudent({ ...newStudent, student_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-colors"
                    placeholder="Enter student name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    required
                    value={newStudent.date_of_birth}
                    onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    required
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-colors"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Parent Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudent.parent_name}
                    onChange={(e) => setNewStudent({ ...newStudent, parent_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-colors"
                    placeholder="Enter parent name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Parent Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={newStudent.parent_phone}
                    onChange={(e) => setNewStudent({ ...newStudent, parent_phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-colors"
                    placeholder="Enter parent phone number"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowNewStudentModal(false)}
                  className="px-6 py-3 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-6 py-3"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
