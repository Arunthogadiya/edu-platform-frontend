import React, { useState, useEffect } from 'react';
import { dashboardService } from '@services/dashboardService';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Book, Award, AlertTriangle, Info } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Student {
  student_id: number;
  student_name: string;
  gender: string;
  subjects: Subject[];
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

interface StudentFilter {
  class_value: string;
  section: string;
}

const TeacherAssessment: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StudentFilter>({
    class_value: '',
    section: ''
  });

  useEffect(() => {
    loadStudents();
  }, [filter]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await dashboardService.fetchStudents(filter.class_value, filter.section);
      setStudents(response.students || []);
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Failed to load student data. Please try again later.');
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const gradeToNumber = (grade: string): number => {
    const gradeMap: { [key: string]: number } = {
      'A+': 100, 'A': 95, 'A-': 90,
      'B+': 87, 'B': 83, 'B-': 80,
      'C+': 77, 'C': 73, 'C-': 70,
      'D+': 67, 'D': 63, 'D-': 60,
      'F': 50
    };
    return gradeMap[grade] || 0;
  };

  const calculateClassStats = (students: Student[]) => {
    if (!students.length) return null;

    const studentCount = students.length;  // Store actual student count

    const allGrades = students.flatMap(student => 
      student.subjects.flatMap(subject => 
        subject.grades.map(g => gradeToNumber(g.grade))
      )
    );

    const average = allGrades.reduce((acc, val) => acc + val, 0) / allGrades.length;

    return {
      average,
      totalStudents: studentCount,  // Use actual count
      totalAssessments: allGrades.length
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="space-y-4 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>{error}</p>
          <button
            onClick={loadStudents}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const classStats = calculateClassStats(students);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Filter Controls */}
      <div className="mb-6 flex gap-4">
        <select
          value={filter.class_value}
          onChange={(e) => setFilter(prev => ({ ...prev, class_value: e.target.value }))}
          className="px-4 py-2 border rounded"
        >
          <option value="">Select Class</option>
          {['6', '7', '8', '9', '10'].map(cls => (
            <option key={cls} value={cls}>Class {cls}</option>
          ))}
        </select>
        
        <select
          value={filter.section}
          onChange={(e) => setFilter(prev => ({ ...prev, section: e.target.value }))}
          className="px-4 py-2 border rounded"
        >
          <option value="">Select Section</option>
          {['A', 'B', 'C', 'D'].map(section => (
            <option key={section} value={section}>Section {section}</option>
          ))}
        </select>

        <select
          value={selectedStudent || ''}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="">All Students</option>
          {students.map(student => (
            <option key={student.student_id} value={student.student_id}>
              {student.student_name}
            </option>
          ))}
        </select>
      </div>

      {/* Class Statistics */}
      {classStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Class Average</p>
                <p className="text-2xl font-bold">{classStats.average.toFixed(1)}%</p>
              </div>
              <Award className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{classStats.totalStudents}</p>
              </div>
              <Book className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Assessments</p>
                <p className="text-2xl font-bold">{classStats.totalAssessments}</p>
              </div>
              <Info className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Student List */}
      <div className="space-y-6">
        {(selectedStudent ? 
          students.filter(s => s.student_id.toString() === selectedStudent) : 
          students
        ).map(student => (
          <div key={student.student_id} className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">{student.student_name}</h3>
            
            <div className="space-y-4">
              {student.subjects.map(subject => (
                <div key={subject.subject} className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{subject.subject}</h4>
                    {subject.alert && (
                      <AlertTriangle className="text-red-500" size={20} />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {subject.grades.map((grade, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{new Date(grade.date).toLocaleDateString()}</span>
                        <span className="font-medium">{grade.grade}</span>
                      </div>
                    ))}
                  </div>

                  {subject.alert && (
                    <div className="mt-2 text-sm text-red-600">
                      Attention needed - Consider additional support
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherAssessment;
