import React, { useState, useEffect } from 'react';
import { activityService, BADGE_COLORS, BADGE_LABELS, type BadgeType } from '@/services/activityService';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Trophy } from 'lucide-react';

// Component implementation...
const ActivityTracking: React.FC = () => {
  // State declarations...
  const [students, setStudents] = useState<StudentActivity[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentActivity | null>(null);
  const [currentClass, setCurrentClass] = useState('');
  const [currentSection, setCurrentSection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityForm, setActivityForm] = useState({
    student_id: '',
    activity_name: '',
    badge: '' as BadgeType,
    description: ''
  });

  const { toast } = useToast();
  const classes = ['6', '7', '8', '9', '10'];
  const sections = ['A', 'B', 'C'];

  useEffect(() => {
    if (currentClass && currentSection) {
      loadStudentActivities();
    }
  }, [currentClass, currentSection]);

  // Function implementations...
  const loadStudentActivities = async () => {
    if (!currentClass || !currentSection) return;
    
    setIsLoading(true);
    try {
      const response = await activityService.getClassActivities(currentClass, currentSection);
      setStudents(response.students);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load student activities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.student_id || !activityForm.activity_name || !activityForm.badge) {
      toast({
        title: "Required",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await activityService.logActivity(activityForm);
      if (result.success) {
        toast({
          title: "Success",
          description: "Activity logged successfully",
        });
        setActivityForm({
          student_id: '',
          activity_name: '',
          badge: '' as BadgeType,
          description: ''
        });
        await loadStudentActivities();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log activity",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StudentCard = ({ student }: { student: Student }) => {
    const latestActivity = student.activities[0];
    const totalActivities = student.activities.length;
    
    return (
      <div 
        onClick={() => setSelectedStudent(student)}
        className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg">{student.student_name}</h3>
          <span className="text-xs text-gray-500">
            {totalActivities} activities
          </span>
        </div>

        {latestActivity ? (
          <div className={`p-3 rounded-md border ${BADGE_COLORS[latestActivity.badge.toLowerCase() as BadgeType].bg} 
            ${BADGE_COLORS[latestActivity.badge.toLowerCase() as BadgeType].text}`}>
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-medium">{latestActivity.activity_name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">
                {latestActivity.badge}
              </span>
            </div>
            <p className="text-sm mt-1">{latestActivity.description}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No activities recorded yet</p>
        )}
      </div>
    );
  };

  const ActivitiesList = ({ activities }: { activities: Activity[] }) => (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div 
          key={index}
          className={`p-3 rounded-md border ${BADGE_COLORS[activity.badge.toLowerCase() as BadgeType].bg} 
            ${BADGE_COLORS[activity.badge.toLowerCase() as BadgeType].text}`}
        >
          <div className="flex justify-between items-start mb-1">
            <span className="font-medium">{activity.activity_name}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/50 text-sm">
              {activity.badge}
            </span>
          </div>
          <p className="text-sm mt-1">{activity.description}</p>
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
              onClick={loadStudentActivities}
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
          {students.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {students.map(student => (
                <StudentCard key={student.student_id} student={student} />
              ))}
            </div>
          )}

          {/* Activity Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Log New Activity</h2>
            <form onSubmit={handleActivitySubmit} className="space-y-4">
              {/* Student Select */}
              <div>
                <label className="block text-sm font-medium mb-1">Student</label>
                <select
                  value={activityForm.student_id}
                  onChange={(e) => setActivityForm(prev => ({ ...prev, student_id: e.target.value }))}
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

              {/* Activity Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Activity Name</label>
                <input
                  type="text"
                  value={activityForm.activity_name}
                  onChange={(e) => setActivityForm(prev => ({ ...prev, activity_name: e.target.value }))}
                  className="w-full px-4 py-2 border rounded"
                  placeholder="Enter activity name"
                />
              </div>

              {/* Badge Select */}
              <div>
                <label className="block text-sm font-medium mb-1">Badge</label>
                <select
                  value={activityForm.badge}
                  onChange={(e) => setActivityForm(prev => ({ ...prev, badge: e.target.value as BadgeType }))}
                  className="w-full px-4 py-2 border rounded"
                >
                  <option value="">Select Badge</option>
                  {Object.entries(BADGE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={activityForm.description}
                  onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border rounded"
                  rows={3}
                  placeholder="Enter activity description"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Activity'}
              </button>
            </form>
          </div>
        </>
      )}

      {/* Student Activities Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              {selectedStudent?.student_name}'s Activities
            </DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            selectedStudent.activities.length > 0 ? (
              <ActivitiesList activities={selectedStudent.activities} />
            ) : (
              <div className="text-center text-gray-500 py-4">
                No activities recorded for this student
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivityTracking;
