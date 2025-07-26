import React, { useState, useEffect } from 'react';
import { behaviorService } from '../../../../services/behaviorService';
import { 
  Brain, 
  Users, 
  TrendingUp, 
  Heart,
  Smile,
  Frown,
  Meh,
  Clock,
  MessageSquare,
  Filter,
  Search,
  Plus,
  Eye,
  Target,
  X,
  ChevronDown,
  Calendar,
  BarChart3
} from 'lucide-react';

// Simple toast hook replacement
const useToast = () => ({
  toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    console.log(`${variant === 'destructive' ? 'Error' : 'Success'}: ${title} - ${description}`);
    // In a real implementation, you'd show a toast notification
    alert(`${title}: ${description}`);
  }
});

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

const BehaviorTracking: React.FC = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentClass, setCurrentClass] = useState('');
  const [currentSection, setCurrentSection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
  }, [currentClass, currentSection]);

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
      if (response && (response as any).students) {
        setStudents((response as any).students);
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
    if (numScore > 0) return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    if (numScore < 0) return 'bg-red-50 border-red-200 text-red-700';
    return 'bg-slate-50 border-slate-200 text-slate-700';
  };

  const getSentimentIcon = (score: string) => {
    const numScore = parseFloat(score);
    if (numScore > 0) return <Smile className="w-4 h-4 text-emerald-600" />;
    if (numScore < 0) return <Frown className="w-4 h-4 text-red-600" />;
    return <Meh className="w-4 h-4 text-slate-600" />;
  };

  const getOverallSentiment = (behaviors: StudentBehavior[]) => {
    if (!behaviors.length) return { score: 0, label: 'No Data', color: 'text-slate-500' };
    
    const avgScore = behaviors.reduce((sum, b) => sum + parseFloat(b.sentiment_score), 0) / behaviors.length;
    if (avgScore > 0.2) return { score: avgScore, label: 'Positive', color: 'text-emerald-600' };
    if (avgScore < -0.2) return { score: avgScore, label: 'Needs Attention', color: 'text-red-600' };
    return { score: avgScore, label: 'Neutral', color: 'text-slate-600' };
  };

  const filteredStudents = students.filter(student =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StudentCard = ({ student }: { student: Student }) => {
    const latestBehavior = student.behavior_records[0];
    const totalBehaviors = student.behavior_records.length;
    const positiveBehaviors = student.behavior_records.filter(b => parseFloat(b.sentiment_score) > 0).length;
    const overallSentiment = getOverallSentiment(student.behavior_records);
    
    return (
      <div 
        onClick={() => setSelectedStudent(student)}
        className="group bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-xl hover:border-purple-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-neutral-900 group-hover:text-purple-700 transition-colors">
                {student.student_name}
              </h3>
              <p className="text-sm text-neutral-500">
                {totalBehaviors} observation{totalBehaviors !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${overallSentiment.color} bg-opacity-10`}>
              {overallSentiment.label}
            </div>
            <Eye className="w-4 h-4 text-neutral-400 group-hover:text-purple-500 transition-colors" />
          </div>
        </div>

        {latestBehavior ? (
          <div className={`p-4 rounded-xl border ${getSentimentColor(latestBehavior.sentiment_score)}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getSentimentIcon(latestBehavior.sentiment_score)}
                <span className="text-sm font-semibold">{latestBehavior.behavior_type}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <Clock className="w-3 h-3" />
                {new Date(latestBehavior.date).toLocaleDateString()}
              </div>
            </div>
            <p className="text-sm leading-relaxed">{latestBehavior.comment}</p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No behavior records yet</p>
          </div>
        )}

        {totalBehaviors > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-neutral-600">
                  {Math.round((positiveBehaviors / totalBehaviors) * 100)}% positive
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-neutral-600">Growth tracking</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-purple-600 font-medium">
              View Details
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>
    );
  };

  const BehaviorsList = ({ behaviors }: { behaviors: StudentBehavior[] }) => (
    <div className="space-y-4">
      {sortBehaviorsByDate(behaviors).map((behavior, index) => (
        <div 
          key={index}
          className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${getSentimentColor(behavior.sentiment_score)}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {getSentimentIcon(behavior.sentiment_score)}
              <span className="font-semibold text-base">{behavior.behavior_type}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-neutral-500">
              <Calendar className="w-4 h-4" />
              {new Date(behavior.date).toLocaleDateString()}
            </div>
          </div>
          <p className="text-sm leading-relaxed pl-7">{behavior.comment}</p>
        </div>
      ))}
    </div>
  );

  if (isLoading && !students.length) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-500 text-lg">Loading behavior insights...</p>
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
              <Brain className="w-8 h-8" />
            </div>
            Behavior Tracking
          </h1>
          <p className="text-neutral-600 text-lg">
            Monitor and analyze student behavior patterns with intelligent insights
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
          <div className="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-medium mb-1">Positive Behaviors</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {students.reduce((acc, s) => acc + s.behavior_records.filter(b => parseFloat(b.sentiment_score) > 0).length, 0)}
                </p>
              </div>
              <Smile className="w-8 h-8 text-emerald-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium mb-1">Total Students</p>
                <p className="text-2xl font-bold text-blue-700">{students.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium mb-1">Active Tracking</p>
                <p className="text-2xl font-bold text-amber-700">
                  {students.filter(s => s.behavior_records.length > 0).length}
                </p>
              </div>
              <Target className="w-8 h-8 text-amber-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 border border-purple-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium mb-1">Insights Ready</p>
                <p className="text-2xl font-bold text-purple-700">
                  {students.filter(s => s.behavior_records.length >= 3).length}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
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
                className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all"
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
              <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">No Students Found</h3>
              <p className="text-neutral-500">
                {currentClass && currentSection ? 
                  'No students found for selected class and section' : 
                  'Please select a class and section to view students'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Enhanced Behavior Form */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Log New Behavior</h2>
            <p className="text-neutral-600">Record behavioral observations and insights</p>
          </div>
        </div>
        
        <form onSubmit={handleBehaviorSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-3">Student</label>
              <select
                value={behaviorForm.student_id}
                onChange={(e) => setBehaviorForm(prev => ({ ...prev, student_id: e.target.value }))}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all"
              >
                <option value="">Select Student</option>
                {students.map(student => (
                  <option key={student.student_id} value={student.student_id}>
                    {student.student_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">Behavioral Observation</label>
            <textarea
              value={behaviorForm.observation_text}
              onChange={(e) => setBehaviorForm(prev => ({ ...prev, observation_text: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all"
              rows={4}
              placeholder="Describe the observed behavior, context, and any relevant details..."
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !behaviorForm.student_id || !behaviorForm.observation_text}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Submitting...
              </div>
            ) : (
              'Submit Observation'
            )}
          </button>
        </form>
      </div>

      {/* Student Details Modal */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={`${selectedStudent?.student_name}'s Behavior History`}
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <p className="text-emerald-600 text-sm font-medium">Positive</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {selectedStudent.behavior_records.filter(b => parseFloat(b.sentiment_score) > 0).length}
                </p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-slate-600 text-sm font-medium">Neutral</p>
                <p className="text-2xl font-bold text-slate-700">
                  {selectedStudent.behavior_records.filter(b => parseFloat(b.sentiment_score) === 0).length}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <p className="text-red-600 text-sm font-medium">Concerning</p>
                <p className="text-2xl font-bold text-red-700">
                  {selectedStudent.behavior_records.filter(b => parseFloat(b.sentiment_score) < 0).length}
                </p>
              </div>
            </div>
            <BehaviorsList behaviors={selectedStudent.behavior_records} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BehaviorTracking;
