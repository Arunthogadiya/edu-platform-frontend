import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { dashboardService } from '@services/dashboardService';

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

const Assessments: React.FC = () => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<'progress' | 'report'>('progress');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    class_value: '',
    section: ''
  });

  useEffect(() => {
    if (filters.class_value && filters.section) {
      loadStudents();
    }
  }, [filters.class_value, filters.section]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedStudent(null); // Reset selected student when filters change
      
      const response = await dashboardService.fetchStudents(filters.class_value, filters.section);
      setStudents(response.students || []);
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Failed to load student data');
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

  const calculateClassAverages = () => {
    const allSubjects = new Set(students.flatMap(s => s.subjects.map(sub => sub.subject)));
    const averages: { [key: string]: number } = {};

    allSubjects.forEach(subject => {
      const allGrades = students.flatMap(s => 
        s.subjects
          .filter(sub => sub.subject === subject)
          .flatMap(sub => sub.grades.map(g => gradeToNumber(g.grade)))
      );
      averages[subject] = allGrades.reduce((acc, val) => acc + val, 0) / allGrades.length;
    });

    return averages;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>{error}</p>
          <button onClick={loadStudents} className="mt-2 text-sm text-red-600 hover:text-red-800 underline">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const classAverages = calculateClassAverages();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('teacher.assessments.title')}</h1>
        <div className="flex items-center gap-4">
          {/* Class Filter */}
          <div className="flex gap-4">
            <div>
              <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                id="class-select"
                value={filters.class_value}
                onChange={(e) => setFilters(prev => ({ ...prev, class_value: e.target.value, section: '' }))}
                className="px-4 py-2 border rounded min-w-[120px]"
              >
                <option value="">Select Class</option>
                {['6', '7', '8', '9', '10'].map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>

            {/* Section Filter */}
            <div>
              <label htmlFor="section-select" className="block text-sm font-medium text-gray-700 mb-1">
                Section
              </label>
              <select
                id="section-select"
                value={filters.section}
                onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}
                className="px-4 py-2 border rounded min-w-[120px]"
                disabled={!filters.class_value}
              >
                <option value="">Select Section</option>
                {['A', 'B', 'C', 'D'].map(section => (
                  <option key={section} value={section}>Section {section}</option>
                ))}
              </select>
            </div>

            {/* Student Filter - Only shown when both class and section are selected */}
            {students.length > 0 && (
              <div>
                <label htmlFor="student-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Student
                </label>
                <select
                  id="student-select"
                  value={selectedStudent || ''}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="px-4 py-2 border rounded min-w-[200px]"
                >
                  <option value="">All Students</option>
                  {students.map(student => (
                    <option key={student.student_id} value={student.student_id}>
                      {student.student_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded mt-6"
            onClick={() => {/* Open new assessment modal */}}
            disabled={!filters.class_value || !filters.section}
          >
            {t('teacher.assessments.newAssessment')}
          </button>
        </div>
      </div>

      {/* Show message when no filters are selected */}
      {!filters.class_value || !filters.section ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Please select both class and section to view student assessments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setSelectedType('progress')}
                  className={`px-4 py-2 rounded ${
                    selectedType === 'progress' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  {t('teacher.assessments.progressReports')}
                </button>
                <button
                  onClick={() => setSelectedType('report')}
                  className={`px-4 py-2 rounded ${
                    selectedType === 'report' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  {t('teacher.assessments.detailedReports')}
                </button>
              </div>

              {selectedType === 'progress' ? (
                <div className="space-y-6">
                  {(selectedStudent ? 
                    [students.find(s => s.student_id === selectedStudent)] : 
                    students
                  ).map(student => student && (
                    <div key={student.student_id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-medium">{student.student_name}</h3>
                        <span className="text-sm text-gray-500">Gender: {student.gender}</span>
                      </div>
                      <div className="space-y-4">
                        {student.subjects.map(subject => (
                          <div key={subject.subject} className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">
                                  {subject.subject.charAt(0).toUpperCase() + subject.subject.slice(1)}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {subject.grades.length > 0 ? gradeToNumber(subject.grades[0].grade) : 'N/A'}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    subject.grades.length > 0 && gradeToNumber(subject.grades[0].grade) >= 80 ? 'bg-green-500' :
                                    subject.grades.length > 0 && gradeToNumber(subject.grades[0].grade) >= 70 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${subject.grades.length > 0 ? gradeToNumber(subject.grades[0].grade) : 0}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              Class Avg: {classAverages[subject.subject].toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {(selectedStudent ? 
                    [students.find(s => s.student_id === selectedStudent)] : 
                    students
                  ).map(student => student && (
                    <div key={student.student_id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium">{student.student_name}</h3>
                          <p className="text-sm text-gray-500">Student ID: {student.student_id}</p>
                        </div>
                        <button className="text-blue-600 text-sm hover:text-blue-800">
                          Generate PDF Report
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Academic Performance</h4>
                          <p className="text-sm text-gray-600">
                            Overall grade average: {
                              student.subjects.flatMap(sub => sub.grades.map(g => gradeToNumber(g.grade)))
                                .reduce((acc, grade) => acc + grade, 0) / 
                                student.subjects.flatMap(sub => sub.grades).length
                            }%
                          </p>
                          <p className="text-sm text-gray-600">
                            Completed assignments: {/* Add completed assignments data */}
                          </p>
                          <p className="text-sm text-gray-600">
                            Pending assignments: {/* Add pending assignments data */}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Recommendations</h4>
                          <div className="space-y-1">
                            {student.subjects
                              .filter(sub => sub.grades.some(g => gradeToNumber(g.grade) < 75))
                              .map(sub => (
                                <p key={sub.subject} className="text-sm text-red-600">
                                  • Needs additional support in {sub.subject}
                                </p>
                              ))}
                            {student.subjects
                              .filter(sub => sub.grades.some(g => gradeToNumber(g.grade) >= 90))
                              .map(sub => (
                                <p key={sub.subject} className="text-sm text-green-600">
                                  • Shows excellent progress in {sub.subject}
                                </p>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">{t('teacher.assessments.quickActions')}</h2>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded">
                  {t('teacher.assessments.generateReport')}
                </button>
                <button className="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded">
                  {t('teacher.assessments.addComments')}
                </button>
                <button className="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded">
                  {t('teacher.assessments.comparePerformance')}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">{t('teacher.assessments.suggestions')}</h2>
              <div className="space-y-2 text-sm">
                {selectedStudent ? (
                  students.find(s => s.student_id === selectedStudent)?.subjects && (
                    <>
                      {students.find(s => s.student_id === selectedStudent)!.subjects
                        .map(sub => (
                          <p key={sub.subject} className={sub.grades.some(g => gradeToNumber(g.grade) < 75) ? 'text-red-600' : 'text-gray-600'}>
                            • {sub.grades.some(g => gradeToNumber(g.grade) < 75) 
                                ? `Consider remedial sessions for ${sub.subject}` 
                                : `Maintain current progress in ${sub.subject}`}
                          </p>
                        ))}
                    </>
                  )
                ) : (
                  <>
                    <p>• Schedule performance review meetings</p>
                    <p>• Update assessment criteria for next term</p>
                    <p>• Review class-wide improvement areas</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessments;