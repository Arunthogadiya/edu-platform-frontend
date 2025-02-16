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
  Legend,
  ChartOptions
} from 'chart.js';
import { TrendingUp, TrendingDown, Minus, Book, Award, AlertTriangle, Info } from 'lucide-react';
import type { SubjectGrades } from '@data/mockGradesData';

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

const AcademicPerformance: React.FC = () => {
  const [grades, setGrades] = useState<SubjectGrades[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await dashboardService.getMockGrades();
      if (!response.subjects || response.subjects.length === 0) {
        throw new Error('No grade data available');
      }
      setGrades(response.subjects);
    } catch (err) {
      console.error('Error loading grades:', err);
      setError('Failed to load academic data. Please try again later.');
      setGrades([]);
    } finally {
      setIsLoading(false);
    }
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

  // Calculate overall statistics
  const overallAverage = grades.reduce((acc, subject) => acc + (subject.averageScore || 0), 0) / grades.length;
  const bestSubject = grades.reduce((best, current) => 
    (current.averageScore || 0) > (best.averageScore || 0) ? current : best
  );
  const needsAttention = grades.reduce((worst, current) => 
    (current.averageScore || 0) < (worst.averageScore || 0) ? current : worst
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall Average</p>
              <p className="text-2xl font-bold text-gray-900">{overallAverage.toFixed(1)}%</p>
            </div>
            <Award className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Best Subject</p>
              <p className="text-2xl font-bold text-gray-900">{bestSubject.subject}</p>
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
              <p className="text-2xl font-bold text-gray-900">{needsAttention.subject}</p>
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
                  data: grades.map(g => g.averageScore || 0),
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
                  data: subject.grades.map(g => g.score || 0),
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
              {subject.trend === 'up' && <TrendingUp className="text-green-500" size={20} />}
              {subject.trend === 'down' && <TrendingDown className="text-red-500" size={20} />}
              {subject.trend === 'stable' && <Minus className="text-gray-500" size={20} />}
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average</span>
                <span className="text-xl font-bold text-gray-900">{subject.averageScore?.toFixed(1)}%</span>
              </div>
              <div className="space-y-2">
                {subject.grades.map((grade, idx) => (
                  <div key={idx} className="text-sm text-gray-600 flex justify-between">
                    <span>{grade.assignment || `Assessment ${idx + 1}`}</span>
                    <span className="font-medium">{grade.score}%</span>
                  </div>
                ))}
              </div>
              {subject.trend === 'down' && (
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