import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, X } from 'lucide-react';  // Remove unused icons
import { studentApi, Student } from '@/services/api/studentApi';
import { gradeApi, GRADE_OPTIONS, GradeValue } from '@/services/api/gradeApi';  // Use the @/ alias instead of relative path
import { GradeOverview } from './GradeOverview';

// Remove duplicate Student interface and keep other interfaces
interface StudentDetails {
  name: string;
  rollNo: string;
  class: string;
  section: string;
  grades: GradeDetail[];
  assignments: Assignment[];
}

interface GradeDetail {
  title: string;
  type: string;
  score: GradeValue;
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

interface Subject {
  subject: string;
  grades: Grade[];
  alert: boolean;
}

interface Grade {
  date: string;
  grade: string;
}

// Simplify NewGrade interface to match API requirements
interface NewGrade {
  subject: string;
  grade: GradeValue;
}

const StudentPerformance: React.FC = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    class_value: '',
    section: ''
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [newGrade, setNewGrade] = useState<NewGrade>({
    subject: '',
    grade: '' as GradeValue
  });
  const [selectedStudentData, setSelectedStudentData] = useState<StudentDetails | null>(null);
  const [classGrades, setClassGrades] = useState<GradeResponse[]>([]);

  useEffect(() => {
    if (filters.class_value && filters.section) {
      loadStudents();
    }
  }, [filters.class_value, filters.section]);

