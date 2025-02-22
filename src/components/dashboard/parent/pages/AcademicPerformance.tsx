import React, { useState, useEffect } from 'react';
import { dashboardService } from '@services/dashboardService';
import { authService } from '@services/authService';
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
  Legend,
  ChartOptions
} from 'chart.js';
import { TrendingUp, TrendingDown, Minus, Book, Award, AlertTriangle, Info } from 'lucide-react';

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

const getSubjectColor = (subject: string): string => {
  const colors: Record<string, string> = {
    Mathematics: '#4F46E5', // Indigo
    Science: '#059669',     // Green
    English: '#DC2626',     // Red
    History: '#D97706',     // Amber
    Geography: '#7C3AED'    // Purple
  };
  return colors[subject] || '#6B7280'; // Default gray if subject not found
};

interface Grade {
  date: string;
  grade: string;
}

interface Subject {
  subject: string;
  grades: Grade[];
  alert: boolean;
}

interface Student {
  student_id: number;
  student_name: string;
  gender: string;
  subjects: Subject[];
}

interface GradesResponse {
  students: Student[];
}

const AcademicPerformance: React.FC = () => {
  const [grades, setGrades] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = authService.getCurrentUser();
      
      const response = await dashboardService.fetchGrades('', ''); // Parameters not needed
      if (!response.students?.[0]?.subjects) {
        throw new Error('No grade data available');
      }

      // Get the first student's subjects
      const studentSubjects = response.students[0].subjects;
      setGrades(studentSubjects);
    } catch (err) {
      console.error('Error loading grades:', err);
      setError('Failed to load academic data. Please try again later.');
      setGrades([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert letter grade to number
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

  // Calculate statistics using letter grades
  const calculateStats = () => {
    const subjectAverages = grades.map(subject => ({
      subject: subject.subject,
      averageScore: subject.grades.reduce((acc, g) => acc + gradeToNumber(g.grade), 0) / subject.grades.length
    }));

    const overallAvg = subjectAverages.reduce((acc, subj) => acc + subj.averageScore, 0) / subjectAverages.length;

    return {
      overallAverage: overallAvg,
      bestSubject: subjectAverages.reduce((best, current) => 
        current.averageScore > best.averageScore ? current : best
      ),
      needsAttention: subjectAverages.reduce((worst, current) => 
        current.averageScore < worst.averageScore ? current : worst
      )
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="space-y-4 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading academic performance data...</p>
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
            onClick={loadGrades}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall Average</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overallAverage.toFixed(1)}%</p>
            </div>
            <Award className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Best Subject</p>
              <p className="text-2xl font-bold text-gray-900">{stats.bestSubject.subject}</p>
            </div>
            <Book className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900">
                {grades.reduce((sum, subject) => sum + subject.grades.length, 0)}
              </p>
            </div>
            <Info className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Needs Attention</p>
              <p className="text-2xl font-bold text-gray-900">{stats.needsAttention.subject}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
          <div className="h-[300px]">
            <Bar
              data={{
                labels: grades.map(g => g.subject),
                datasets: [{
                  label: 'Average Score',
                  data: grades.map(g => g.grades.reduce((acc, grade) => acc + gradeToNumber(grade.grade), 0) / g.grades.length),
                  backgroundColor: grades.map(g => getSubjectColor(g.subject)),
                  borderColor: grades.map(g => getSubjectColor(g.subject)),
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, max: 100 } }
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
          <div className="h-[300px]">
            <Line
              data={{
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: grades.map(subject => ({
                  label: subject.subject,
                  data: subject.grades.map(g => gradeToNumber(g.grade)),
                  borderColor: getSubjectColor(subject.subject),
                  tension: 0.4
                }))
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, max: 100 } }
              }}
            />
          </div>
        </div>
      </div>

      {/* Detailed Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grades.map(subject => (
          <div key={subject.subject} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{subject.subject}</h3>
              {subject.alert && <AlertTriangle className="text-red-500" size={20} />}
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average</span>
                <span className="text-xl font-bold text-gray-900">{(subject.grades.reduce((acc, g) => acc + gradeToNumber(g.grade), 0) / subject.grades.length).toFixed(1)}%</span>
              </div>
              <div className="space-y-2">
                {subject.grades.map((grade, idx) => (
                  <div key={idx} className="text-sm text-gray-600 flex justify-between">
                    <span>{new Date(grade.date).toLocaleDateString()}</span>
                    <span className="font-medium">{grade.grade}</span>
                  </div>
                ))}
              </div>
              {subject.alert && (
                <div className="mt-4 text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">
                  <p className="font-medium">Improvement Needed</p>
                  <p className="mt-1">Consider scheduling a teacher consultation.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AcademicPerformance;