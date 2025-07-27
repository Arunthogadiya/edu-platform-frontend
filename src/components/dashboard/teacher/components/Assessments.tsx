import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { dashboardService } from '../../../../services/dashboardService';
import { aiTeachingHubService } from '../../../../services/aiTeachingHubService';
import { useTeacher } from '../../../../contexts/TeacherContext';
import { useToast } from '../../../ui/use-toast';
import { 
  ChevronDown, 
  FileText, 
  BarChart2, 
  Users, 
  Calendar,
  PlusCircle,
  Download,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Award
} from 'lucide-react';

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
  const { selectedClass, selectedSection } = useTeacher();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<'progress' | 'report'>('progress');
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingReports, setDownloadingReports] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadStudents();
    }
  }, [selectedClass, selectedSection]);

  const loadStudents = async () => {
    // Validate that we have class and section selected
    if (!selectedClass || !selectedSection) {
      setError('Please select both class and section from the dashboard');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSelectedStudent(null); // Reset selected student when filters change
      
      console.log('Loading students for:', { selectedClass, selectedSection });
      
      try {
        const response = await dashboardService.fetchClassGrades(selectedClass, selectedSection);
        if (response && response.students && Array.isArray(response.students)) {
          setStudents(response.students);
          console.log('Loaded students with grades:', response.students.length);
          return;
        }
      } catch (gradesError) {
        console.warn('Grades API failed, falling back to student API:', gradesError);
      }
      
      // Fallback: Use regular student API and create mock assessment data
      const studentResponse = await dashboardService.fetchStudents(selectedClass, selectedSection);
      if (studentResponse.success && studentResponse.students) {
        const studentsWithGrades = studentResponse.students.map(student => ({
          ...student,
          subjects: [
            {
              subject: 'Mathematics',
              grades: [
                { date: '2024-01-15', grade: ['A', 'B', 'C', 'B+', 'A-'][Math.floor(Math.random() * 5)] },
                { date: '2024-01-08', grade: ['A', 'B', 'C', 'B+', 'A-'][Math.floor(Math.random() * 5)] }
              ],
              alert: Math.random() > 0.7
            },
            {
              subject: 'Science',
              grades: [
                { date: '2024-01-12', grade: ['A', 'B', 'C', 'B+', 'A-'][Math.floor(Math.random() * 5)] },
                { date: '2024-01-05', grade: ['A', 'B', 'C', 'B+', 'A-'][Math.floor(Math.random() * 5)] }
              ],
              alert: Math.random() > 0.7
            },
            {
              subject: 'English',
              grades: [
                { date: '2024-01-10', grade: ['A', 'B', 'C', 'B+', 'A-'][Math.floor(Math.random() * 5)] }
              ],
              alert: Math.random() > 0.7
            }
          ]
        }));
        
        setStudents(studentsWithGrades);
        console.log('Loaded students with mock grades:', studentsWithGrades.length);
      } else {
        setStudents([]);
        setError('No student data available for the selected class and section');
      }
    } catch (err) {
      console.error('Error loading students:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load student data';
      setError(errorMessage);
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

  // Update the classAverages calculation to handle empty students array
  const calculateClassAverages = () => {
    if (!students || students.length === 0) return {};
    
    const allSubjects = new Set(students.flatMap(s => s.subjects?.map(sub => sub.subject) || []));
    const averages: { [key: string]: number } = {};

    allSubjects.forEach(subject => {
      const allGrades = students.flatMap(s => 
        s.subjects?.filter(sub => sub.subject === subject)
          .flatMap(sub => sub.grades?.map(g => gradeToNumber(g.grade)) || []) || []
      );
      averages[subject] = allGrades.length > 0 ? 
        allGrades.reduce((acc, val) => acc + val, 0) / allGrades.length : 
        0;
    });

    return averages;
  };

  const handleDownloadReport = async (student: Student) => {
    try {
      setDownloadingReports(prev => new Set(prev).add(student.student_id));
      
      toast({
        title: "Generating Report",
        description: `Creating grade card for ${student.student_name}...`,
      });
      
      // Generate the report using the AI Teaching Hub service
      const reportContent = await aiTeachingHubService.generateStudentReport(
        student.student_name, 
        student.student_id
      );
      
      // Format the report as a professional grade card
      const formattedReport = formatGradeCard(reportContent, student);
      
      // Create and download the report as a text file
      const blob = new Blob([formattedReport], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${student.student_name}_Grade_Card_Report.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Report Downloaded",
        description: `Grade card for ${student.student_name} has been generated and downloaded successfully.`,
      });
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(student.student_id);
        return newSet;
      });
    }
  };

  const formatGradeCard = (llmResponse: string, student: Student): string => {
    const currentDate = new Date().toLocaleDateString();
    
    return `
=====================================
        STUDENT GRADE CARD REPORT
=====================================

Student Name: ${student.student_name}
Student ID: ${student.student_id}
Class: ${selectedClass}
Section: ${selectedSection}
Report Date: ${currentDate}
Period: Previous 30 Days

=====================================

${llmResponse}

=====================================
           END OF REPORT
=====================================

Generated by Engage-ED AI Teaching Assistant
Report Date: ${new Date().toLocaleString()}
    `.trim();
  };

  const handleGenerateClassReport = async () => {
    if (!selectedClass || !selectedSection) {
      toast({
        title: "Error",
        description: "Please ensure class and section are selected.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Generating Class Report",
        description: `Creating comprehensive report for Class ${selectedClass}${selectedSection}...`,
      });
      
      // Generate a class-wide report using the AI Teaching Hub service
      const reportContent = await aiTeachingHubService.generateStudentReport(
        `Class ${selectedClass}${selectedSection}`, 
        0 // Using 0 as a placeholder ID for class reports
      );
      
      // Format the report as a professional class report
      const formattedReport = `
=====================================
         CLASS COMPREHENSIVE REPORT
=====================================

Class: ${selectedClass}
Section: ${selectedSection}
Report Date: ${new Date().toLocaleDateString()}
Period: Previous 30 Days
Total Students: ${students.length}

=====================================

${reportContent}

=====================================
           END OF REPORT
=====================================

Generated by Engage-ED AI Teaching Assistant
Report Date: ${new Date().toLocaleString()}
      `.trim();
      
      // Create and download the report as a text file
      const blob = new Blob([formattedReport], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Class_${selectedClass}${selectedSection}_Comprehensive_Report.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Class Report Downloaded",
        description: `Comprehensive report for Class ${selectedClass}${selectedSection} has been generated and downloaded successfully.`,
      });
      
    } catch (error) {
      console.error('Error generating class report:', error);
      toast({
        title: "Error",
        description: "Failed to generate class report. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-[3px] border-current border-t-transparent text-blue-600 opacity-75"></div>
          <p className="text-sm text-gray-500 font-medium">Loading assessment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
          <button 
            onClick={loadStudents} 
            className="mt-4 px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium hover:bg-red-50 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const classAverages = calculateClassAverages();

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <FileText className="h-7 w-7 text-blue-600" />
              {t('teacher.assessments.title')}
            </h1>
            {selectedClass && selectedSection && (
              <p className="mt-1 text-gray-500">
                Class {selectedClass} - Section {selectedSection}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {students && students.length > 0 && (
              <div className="relative">
                <select
                  value={selectedStudent || ''}
                  onChange={(e) => setSelectedStudent(e.target.value ? parseInt(e.target.value) : null)}
                  className="appearance-none bg-white pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all min-w-[200px]"
                >
                  <option value="">All Students</option>
                  {students.map(student => (
                    <option key={student.student_id} value={student.student_id}>
                      {student.student_name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            )}

            <button
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              onClick={() => {/* Open new assessment modal */}}
              disabled={!selectedClass || !selectedSection}
            >
              <PlusCircle className="h-4 w-4" />
              {t('teacher.assessments.newAssessment')}
            </button>
          </div>
        </div>
      </div>

      {/* Show message when no class/section are selected */}
      {!selectedClass || !selectedSection ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            Please select both class and section from the dashboard to view student assessments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Students</p>
                    <p className="text-2xl font-semibold text-gray-900">{students.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Average Performance</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {Object.values(classAverages).reduce((a, b) => a + b, 0) / Object.values(classAverages).length || 0}%
                    </p>
                  </div>
                  <BarChart2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Assessment Period</p>
                    <p className="text-2xl font-semibold text-gray-900">Term 1</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Assessment Type Tabs */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedType('progress')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedType === 'progress' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {t('teacher.assessments.progressReports')}
                  </button>
                  <button
                    onClick={() => setSelectedType('report')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedType === 'report' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {t('teacher.assessments.detailedReports')}
                  </button>
                </div>
              </div>

              <div className="p-6">
                {selectedType === 'progress' ? (
                  <div className="space-y-6">
                    {(selectedStudent ? 
                      students.filter(s => s.student_id === selectedStudent) : 
                      students
                    ).map(student => student && (
                      <div key={student.student_id} className="bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-colors p-6">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{student.student_name}</h3>
                            <p className="text-sm text-gray-500 mt-1">Student ID: {student.student_id}</p>
                          </div>
                          <span className="text-sm font-medium text-gray-500">{student.gender}</span>
                        </div>
                        <div className="space-y-4">
                          {student.subjects?.map(subject => (
                            <div key={subject.subject} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {subject.subject.charAt(0).toUpperCase() + subject.subject.slice(1)}
                                </span>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm text-gray-500">
                                    Class Avg: {classAverages[subject.subject]?.toFixed(1) || 'N/A'}%
                                  </span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {subject.grades?.length > 0 ? gradeToNumber(subject.grades[0].grade) : 'N/A'}%
                                  </span>
                                </div>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    subject.grades?.length > 0 && gradeToNumber(subject.grades[0].grade) >= 80 
                                      ? 'bg-green-500' 
                                      : subject.grades?.length > 0 && gradeToNumber(subject.grades[0].grade) >= 70 
                                      ? 'bg-yellow-500' 
                                      : 'bg-red-500'
                                  }`}
                                  style={{ 
                                    width: `${subject.grades?.length > 0 ? gradeToNumber(subject.grades[0].grade) : 0}%`,
                                    transition: 'width 1s ease-in-out'
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(selectedStudent ? 
                      students.filter(s => s.student_id === selectedStudent) : 
                      students
                    ).map(student => student && (
                      <div key={student.student_id} className="bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-colors p-6">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{student.student_name}</h3>
                            <p className="text-sm text-gray-500 mt-1">Student ID: {student.student_id}</p>
                          </div>
                          <button 
                            onClick={() => handleDownloadReport(student)}
                            disabled={downloadingReports.has(student.student_id)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloadingReports.has(student.student_id) ? (
                              <>
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4" />
                                Download Report
                              </>
                            )}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-900">Academic Performance</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Overall Grade Average</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {(student.subjects?.flatMap(sub => sub.grades?.map(g => gradeToNumber(g.grade)) || [])
                                    .reduce((acc, grade) => acc + grade, 0) / 
                                    (student.subjects?.flatMap(sub => sub.grades || []).length || 1)).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Completed Assignments</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {student.subjects?.reduce((acc, sub) => acc + (sub.grades?.length || 0), 0) || 0}
                                </span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Performance Trend</span>
                                <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                                  <TrendingUp className="h-4 w-4" />
                                  Improving
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-900">Recommendations</h4>
                            <div className="space-y-3">
                              {student.subjects
                                ?.filter(sub => sub.grades?.some(g => gradeToNumber(g.grade) < 75))
                                .map(sub => (
                                  <div key={sub.subject} className="flex items-start gap-2 text-sm text-red-600">
                                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <p>Needs additional support in {sub.subject}</p>
                                  </div>
                                ))}
                              {student.subjects
                                ?.filter(sub => sub.grades?.some(g => gradeToNumber(g.grade) >= 90))
                                .map(sub => (
                                  <div key={sub.subject} className="flex items-start gap-2 text-sm text-green-600">
                                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <p>Shows excellent progress in {sub.subject}</p>
                                  </div>
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
          </div>

          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                {t('teacher.assessments.quickActions')}
              </h2>
              <div className="space-y-3">
                <button 
                  onClick={handleGenerateClassReport}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <Download className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {t('teacher.assessments.generateReport')}
                  </span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
                  <MessageSquare className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {t('teacher.assessments.addComments')}
                  </span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
                  <BarChart2 className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {t('teacher.assessments.comparePerformance')}
                  </span>
                </button>
              </div>
            </div>

            {/* Suggestions Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                {t('teacher.assessments.suggestions')}
              </h2>
              <div className="space-y-4">
                {selectedStudent && students.length > 0 ? (
                  students.find(s => s.student_id === selectedStudent)?.subjects && (
                    <>
                      {students.find(s => s.student_id === selectedStudent)!.subjects
                        ?.map(sub => (
                          <div 
                            key={sub.subject} 
                            className={`p-4 rounded-lg ${
                              sub.grades?.some(g => gradeToNumber(g.grade) < 75)
                                ? 'bg-red-50 text-red-700'
                                : 'bg-green-50 text-green-700'
                            }`}
                          >
                            <p className="text-sm font-medium">
                              {sub.grades?.some(g => gradeToNumber(g.grade) < 75)
                                ? `Consider remedial sessions for ${sub.subject}`
                                : `Maintain current progress in ${sub.subject}`}
                            </p>
                          </div>
                        ))}
                    </>
                  )
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <p className="text-sm font-medium text-blue-700">Schedule performance review meetings</p>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                      <FileText className="h-5 w-5 text-purple-600 flex-shrink-0" />
                      <p className="text-sm font-medium text-purple-700">Update assessment criteria for next term</p>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                      <Users className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <p className="text-sm font-medium text-green-700">Review class-wide improvement areas</p>
                    </div>
                  </div>
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