import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ClipboardCheck, 
  FileText, 
  BookOpen, 
  TrendingUp, 
  Search, 
  UserPlus, 
  X, 
  ChevronRight,
  Brain,
  Activity,
  Zap,
  Target,
  Lightbulb,
  Calendar,
  Clock,
  Eye,
  Settings,
  Keyboard,
  Play
} from 'lucide-react';
import { studentApi, Student } from '../../../../services/api/studentApi';
import { attendanceApi } from '../../../../services/api/attendanceApi';
import { useAttendance } from '../../../../context/AttendanceContext';
import { useTeacher } from '../../../../contexts/TeacherContext';
import AICommandBar from './AICommandBar';
import AnimatedMetricCard from './AnimatedMetricCard';
import ClassSelector from './ClassSelector';

interface SmartInsight {
  id: string;
  type: 'attendance' | 'behavior' | 'performance' | 'prediction';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  data: any;
  actionItems: string[];
  confidence: number;
  timestamp: Date;
}

interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  type: 'document_generation' | 'gradebook_sync' | 'parent_communication' | 'analysis' | 'report_generation';
  status: 'queued' | 'running' | 'completed' | 'paused' | 'failed';
  progress: number;
  estimatedTime: number;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  completedAt?: Date;
  integrations: string[];
}

interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  avgPerformance: number;
  upcomingTests: number;
}

