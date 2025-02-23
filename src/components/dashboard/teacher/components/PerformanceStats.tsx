import React from 'react';
import { calculateClassAverage } from '@/data/mockStudentData';
import type { Class, Student } from '@/data/mockStudentData';

interface PerformanceStatsProps {
  classData: Class | undefined;
}

const PerformanceStats: React.FC<PerformanceStatsProps> = ({ classData }) => {
  if (!classData) return null;

  const calculateStats = () => {
    const students = classData.students;
    const totalStudents = students.length;
    
    // Calculate performance distribution
    const performanceLevels = {
      excellent: 0, // Above 85%
      good: 0,     // 70-85%
      average: 0,  // 50-70%
      poor: 0      // Below 50%
    };

    students.forEach(student => {
      const avgScore = student.grades.reduce((acc, grade) => 
        acc + (grade.score / grade.maxScore * 100), 0) / (student.grades.length || 1);

      if (avgScore >= 85) performanceLevels.excellent++;
      else if (avgScore >= 70) performanceLevels.good++;
      else if (avgScore >= 50) performanceLevels.average++;
      else performanceLevels.poor++;
    });

    // Calculate submission stats
    const assignmentStats = students.reduce((acc, student) => {
      const total = student.assignments.length;
      const submitted = student.assignments.filter(a => a.status !== 'pending').length;
      return {
        totalAssignments: acc.totalAssignments + total,
        submittedAssignments: acc.submittedAssignments + submitted
      };
    }, { totalAssignments: 0, submittedAssignments: 0 });

    return { performanceLevels, assignmentStats, totalStudents };
  };

  const stats = calculateStats();

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Class Overview */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Class Overview</h3>
        <div className="text-2xl font-bold text-gray-900">{classData.name} - {classData.section}</div>
        <div className="mt-1 text-sm text-gray-600">{stats.totalStudents} students</div>
      </div>

      {/* Performance Distribution */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Performance Levels</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-600">Excellent</span>
            <span className="font-medium">{stats.performanceLevels.excellent}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-600">Good</span>
            <span className="font-medium">{stats.performanceLevels.good}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-yellow-600">Average</span>
            <span className="font-medium">{stats.performanceLevels.average}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-red-600">Needs Improvement</span>
            <span className="font-medium">{stats.performanceLevels.poor}</span>
          </div>
        </div>
      </div>

      {/* Assignment Progress */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Assignment Progress</h3>
        <div className="text-2xl font-bold text-gray-900">
          {((stats.assignmentStats.submittedAssignments / stats.assignmentStats.totalAssignments) * 100).toFixed(1)}%
        </div>
        <div className="mt-1 text-sm text-gray-600">
          {stats.assignmentStats.submittedAssignments} / {stats.assignmentStats.totalAssignments} submitted
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full"
            style={{ width: `${(stats.assignmentStats.submittedAssignments / stats.assignmentStats.totalAssignments) * 100}%` }}
          />
        </div>
      </div>

      {/* Recent Performance Trend */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Performance Trend</h3>
        <div className="h-32 flex items-end justify-between">
          {classData.students[0]?.grades.slice(-5).map((grade, index) => (
            <div key={index} className="w-8 flex flex-col items-center">
              <div 
                className="w-full bg-blue-600 rounded-t"
                style={{ height: `${(grade.score / grade.maxScore) * 100}%` }}
              />
              <span className="mt-1 text-xs text-gray-500">{new Date(grade.date).getDate()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceStats;