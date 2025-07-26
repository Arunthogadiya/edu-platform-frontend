import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus,
  Eye,
  BookOpen,
  Award,
  TrendingUp,
  Target,
  X,
  Calendar,
  BarChart3,
  GraduationCap,
  Clock,
  CheckCircle
} from 'lucide-react';

// Simple toast hook replacement
const useToast = () => ({
  toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    console.log(`${variant === 'destructive' ? 'Error' : 'Success'}: ${title} - ${description}`);
    alert(`${title}: ${description}`);
  }
});

// Import types and APIs with relative paths to avoid path alias issues
interface Student {
  student_id: number;
  student_name: string;
  gender?: string;
  roll_number?: string;
}

interface GradeDetail {
  title: string;
  type: string;
  score: string;
  maxScore: number;
  date: string;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  score?: number;
  maxScore?: number;
}

interface StudentDetails {
  name: string;
  rollNo: string;
  class: string;
  section: string;
  grades: GradeDetail[];
  assignments: Assignment[];
  overallGrade?: string;
  attendance?: number;
}

interface NewGrade {
  subject: string;
  grade: string;
}

// Custom Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const StudentPerformance: React.FC = () => {
  const [filters, setFilters] = useState({
    class_value: '',
    section: ''
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudentData, setSelectedStudentData] = useState<StudentDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [newGrade, setNewGrade] = useState<NewGrade>({
    subject: '',
    grade: ''
  });

  const { toast } = useToast();
  const classes = ['6', '7', '8', '9', '10'];
  const sections = ['A', 'B', 'C'];
  const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science'];
  const gradeOptions = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];

  // Mock student API call - replace with actual API
  const loadStudents = async () => {
    if (!filters.class_value || !filters.section) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call with timeout handling
      const response = await Promise.race([
        // Mock API call
        new Promise<Student[]>((resolve) => {
          setTimeout(() => {
            const mockStudents: Student[] = [
              { student_id: 1, student_name: 'Aarav Sharma', gender: 'Male', roll_number: '001' },
              { student_id: 2, student_name: 'Priya Patel', gender: 'Female', roll_number: '002' },
              { student_id: 3, student_name: 'Arjun Kumar', gender: 'Male', roll_number: '003' },
              { student_id: 4, student_name: 'Kavya Singh', gender: 'Female', roll_number: '004' },
              { student_id: 5, student_name: 'Dev Gupta', gender: 'Male', roll_number: '005' },
              { student_id: 6, student_name: 'Riya Mishra', gender: 'Female', roll_number: '006' }
            ];
            resolve(mockStudents);
          }, 1000);
        }),
        // Timeout handler
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 8000);
        })
      ]);
      
      setStudents(response);
    } catch (error) {
      console.error('Error loading students:', error);
      setError('Failed to load students. Please try again.');
      setStudents([]);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentDetails = async (student: Student) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call with timeout handling
      const response = await Promise.race([
        // Mock API call for student details
        new Promise<StudentDetails>((resolve) => {
          setTimeout(() => {
            const mockDetails: StudentDetails = {
              name: student.student_name,
              rollNo: student.roll_number || student.student_id.toString(),
              class: filters.class_value,
              section: filters.section,
              overallGrade: 'A',
              attendance: Math.floor(Math.random() * 20 + 80), // 80-99%
              grades: [
                { title: 'Mathematics', type: 'Test', score: 'A', maxScore: 100, date: '2024-01-15' },
                { title: 'Science', type: 'Assignment', score: 'B+', maxScore: 100, date: '2024-01-10' },
                { title: 'English', type: 'Test', score: 'A-', maxScore: 100, date: '2024-01-05' },
                { title: 'Hindi', type: 'Assignment', score: 'B', maxScore: 100, date: '2024-01-12' }
              ],
              assignments: [
                { id: '1', title: 'Math Worksheet', dueDate: '2024-01-20', status: 'submitted', score: 85, maxScore: 100 },
                { id: '2', title: 'Science Project', dueDate: '2024-01-25', status: 'pending' },
                { id: '3', title: 'English Essay', dueDate: '2024-01-18', status: 'graded', score: 92, maxScore: 100 }
              ]
            };
            resolve(mockDetails);
          }, 800);
        }),
        // Timeout handler
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 8000);
        })
      ]);
      
      setSelectedStudentData(response);
    } catch (error) {
      console.error('Error loading student details:', error);
      setError('Failed to load student details. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load student details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGrade = async () => {
    if (!selectedStudent || !newGrade.subject || !newGrade.grade) {
      toast({
        title: "Required",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Grade added successfully",
      });
      
      setShowAddGradeModal(false);
      setNewGrade({ subject: '', grade: '' });
      
      // Refresh student data
      if (selectedStudent) {
        await fetchStudentDetails(selectedStudent);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save grade",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (filters.class_value && filters.section) {
      loadStudents();
    }
  }, [filters.class_value, filters.section]);

  const filteredStudents = students.filter(student =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toString().includes(searchTerm)
  );

  const getGradeColor = (grade: string) => {
    const gradeMap: { [key: string]: string } = {
      'A+': 'text-green-700 bg-green-100 border-green-200',
      'A': 'text-green-600 bg-green-50 border-green-200',
      'A-': 'text-blue-600 bg-blue-50 border-blue-200',
      'B+': 'text-blue-500 bg-blue-50 border-blue-200',
      'B': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'B-': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'C+': 'text-orange-600 bg-orange-50 border-orange-200',
      'C': 'text-orange-600 bg-orange-50 border-orange-200',
      'D': 'text-red-600 bg-red-50 border-red-200',
      'F': 'text-red-700 bg-red-100 border-red-200'
    };
    return gradeMap[grade] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const StudentCard = ({ student }: { student: Student }) => {
    const handleViewDetails = async (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedStudent(student);
      await fetchStudentDetails(student);
    };

    // Generate mock performance metrics
    const overallGrade = ['A+', 'A', 'A-', 'B+', 'B'][Math.floor(Math.random() * 5)];
    const attendance = Math.floor(Math.random() * 20 + 80);
    const assignmentsCompleted = Math.floor(Math.random() * 5 + 8);
    const totalAssignments = 12;

    return (
      <div className="group bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-neutral-900 group-hover:text-blue-700 transition-colors">
                {student.student_name}
              </h3>
              <p className="text-sm text-neutral-500">
                Roll No: {student.roll_number || student.student_id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getGradeColor(overallGrade)}`}>
              {overallGrade}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Attendance</span>
            </div>
            <p className="text-lg font-bold text-green-800">{attendance}%</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Assignments</span>
            </div>
            <p className="text-lg font-bold text-blue-800">{assignmentsCompleted}/{totalAssignments}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-neutral-600">
                {Math.round((assignmentsCompleted / totalAssignments) * 100)}% complete
              </span>
            </div>
          </div>
          <button
            onClick={handleViewDetails}
            className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors"
          >
            View Details
            <Eye className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  if (isLoading && students.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-500 text-lg">Loading student performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
              <Users className="w-8 h-8" />
            </div>
            Student Performance
          </h1>
          <p className="text-neutral-600 text-lg">
            Track academic progress and manage student grades efficiently
          </p>
        </div>
        
        {/* Class Selection */}
        <div className="flex gap-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-4 min-w-0">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Class</label>
            <select
              value={filters.class_value}
              onChange={(e) => setFilters(prev => ({ ...prev, class_value: e.target.value }))}
              className="bg-transparent border-0 focus:ring-0 font-bold text-neutral-900 cursor-pointer text-lg appearance-none pr-8"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>Class {cls}th</option>
              ))}
            </select>
          </div>
          
          <div className="bg-white border border-neutral-200 rounded-xl p-4 min-w-0">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Section</label>
            <select
              value={filters.section}
              onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}
              className="bg-transparent border-0 focus:ring-0 font-bold text-neutral-900 cursor-pointer text-lg appearance-none pr-8"
            >
              <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium mb-1">Total Students</p>
                <p className="text-2xl font-bold text-blue-700">{students.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium mb-1">High Performers</p>
                <p className="text-2xl font-bold text-green-700">
                  {Math.floor(students.length * 0.3)}
                </p>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium mb-1">Average Grade</p>
                <p className="text-2xl font-bold text-amber-700">B+</p>
              </div>
              <BarChart3 className="w-8 h-8 text-amber-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 border border-purple-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium mb-1">Assignments</p>
                <p className="text-2xl font-bold text-purple-700">12</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Actions */}
      {students.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search students by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
              />
            </div>
            <button
              onClick={() => setShowAddGradeModal(true)}
              disabled={!selectedStudent}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add Grade
            </button>
          </div>
        </div>
      )}

      {/* Students Grid */}
      {isLoading && students.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-neutral-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-24"></div>
                    <div className="h-3 bg-neutral-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="h-16 bg-neutral-200 rounded-xl"></div>
                  <div className="h-16 bg-neutral-200 rounded-xl"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <StudentCard key={student.student_id} student={student} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
              <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">No Students Found</h3>
              <p className="text-neutral-500">
                {filters.class_value && filters.section ? 
                  'No students found for selected class and section' : 
                  'Please select a class and section to view students'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Add Grade Modal */}
      <Modal
        isOpen={showAddGradeModal}
        onClose={() => setShowAddGradeModal(false)}
        title="Add New Grade"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSaveGrade(); }} className="space-y-6">
          {selectedStudent && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700">
                Adding grade for: <span className="font-semibold">{selectedStudent.student_name}</span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">Subject</label>
            <select
              value={newGrade.subject}
              onChange={(e) => setNewGrade(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">Grade</label>
            <select
              value={newGrade.grade}
              onChange={(e) => setNewGrade(prev => ({ ...prev, grade: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
            >
              <option value="">Select Grade</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !newGrade.subject || !newGrade.grade}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-cyan-700 transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Adding Grade...
              </div>
            ) : (
              'Add Grade'
            )}
          </button>
        </form>
      </Modal>

      {/* Student Details Modal */}
      <Modal
        isOpen={!!selectedStudent && !!selectedStudentData}
        onClose={() => {
          setSelectedStudent(null);
          setSelectedStudentData(null);
        }}
        title={`${selectedStudentData?.name}'s Performance Details`}
      >
        {selectedStudentData && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                <GraduationCap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-700">Overall Grade</p>
                <p className="text-xl font-bold text-blue-800">{selectedStudentData.overallGrade}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-700">Attendance</p>
                <p className="text-xl font-bold text-green-800">{selectedStudentData.attendance}%</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center">
                <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-purple-700">Total Grades</p>
                <p className="text-xl font-bold text-purple-800">{selectedStudentData.grades.length}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
                <Target className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-amber-700">Assignments</p>
                <p className="text-xl font-bold text-amber-800">{selectedStudentData.assignments.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Grades</h3>
                <div className="space-y-3">
                  {selectedStudentData.grades.map((grade, index) => (
                    <div key={index} className="p-4 bg-white border border-neutral-200 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-neutral-900">{grade.title}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getGradeColor(grade.score)}`}>
                          {grade.score}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Clock className="w-3 h-3" />
                        {new Date(grade.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Assignment Status</h3>
                <div className="space-y-3">
                  {selectedStudentData.assignments.map((assignment) => (
                    <div key={assignment.id} className="p-4 bg-white border border-neutral-200 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-neutral-900">{assignment.title}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          assignment.status === 'graded' ? 'bg-green-100 text-green-700' :
                          assignment.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {assignment.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-neutral-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                        {assignment.score && (
                          <span className="font-medium">
                            {assignment.score}/{assignment.maxScore}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentPerformance;
