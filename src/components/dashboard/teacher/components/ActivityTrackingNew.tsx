import React, { useState, useEffect } from 'react';
import { activityService, BADGE_COLORS, BADGE_LABELS, type BadgeType } from '../../../../services/activityService';
import { 
  Activity,
  Users, 
  TrendingUp, 
  Trophy,
  Star,
  Award,
  Target,
  Clock,
  Filter,
  Search,
  Plus,
  Eye,
  X,
  ChevronDown,
  Calendar,
  Zap,
  Crown,
  Medal,
  Sparkles
} from 'lucide-react';

// Simple toast hook replacement
const useToast = () => ({
  toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    console.log(`${variant === 'destructive' ? 'Error' : 'Success'}: ${title} - ${description}`);
    alert(`${title}: ${description}`);
  }
});

interface StudentActivity {
  activity_id: number;
  activity_name: string;
  badge: BadgeType;
  description: string;
  created_at: string;
}

interface Student {
  student_id: number;
  student_name: string;
  activities: StudentActivity[];
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
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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

const ActivityTracking: React.FC = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentClass, setCurrentClass] = useState('');
  const [currentSection, setCurrentSection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityForm, setActivityForm] = useState({
    student_id: '',
    activity_name: '',
    badge: '' as BadgeType,
    description: ''
  });

  const classes = ['6', '7', '8', '9', '10'];
  const sections = ['A', 'B', 'C'];

  useEffect(() => {
    if (currentClass && currentSection) {
      loadStudentActivities();
    }
  }, [currentClass, currentSection]);

  const loadStudentActivities = async () => {
    if (!currentClass || !currentSection) return;
    
    setIsLoading(true);
    try {
      const response = await activityService.getClassActivities(currentClass, currentSection);
      if (response && (response as any).students) {
        setStudents((response as any).students || []);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
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

  const getBadgeColor = (badge: BadgeType) => {
    return BADGE_COLORS[badge] || 'bg-gray-100 text-gray-700';
  };

  const getBadgeIcon = (badge: BadgeType) => {
    const iconMap: Record<string, JSX.Element> = {
      'excellent': <Crown className="w-4 h-4" />,
      'good': <Star className="w-4 h-4" />,
      'average': <Target className="w-4 h-4" />,
      'needs_improvement': <TrendingUp className="w-4 h-4" />,
      'outstanding': <Sparkles className="w-4 h-4" />,
      'participation': <Users className="w-4 h-4" />,
      'leadership': <Award className="w-4 h-4" />,
      'creativity': <Zap className="w-4 h-4" />,
      'achievement': <Medal className="w-4 h-4" />
    };
    return iconMap[badge] || <Trophy className="w-4 h-4" />;
  };

  const sortActivitiesByDate = (activities: StudentActivity[]) => {
    return [...activities].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  const filteredStudents = students.filter(student =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StudentCard = ({ student }: { student: Student }) => {
    const latestActivity = student.activities[0];
    const totalActivities = student.activities.length;
    const uniqueBadges = [...new Set(student.activities.map(a => a.badge))];
    
    return (
      <div 
        onClick={() => setSelectedStudent(student)}
        className="group bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-neutral-900 group-hover:text-blue-700 transition-colors">
                {student.student_name}
              </h3>
              <p className="text-sm text-neutral-500">
                {totalActivities} activit{totalActivities !== 1 ? 'ies' : 'y'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              {uniqueBadges.length} badge{uniqueBadges.length !== 1 ? 's' : ''}
            </div>
            <Eye className="w-4 h-4 text-neutral-400 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>

        {latestActivity ? (
          <div className={`p-4 rounded-xl border-2 ${getBadgeColor(latestActivity.badge)}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getBadgeIcon(latestActivity.badge)}
                <span className="text-sm font-semibold">{latestActivity.activity_name}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <Clock className="w-3 h-3" />
                {new Date(latestActivity.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(latestActivity.badge)}`}>
                {BADGE_LABELS[latestActivity.badge]}
              </span>
            </div>
            {latestActivity.description && (
              <p className="text-sm leading-relaxed text-gray-600">{latestActivity.description}</p>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <Trophy className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No activities recorded yet</p>
          </div>
        )}

        {totalActivities > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-neutral-600">
                  {student.activities.filter(a => ['excellent', 'outstanding'].includes(a.badge)).length} achievements
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-neutral-600">Progress tracked</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
              View Details
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>
    );
  };

  const ActivitiesList = ({ activities }: { activities: StudentActivity[] }) => (
    <div className="space-y-4">
      {sortActivitiesByDate(activities).map((activity, index) => (
        <div 
          key={activity.activity_id || index}
          className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${getBadgeColor(activity.badge)}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {getBadgeIcon(activity.badge)}
              <div>
                <span className="font-semibold text-base">{activity.activity_name}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(activity.badge)}`}>
                    {BADGE_LABELS[activity.badge]}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-neutral-500">
              <Calendar className="w-4 h-4" />
              {new Date(activity.created_at).toLocaleDateString()}
            </div>
          </div>
          {activity.description && (
            <p className="text-sm leading-relaxed pl-7 text-gray-600">{activity.description}</p>
          )}
        </div>
      ))}
    </div>
  );

  if (isLoading && !students.length) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-500 text-lg">Loading activity insights...</p>
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
              <Activity className="w-8 h-8" />
            </div>
            Activity Tracking
          </h1>
          <p className="text-neutral-600 text-lg">
            Monitor student activities and achievements with detailed tracking
          </p>
        </div>
        
        {/* Class Selection */}
        <div className="flex gap-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-4 min-w-0">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Class</label>
            <select
              value={currentClass}
              onChange={(e) => setCurrentClass(e.target.value)}
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
              value={currentSection}
              onChange={(e) => setCurrentSection(e.target.value)}
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
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium mb-1">Total Activities</p>
                <p className="text-2xl font-bold text-amber-700">
                  {students.reduce((acc, s) => acc + s.activities.length, 0)}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-amber-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium mb-1">Active Students</p>
                <p className="text-2xl font-bold text-blue-700">{students.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 border border-purple-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium mb-1">Excellence Awards</p>
                <p className="text-2xl font-bold text-purple-700">
                  {students.reduce((acc, s) => acc + s.activities.filter(a => ['excellent', 'outstanding'].includes(a.badge)).length, 0)}
                </p>
              </div>
              <Crown className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium mb-1">Achievements</p>
                <p className="text-2xl font-bold text-green-700">
                  {students.filter(s => s.activities.length >= 3).length}
                </p>
              </div>
              <Medal className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      {students.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search students by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-neutral-400" />
              <span className="text-sm text-neutral-600">{filteredStudents.length} students</span>
            </div>
          </div>
        </div>
      )}

      {/* Students Grid */}
      {isLoading ? (
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
                <div className="h-20 bg-neutral-200 rounded-xl"></div>
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
              <Activity className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">No Activities Found</h3>
              <p className="text-neutral-500">
                {currentClass && currentSection ? 
                  'No student activities found for selected class and section' : 
                  'Please select a class and section to view student activities'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Enhanced Activity Form */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Log New Activity</h2>
            <p className="text-neutral-600">Record student activities and achievements</p>
          </div>
        </div>
        
        <form onSubmit={handleActivitySubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-3">Student</label>
              <select
                value={activityForm.student_id}
                onChange={(e) => setActivityForm(prev => ({ ...prev, student_id: e.target.value }))}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
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
              <label className="block text-sm font-semibold text-neutral-700 mb-3">Badge Level</label>
              <select
                value={activityForm.badge}
                onChange={(e) => setActivityForm(prev => ({ ...prev, badge: e.target.value as BadgeType }))}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
              >
                <option value="">Select Badge</option>
                {Object.entries(BADGE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">Activity Name</label>
            <input
              type="text"
              value={activityForm.activity_name}
              onChange={(e) => setActivityForm(prev => ({ ...prev, activity_name: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
              placeholder="Enter activity name..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">Description (Optional)</label>
            <textarea
              value={activityForm.description}
              onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
              rows={3}
              placeholder="Add details about the activity..."
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !activityForm.student_id || !activityForm.activity_name || !activityForm.badge}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Logging Activity...
              </div>
            ) : (
              'Log Activity'
            )}
          </button>
        </form>
      </div>

      {/* Student Details Modal */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={`${selectedStudent?.student_name}'s Activity History`}
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <p className="text-amber-600 text-sm font-medium">Total Activities</p>
                <p className="text-2xl font-bold text-amber-700">
                  {selectedStudent.activities.length}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <p className="text-purple-600 text-sm font-medium">Excellence Count</p>
                <p className="text-2xl font-bold text-purple-700">
                  {selectedStudent.activities.filter(a => ['excellent', 'outstanding'].includes(a.badge)).length}
                </p>
              </div>
            </div>
            <ActivitiesList activities={selectedStudent.activities} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ActivityTracking;