const SmartTeacherDashboard: React.FC = () => {
  const { selectedClass, selectedSection } = useTeacher();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    presentToday: 0,
    avgPerformance: 0,
    upcomingTests: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<SmartInsight | null>(null);
  const [activeTasksTab, setActiveTasksTab] = useState<'tasks' | 'processes'>('tasks');
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { attendanceStats, refreshAttendance } = useAttendance();

  useEffect(() => {
    if (selectedClass && selectedSection) {
      refreshAttendance(selectedClass, selectedSection);
      loadData();
      generateSmartInsights();
      loadActiveTasks();
    }
  }, [selectedClass, selectedSection, refreshAttendance]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const studentsData = await studentApi.getStudents(selectedClass, selectedSection);
      setStudents(Array.isArray(studentsData) ? studentsData : []);

      const attendanceOverview = await attendanceApi.getClassOverview(selectedClass, selectedSection);
      
      setStats({
        totalStudents: studentsData.length,
        presentToday: attendanceOverview.presentCount,
        avgPerformance: Math.round((attendanceOverview.presentCount / attendanceOverview.totalRecords) * 100) || 0,
        upcomingTests: 2
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSmartInsights = async () => {
    const mockInsights: SmartInsight[] = [
      {
        id: 'insight-1',
        type: 'attendance',
        priority: 'high',
        title: 'Attendance Pattern Alert',
        description: '3 students showing declining attendance patterns over the past 2 weeks',
        data: {
          affectedStudents: ['Alex Johnson', 'Sarah Chen', 'Michael Rodriguez'],
          averageDecline: 15,
          expectedImpact: 'Potential grade drop of 8-12%'
        },
        actionItems: [
          'Schedule parent meetings for at-risk students',
          'Implement buddy system for consistent attendance',
          'Create personalized attendance goals'
        ],
        confidence: 87,
        timestamp: new Date()
      },
      {
        id: 'insight-2',
        type: 'performance',
        priority: 'medium',
        title: 'Math Performance Opportunity',
        description: 'Class showing strong improvement in algebra but struggling with geometry concepts',
        data: {
          subjectBreakdown: {
            algebra: { average: 85, trend: '+12%' },
            geometry: { average: 67, trend: '-8%' },
            statistics: { average: 78, trend: '+3%' }
          }
        },
        actionItems: [
          'Introduce visual learning tools for geometry',
          'Pair strong algebra students with geometry strugglers',
          'Schedule extra practice sessions for spatial concepts'
        ],
        confidence: 92,
        timestamp: new Date()
      },
      {
        id: 'insight-3',
        type: 'behavior',
        priority: 'high',
        title: 'Positive Behavior Trend',
        description: 'Class engagement increased 34% after implementing interactive discussions',
        data: {
          engagementMetrics: {
            participation: '+34%',
            positiveInteractions: '+28%',
            disruptiveIncidents: '-67%'
          }
        },
        actionItems: [
          'Expand interactive discussion format to other subjects',
          'Create student-led teaching opportunities',
          'Implement more gamified learning elements'
        ],
        confidence: 89,
        timestamp: new Date()
      }
    ];
    
    setInsights(mockInsights);
  };

  const loadActiveTasks = async () => {
    const mockTasks: WorkflowTask[] = [
      {
        id: 'task-1',
        title: 'Generate Weekly Progress Reports',
        description: 'Creating individualized progress reports for all 32 students with performance insights',
        type: 'document_generation',
        status: 'running',
        progress: 68,
        estimatedTime: 8,
        priority: 'high',
        createdAt: new Date(Date.now() - 1200000),
        integrations: ['gradebook', 'behavior_tracker', 'attendance_system']
      },
      {
        id: 'task-2',
        title: 'Sync Gradebook Data',
        description: 'Synchronizing latest assessment scores and attendance data across all platforms',
        type: 'gradebook_sync',
        status: 'completed',
        progress: 100,
        estimatedTime: 3,
        priority: 'medium',
        createdAt: new Date(Date.now() - 2400000),
        completedAt: new Date(Date.now() - 1800000),
        integrations: ['school_management_system', 'parent_portal']
      },
      {
        id: 'task-3',
        title: 'Parent Communication Batch',
        description: 'Sending personalized updates to parents about upcoming parent-teacher conferences',
        type: 'parent_communication',
        status: 'queued',
        progress: 0,
        estimatedTime: 15,
        priority: 'medium',
        createdAt: new Date(),
        integrations: ['email_system', 'sms_gateway', 'parent_portal']
      }
    ];

    setTasks(mockTasks);
  };

  const quickActions = [
    {
      title: 'Take Attendance',
      icon: ClipboardCheck,
      path: '/teacher/dashboard/attendance',
      gradient: 'from-mint to-success'
    },
    {
      title: 'View Grades',
      icon: FileText,
      path: '/teacher/dashboard/assessments',
      gradient: 'from-primary-500 to-primary-700'
    },
    {
      title: 'Messages',
      icon: Users,
      path: '/teacher/dashboard/communication',
      gradient: 'from-coral to-accent'
    },
    {
      title: 'Resources',
      icon: BookOpen,
      path: '/teacher/dashboard/resources',
      gradient: 'from-amber to-warning'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-red-600';
      case 'medium': return 'from-amber-500 to-amber-600';
      case 'low': return 'from-green-500 to-green-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const getPriorityIcon = (type: string) => {
    switch (type) {
      case 'attendance': return Clock;
      case 'behavior': return Activity;
      case 'performance': return Target;
      case 'prediction': return Brain;
      default: return Lightbulb;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="stats-card max-w-md text-center p-8">
          <div className="text-red-600 mb-4">
            <X className="h-12 w-12 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-sm">{error}</p>
          </div>
          <button onClick={() => loadData()} className="btn-primary w-full">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="shimmer w-16 h-16 rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-500">Loading smart dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* AI Command Bar */}
      <AICommandBar onCommandExecute={(command) => console.log('AI Command executed:', command)} />

      {/* Enhanced Modern Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-neutral-900 tracking-tight">
            Smart Class Dashboard
          </h1>
          <p className="text-neutral-600 text-lg">
            AI-powered insights for Class {selectedClass}{selectedSection} • {stats.totalStudents} students enrolled
          </p>
        </div>
        
        {/* Class Selection */}
        <ClassSelector />
      </div>

      {/* Enhanced Animated Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <AnimatedMetricCard
          title="Total Students"
          value={stats.totalStudents || 0}
          subtitle="Enrolled in your class"
          icon={Users}
          gradient="from-primary-500 to-primary-700"
          trend={{ value: 12, isPositive: true, label: "vs last month" }}
          sparklineData={[28, 32, 35, 30, 28, 30, 32]}
          onClick={() => console.log('Navigate to students')}
        />

        <AnimatedMetricCard
          title="Present Today"
          value={attendanceStats.presentToday || stats.presentToday}
          subtitle={`Out of ${attendanceStats.totalStudents || stats.totalStudents} students`}
          icon={ClipboardCheck}
          gradient="from-mint to-success"
          trend={{ value: 8, isPositive: true, label: "vs yesterday" }}
          sparklineData={[22, 28, 25, 30, 32, 28, 30]}
          onClick={() => console.log('Navigate to attendance')}
        />

        <AnimatedMetricCard
          title="Attendance Rate"
          value={Math.round(((attendanceStats.presentToday || stats.presentToday) / (attendanceStats.totalStudents || stats.totalStudents || 1)) * 100)}
          subtitle="Class attendance percentage"
          icon={TrendingUp}
          gradient="from-coral to-accent"
          trend={{ value: 3, isPositive: false, label: "vs last week" }}
          sparklineData={[85, 88, 82, 90, 87, 85, 88]}
          onClick={() => console.log('Navigate to analytics')}
        />

        <AnimatedMetricCard
          title="AI Insights"
          value={insights.length}
          subtitle="Smart recommendations"
          icon={Brain}
          gradient="from-purple-500 to-purple-700"
          trend={{ value: 2, isPositive: true, label: "new today" }}
          sparklineData={[3, 5, 2, 4, 6, 3, 5]}
          onClick={() => console.log('Navigate to insights')}
        />
      </div>

      {/* Smart Insights Panel */}
      <div className="stats-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-neutral-900">
                Today's AI Insights
              </h2>
              <p className="text-neutral-600">
                Smart analysis of your classroom data • Updated {formatTimestamp(new Date())}
              </p>
            </div>
          </div>
          
          <button
            onClick={generateSmartInsights}
            className="btn-secondary flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            Refresh Insights
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {insights.map((insight) => {
            const IconComponent = getPriorityIcon(insight.type);
            
            return (
              <div
                key={insight.id}
                className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg 
                          transition-all duration-300 cursor-pointer group hover:scale-102"
                onClick={() => setSelectedInsight(insight)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-gradient-to-br ${getPriorityColor(insight.priority)} rounded-lg shadow-md`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-neutral-900 group-hover:text-purple-700">
                          {insight.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full
                          ${insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                            insight.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-green-100 text-green-700'}`}>
                          {insight.priority}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-purple-600 transition-colors" />
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-neutral-600">AI Confidence</span>
                    <span className="font-semibold text-neutral-900">{insight.confidence}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${insight.confidence}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-neutral-700">Recommended Actions:</h4>
                  {insight.actionItems.slice(0, 2).map((action, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-neutral-600">{action}</p>
                    </div>
                  ))}
                  {insight.actionItems.length > 2 && (
                    <p className="text-xs text-purple-600 font-medium">
                      +{insight.actionItems.length - 2} more actions
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Tasks Dashboard */}
      <div className="stats-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg">
              <Play className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-neutral-900">
                Active Tasks Dashboard
              </h2>
              <p className="text-neutral-600">
                Workflow visualization and real-time progress tracking
              </p>
            </div>
          </div>
          
          <div className="flex bg-neutral-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTasksTab('tasks')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTasksTab === 'tasks' 
                  ? 'bg-white text-neutral-900 shadow-sm' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Active Tasks ({tasks.filter(t => t.status !== 'completed').length})
            </button>
            <button
              onClick={() => setActiveTasksTab('processes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTasksTab === 'processes' 
                  ? 'bg-white text-neutral-900 shadow-sm' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              AI Processes (3)
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {tasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-neutral-900">
                      {task.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      task.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'queued' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-neutral-600 mb-3">
                    {task.description}
                  </p>
                  
                  {task.status === 'running' && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-neutral-600">Progress</span>
                        <span className="font-semibold text-neutral-900">{Math.round(task.progress)}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-600">
                        {task.status === 'completed' ? 'Completed' : `~${task.estimatedTime}m`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-600">
                        {task.integrations.length} integration{task.integrations.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {quickActions.map((action) => (
          <button
            key={action.title}
            onClick={() => navigate(action.path)}
            className="stats-card group cursor-pointer text-left p-6 hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-gradient-to-br ${action.gradient} rounded-2xl shadow-lg 
                group-hover:shadow-xl transition-shadow`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-700 mb-1">{action.title}</h3>
              <p className="text-xs text-neutral-500">
                {action.title === 'Take Attendance' ? 'Mark today\'s attendance' :
                 action.title === 'View Grades' ? 'Review assessments' :
                 action.title === 'Messages' ? 'Communicate with parents' :
                 'Access learning materials'}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Detailed Insight Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 bg-gradient-to-br ${getPriorityColor(selectedInsight.priority)} rounded-xl shadow-lg`}>
                    {React.createElement(getPriorityIcon(selectedInsight.type), { className: "h-6 w-6 text-white" })}
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-neutral-900">
                      {selectedInsight.title}
                    </h3>
                    <p className="text-neutral-600 mt-1">
                      {selectedInsight.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <Eye className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="stats-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-neutral-700">Confidence</span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">{selectedInsight.confidence}%</p>
                </div>
                <div className="stats-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-neutral-700">Updated</span>
                  </div>
                  <p className="text-sm text-neutral-900">{formatTimestamp(selectedInsight.timestamp)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-neutral-900 mb-4">Recommended Actions</h4>
                <div className="space-y-3">
                  {selectedInsight.actionItems.map((action, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-700">{index + 1}</span>
                      </div>
                      <p className="text-sm text-neutral-700">{action}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="flex-1 px-4 py-3 border border-neutral-200 text-neutral-700 rounded-xl 
                           hover:bg-neutral-50 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    console.log('Creating tasks from insight:', selectedInsight);
                    setSelectedInsight(null);
                  }}
                  className="flex-1 btn-primary"
                >
                  Create Action Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartTeacherDashboard;
