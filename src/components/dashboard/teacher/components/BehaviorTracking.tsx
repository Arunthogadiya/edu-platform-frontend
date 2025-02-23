import React, { useState, useEffect } from 'react';
import { behaviorService } from '@/services/behaviorService';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

interface StudentBehavior {
  behavior_type: string;
  comment: string;
  date: string;
  sentiment_score: string;
}

interface Student {
  student_id: number;
  student_name: string;
  gender: string;
  behavior_records: StudentBehavior[];
}

const BehaviorTracking: React.FC = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentClass, setCurrentClass] = useState('');
  const [currentSection, setCurrentSection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [behaviorForm, setBehaviorForm] = useState({
    student_id: '',
    observation_text: ''
  });

  const classes = ['6', '7', '8', '9', '10'];
  const sections = ['A', 'B', 'C'];

  useEffect(() => {
    if (currentClass && currentSection) {
      loadStudents();
    }
  }, [currentClass, currentSection]); // Load data when class or section changes

  const sortBehaviorsByDate = (behaviors: StudentBehavior[]) => {
    return [...behaviors].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const loadStudents = async () => {
    if (!currentClass || !currentSection) {
      toast({
        title: "Required",
        description: "Please select both class and section",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await behaviorService.getClassAnalysis(currentClass, currentSection);
      if (response?.students) {
        setStudents(response.students);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBehaviorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!behaviorForm.student_id || !behaviorForm.observation_text) {
      toast({
        title: "Required",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await behaviorService.logSchoolBehavior(behaviorForm);
      if (result.success) {
        toast({
          title: "Success",
          description: "Behavior observation logged successfully",
        });
        setBehaviorForm({
          student_id: '',
          observation_text: ''
        });
        // Reload students to show new behavior
        await loadStudents();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log behavior",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSentimentColor = (score: string) => {
    const numScore = parseFloat(score);
    if (numScore > 0) return 'bg-green-50 border-green-200 text-green-700';
    if (numScore < 0) return 'bg-red-50 border-red-200 text-red-700';
    return 'bg-gray-50 border-gray-200 text-gray-700';
  };

  const StudentCard = ({ student }: { student: Student }) => {
    const latestBehavior = student.behavior_records[0];
    const totalBehaviors = student.behavior_records.length;
    const positiveBehaviors = student.behavior_records.filter(b => parseFloat(b.sentiment_score) > 0).length;
    
    return (
      <div 
        onClick={() => setSelectedStudent(student)}
        className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg">{student.student_name}</h3>
          <span className="text-xs text-gray-500">
            {totalBehaviors} observations
          </span>
        </div>

        {latestBehavior ? (
          <div className={`p-3 rounded-md border ${getSentimentColor(latestBehavior.sentiment_score)}`}>
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-medium">{latestBehavior.behavior_type}</span>
              <span className="text-xs">{new Date(latestBehavior.date).toLocaleDateString()}</span>
            </div>
            <p className="text-sm mt-1">{latestBehavior.comment}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No behavior records yet</p>
        )}

        {totalBehaviors > 0 && (
          <div className="mt-3 text-xs text-gray-500">
            {Math.round((positiveBehaviors / totalBehaviors) * 100)}% positive behaviors
          </div>
        )}
      </div>
    );
  };

  const BehaviorsList = ({ behaviors }: { behaviors: StudentBehavior[] }) => (
    <div className="space-y-3">
      {sortBehaviorsByDate(behaviors).map((behavior, index) => (
        <div 
          key={index}
          className={`p-3 rounded-md border ${getSentimentColor(behavior.sentiment_score)}`}
        >
          <div className="flex justify-between items-start mb-1">
            <span className="font-medium">{behavior.behavior_type}</span>
            <span className="text-sm text-gray-500">
              {new Date(behavior.date).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm mt-1">{behavior.comment}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6">
      {/* Class and Section Selector */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              value={currentClass}
              onChange={(e) => setCurrentClass(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>Class {cls}th</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section
            </label>
            <select
              value={currentSection}
              onChange={(e) => setCurrentSection(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadStudents}
              disabled={!currentClass || !currentSection || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Loading...
                </div>
              ) : (
                'Load Students'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Students Grid */}
          {students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map(student => (
                <StudentCard key={student.student_id} student={student} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              {currentClass && currentSection ? 
                'No students found for selected class and section' : 
                'Please select a class and section to view students'}
            </div>
          )}
        </>
      )}

      {/* Behavior Form */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Log New Behavior</h2>
        <form onSubmit={handleBehaviorSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Student</label>
            <select
              value={behaviorForm.student_id}
              onChange={(e) => setBehaviorForm(prev => ({ ...prev, student_id: e.target.value }))}
              className="w-full px-4 py-2 border rounded"
            >
              <option value="">Select Student</option>
              {students.map(student => (
                <option key={student.student_id} value={student.student_id}>
                  {student.student_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observation</label>
            <textarea
              value={behaviorForm.observation_text}
              onChange={(e) => setBehaviorForm(prev => ({ ...prev, observation_text: e.target.value }))}
              className="w-full px-4 py-2 border rounded"
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Observation'}
          </button>
        </form>
      </div>

      {/* Student Details Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedStudent?.student_name}'s Behavior History</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <BehaviorsList behaviors={selectedStudent.behavior_records} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BehaviorTracking;