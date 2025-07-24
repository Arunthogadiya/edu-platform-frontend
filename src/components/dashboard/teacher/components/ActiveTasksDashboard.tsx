import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  FileText, 
  Users, 
  Mail,
  BarChart3,
  Zap,
  AlertCircle,
  ArrowRight,
  Settings,
  RefreshCw,
  Download,
  Share2
} from 'lucide-react';

interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  type: 'document_generation' | 'gradebook_sync' | 'parent_communication' | 'analysis' | 'report_generation';
  status: 'queued' | 'running' | 'completed' | 'paused' | 'failed';
  progress: number;
  estimatedTime: number; // in minutes
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  completedAt?: Date;
  dependencies?: string[];
  results?: any;
  integrations: string[];
}

interface AIProcess {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  lastRun: Date;
  nextRun?: Date;
  frequency: 'real-time' | 'hourly' | 'daily' | 'weekly';
  metrics: {
    successRate: number;
    avgProcessingTime: number;
    totalRuns: number;
  };
}

const ActiveTasksDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [processes, setProcesses] = useState<AIProcess[]>([]);
  const [selectedTask, setSelectedTask] = useState<WorkflowTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'processes'>('tasks');

  useEffect(() => {
    loadMockData();
    const interval = setInterval(updateTaskProgress, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadMockData = async () => {
    setIsLoading(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
        createdAt: new Date(Date.now() - 1200000), // 20 minutes ago
        integrations: ['gradebook', 'behavior_tracker', 'attendance_system'],
        dependencies: ['grade_sync']
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
        createdAt: new Date(Date.now() - 2400000), // 40 minutes ago
        completedAt: new Date(Date.now() - 1800000), // 30 minutes ago
        integrations: ['school_management_system', 'parent_portal'],
        results: {
          recordsUpdated: 127,
          studentsAffected: 32,
          discrepanciesFound: 2
        }
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
        integrations: ['email_system', 'sms_gateway', 'parent_portal'],
        dependencies: ['report_generation']
      },
      {
        id: 'task-4',
        title: 'Behavior Pattern Analysis',
        description: 'Analyzing classroom behavior data to identify trends and intervention opportunities',
        type: 'analysis',
        status: 'running',
        progress: 23,
        estimatedTime: 12,
        priority: 'low',
        createdAt: new Date(Date.now() - 900000), // 15 minutes ago
        integrations: ['behavior_tracker', 'learning_analytics'],
        dependencies: []
      },
      {
        id: 'task-5',
        title: 'Monthly Class Report',
        description: 'Generating comprehensive monthly report for administration with insights and recommendations',
        type: 'report_generation',
        status: 'failed',
        progress: 45,
        estimatedTime: 20,
        priority: 'high',
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        integrations: ['all_systems'],
        dependencies: ['data_validation']
      }
    ];

    const mockProcesses: AIProcess[] = [
      {
        id: 'process-1',
        name: 'Real-time Attendance Monitoring',
        description: 'Continuously monitors attendance patterns and sends alerts for unusual absences',
        isActive: true,
        lastRun: new Date(Date.now() - 300000), // 5 minutes ago
        frequency: 'real-time',
        metrics: {
          successRate: 99.2,
          avgProcessingTime: 0.8,
          totalRuns: 1247
        }
      },
      {
        id: 'process-2',
        name: 'Performance Trend Analysis',
        description: 'Daily analysis of student performance trends and early warning detection',
        isActive: true,
        lastRun: new Date(Date.now() - 3600000), // 1 hour ago
        nextRun: new Date(Date.now() + 82800000), // Next day
        frequency: 'daily',
        metrics: {
          successRate: 96.8,
          avgProcessingTime: 4.2,
          totalRuns: 45
        }
      },
      {
        id: 'process-3',
        name: 'Parent Communication Optimizer',
        description: 'Analyzes optimal timing and content for parent communications',
        isActive: false,
        lastRun: new Date(Date.now() - 604800000), // 1 week ago
        nextRun: new Date(Date.now() + 86400000), // Tomorrow
        frequency: 'weekly',
        metrics: {
          successRate: 94.1,
          avgProcessingTime: 6.8,
          totalRuns: 12
        }
      }
    ];

    setTasks(mockTasks);
    setProcesses(mockProcesses);
    setIsLoading(false);
  };

  const updateTaskProgress = () => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.status === 'running' && task.progress < 100) {
          const newProgress = Math.min(100, task.progress + Math.random() * 8);
          return {
            ...task,
            progress: newProgress,
            status: newProgress >= 100 ? 'completed' : task.status,
            completedAt: newProgress >= 100 ? new Date() : task.completedAt
          };
        }
        return task;
      })
    );
  };

  const getStatusIcon = (status: WorkflowTask['status']) => {
    switch (status) {
      case 'running': return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'queued': return <Clock className="w-4 h-4 text-gray-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: WorkflowTask['status']) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'queued': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: WorkflowTask['type']) => {
    switch (type) {
      case 'document_generation': return FileText;
      case 'gradebook_sync': return BarChart3;
      case 'parent_communication': return Mail;
      case 'analysis': return Zap;
      case 'report_generation': return Download;
      default: return Settings;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatLastRun = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="stats-card p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-card p-8">
      {/* Header */}
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
        
        {/* Tab Selector */}
        <div className="flex bg-neutral-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'tasks' 
                ? 'bg-white text-neutral-900 shadow-sm' 
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Active Tasks ({tasks.filter(t => t.status !== 'completed').length})
          </button>
          <button
            onClick={() => setActiveTab('processes')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'processes' 
                ? 'bg-white text-neutral-900 shadow-sm' 
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            AI Processes ({processes.filter(p => p.isActive).length})
          </button>
        </div>
      </div>

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {tasks.map((task) => {
            const TypeIcon = getTypeIcon(task.type);
            
            return (
              <div
                key={task.id}
                className={`bg-white border-l-4 ${getPriorityColor(task.priority)} border border-neutral-200 
                          rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-neutral-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <TypeIcon className="w-5 h-5 text-neutral-600 group-hover:text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-neutral-900 group-hover:text-blue-700">
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-neutral-600 mb-3">
                        {task.description}
                      </p>
                      
                      {/* Progress Bar */}
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
                      
                      {/* Integrations */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-neutral-500" />
                          <span className="text-neutral-600">
                            {task.status === 'completed' ? 'Completed' : `~${formatDuration(task.estimatedTime)}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="w-4 h-4 text-neutral-500" />
                          <span className="text-neutral-600">
                            {task.integrations.length} integration{task.integrations.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Processes Tab */}
      {activeTab === 'processes' && (
        <div className="space-y-4">
          {processes.map((process) => (
            <div
              key={process.id}
              className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${process.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Zap className={`w-5 h-5 ${process.isActive ? 'text-green-600' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-neutral-900">
                        {process.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        process.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {process.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">
                      {process.description}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Process Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stats-card p-3">
                  <div className="text-xs text-neutral-600 mb-1">Success Rate</div>
                  <div className="text-lg font-bold text-green-600">
                    {process.metrics.successRate}%
                  </div>
                </div>
                <div className="stats-card p-3">
                  <div className="text-xs text-neutral-600 mb-1">Avg Time</div>
                  <div className="text-lg font-bold text-blue-600">
                    {process.metrics.avgProcessingTime}s
                  </div>
                </div>
                <div className="stats-card p-3">
                  <div className="text-xs text-neutral-600 mb-1">Total Runs</div>
                  <div className="text-lg font-bold text-purple-600">
                    {process.metrics.totalRuns.toLocaleString()}
                  </div>
                </div>
                <div className="stats-card p-3">
                  <div className="text-xs text-neutral-600 mb-1">Last Run</div>
                  <div className="text-sm font-semibold text-neutral-900">
                    {formatLastRun(process.lastRun)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    {React.createElement(getTypeIcon(selectedTask.type), { className: "h-6 w-6 text-blue-600" })}
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-neutral-900">
                      {selectedTask.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(selectedTask.status)}
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTask.status)}`}>
                        {selectedTask.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-neutral-700">{selectedTask.description}</p>
              
              {/* Progress */}
              {selectedTask.status === 'running' && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-semibold text-neutral-700">Progress</span>
                    <span className="font-bold text-neutral-900">{Math.round(selectedTask.progress)}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${selectedTask.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Integrations */}
              <div>
                <h4 className="font-semibold text-neutral-900 mb-3">Connected Systems</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.integrations.map((integration, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {integration.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Results */}
              {selectedTask.results && (
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-3">Results</h4>
                  <div className="stats-card p-4 space-y-2">
                    {Object.entries(selectedTask.results).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-neutral-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-sm font-semibold text-neutral-900">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="flex-1 px-4 py-3 border border-neutral-200 text-neutral-700 rounded-xl 
                           hover:bg-neutral-50 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    console.log('Viewing task details:', selectedTask);
                    setSelectedTask(null);
                  }}
                  className="flex-1 btn-primary"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveTasksDashboard;