  useEffect(() => {
    if (selectedStudent) {
      // Fetch student details when a student is selected
      fetchStudentDetails(selectedStudent);
    }
  }, [selectedStudent]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const students = await studentApi.getStudents(filters.class_value, filters.section);
      console.log('Students data:', students);
      if (Array.isArray(students)) {
        setStudents(students);
      } else {
        console.error('Invalid students data:', students);
        setError('Invalid data format received');
        setStudents([]);
      }
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Failed to load students');
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update fetchStudentDetails
  const fetchStudentDetails = async (studentId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [gradesData, student] = await Promise.all([
        gradeApi.getGrades(filters.class_value, filters.section),
        students.find(s => s.student_id.toString() === studentId)
      ]);

      if (!student) {
        throw new Error('Student not found');
      }

      // Find the student's grades from the response
      const studentData = gradesData.students.find(s => s.student_id.toString() === studentId);
      const grades = studentData?.subjects.flatMap(subject => 
        subject.grades.map(g => ({
          title: subject.subject,
          type: "Grade",
          score: g.grade as GradeValue,
          maxScore: 100,
          date: g.date
        }))
      ) || [];

      const studentDetails: StudentDetails = {
        name: student.student_name,
        rollNo: studentId,
        class: filters.class_value,
        section: filters.section,
        grades: grades,
        assignments: [] // Empty array for now
      };

      setSelectedStudentData(studentDetails);
      setError(null);
    } catch (error) {
      console.error('Error in fetchStudentDetails:', error);
      setError(error instanceof Error ? error.message : 'Failed to load student details');
      setSelectedStudentData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified handleSaveGrade function
  const handleSaveGrade = async () => {
    if (!selectedStudent) return;
    
    try {
      const gradeData = {
        student_id: selectedStudent,
        subject: newGrade.subject,
        grade: newGrade.grade,
        record_date: new Date().toISOString().split('T')[0]
      };

      await gradeApi.postGrade(gradeData);
      setShowAddGradeModal(false);
      // Reset the form
      setNewGrade({
        subject: '',
        grade: '' as GradeValue
      });
      // Refresh student data
      await fetchStudentDetails(selectedStudent);
    } catch (error) {
      console.error('Error saving grade:', error);
      setError('Failed to save grade');
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toString().includes(searchTerm)
  );

  // Update the setSelectedStudent handler
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudent(studentId);
    if (!studentId) {
      setSelectedStudentData(null);
    }
  };

  // Update loadGrades function
  const loadGrades = async () => {
    try {
      const gradesData = await gradeApi.getGrades(filters.class_value, filters.section);
      setClassGrades(processGradesForOverview(gradesData));
    } catch (error) {
      console.error('Error loading grades:', error);
    }
  };

  // Add helper function to process grades for overview
  const processGradesForOverview = (gradesData: GradesResponse): GradeResponse[] => {
    const processedGrades: GradeResponse[] = [];
    
    gradesData.students.forEach(student => {
      student.subjects.forEach(subject => {
        subject.grades.forEach(grade => {
          processedGrades.push({
            student_id: student.student_id.toString(),
            subject: subject.subject,
            grade: grade.grade,
            record_date: grade.date
          });
        });
      });
    });
    
    return processedGrades;
  };

  // Add effect to load grades when filters change
  useEffect(() => {
    if (filters.class_value && filters.section) {
      loadGrades();
    }
  }, [filters.class_value, filters.section]);

  return (
    <div className="flex-1 w-full h-full p-6 overflow-auto">
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class
          </label>
          <select
            value={filters.class_value}
            onChange={(e) => setFilters(prev => ({ ...prev, class_value: e.target.value, section: '' }))}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select Class</option>
            {['6', '7', '8', '9', '10'].map(cls => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section
          </label>
          <select
            value={filters.section}
            onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg"
            disabled={!filters.class_value}
          >
            <option value="">Select Section</option>
            {['A', 'B', 'C', 'D'].map(section => (
              <option key={section} value={section}>Section {section}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Students
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Add Grade Overview Section */}
      {filters.class_value && filters.section && classGrades.length > 0 && (
        <div className="mb-8">
          <GradeOverview grades={classGrades} />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
          <p>{error}</p>
          <button
            onClick={loadStudents}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Show message when no filters are selected */}
      {!filters.class_value || !filters.section ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Please select both class and section to view students.</p>
        </div>
      ) : (
        // Students Table
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents && filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <tr key={student.student_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.student_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.student_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleSelectStudent(student.student_id.toString())}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Rest of your component (modals, sidebars, etc.) */}
      {/* Add/Edit Grade Modal */}
      {showAddGradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Add New Grade</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveGrade(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={newGrade.subject}
                    onChange={(e) => setNewGrade({ ...newGrade, subject: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade
                  </label>
                  <select
                    value={newGrade.grade}
                    onChange={(e) => setNewGrade({ ...newGrade, grade: e.target.value as GradeValue })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Grade</option>
                    {Object.entries(GRADE_OPTIONS).map(([grade, range]) => (
                      <option key={grade} value={grade}>
                        {grade} ({range})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddGradeModal(false)}
                  className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Details Sidebar */}
      {selectedStudentData && !showAddGradeModal && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg border-l transform transition-transform duration-300 overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">{selectedStudentData.name}</h2>
              <button
                onClick={() => setSelectedStudent('')}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Student Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Student Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><span className="font-medium">Roll No:</span> {selectedStudentData.rollNo}</p>
                  <p><span className="font-medium">Class:</span> {selectedStudentData.class}</p>
                  <p><span className="font-medium">Section:</span> {selectedStudentData.section}</p>
                </div>
              </div>

              {/* Grades */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Recent Grades</h3>
                  <button
                    onClick={() => setShowAddGradeModal(true)}
                    className="px-2 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add Grade
                  </button>
                </div>
                <div className="space-y-2">
                  {selectedStudentData.grades.map((grade, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{grade.title}</p>
                          <p className="text-sm text-gray-500">{GRADE_OPTIONS[grade.score as GradeValue]}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{grade.score}</p>
                          <p className="text-sm text-gray-500">{grade.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignments */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Assignments</h3>
                <div className="space-y-2">
                  {selectedStudentData.assignments.map((assignment) => (
                    <div key={assignment.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-sm text-gray-500">Due: {assignment.dueDate}</p>
                        </div>
                        <span className={`px-2 py-1 text-sm rounded-full ${
                          assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          assignment.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {assignment.status}
                        </span>
                      </div>
                      {assignment.score !== undefined && (
                        <div className="mt-2 text-sm">
                          Score: {assignment.score}/{assignment.maxScore}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPerformance;