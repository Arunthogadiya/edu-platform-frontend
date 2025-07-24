import React, { useState, useEffect } from 'react';
import { 
  Clock,
  ChevronRight,
  Brain,
  Eye,
  Target,
  Lightbulb,
  Activity,
  Calendar
} from 'lucide-react';
import { smartAnalyticsService, SmartAnalyticsData } from '../../../../services/smartAnalyticsService';
import { studentApi } from '../../../../services/api/studentApi';

interface AttendancePattern {
  studentId: string;
  name: string;
  attendanceRate: number;
  trend: 'declining' | 'improving' | 'stable';
  riskLevel: 'high' | 'medium' | 'low';
  predictedAbsences: number;
  recommendedAction: string;
}

interface BehaviorTrend {
  studentId: string;
  name: string;
  sentimentScore: number;
  recentIncidents: number;
  trendDirection: 'improving' | 'declining' | 'stable';
  interventionNeeded: boolean;
  suggestedApproach: string;
}

interface PerformanceInsight {
  subject: string;
  classAverage: number;
  trendDirection: 'up' | 'down' | 'stable';
  strugglingStudents: string[];
  topPerformers: string[];
  recommendedActions: string[];
}

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

const SmartInsightsPanel: React.FC = () => {
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<SmartInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Simulate AI analysis of existing data
  useEffect(() => {
    generateSmartInsights();
    const interval = setInterval(generateSmartInsights, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const generateSmartInsights = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
          },
          strugglingConcepts: ['Area calculations', 'Angle relationships', '3D visualization']
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
          },
          mostEffectiveStrategies: ['Group discussions', 'Peer teaching', 'Gamification']
        },
        actionItems: [
          'Expand interactive discussion format to other subjects',
          'Create student-led teaching opportunities',
          'Implement more gamified learning elements'
        ],
        confidence: 89,
        timestamp: new Date()
      },
      {
        id: 'insight-4',
        type: 'prediction',
        priority: 'medium',
        title: 'Upcoming Performance Prediction',
        description: 'Based on current trends, 8 students likely to exceed expectations in next assessment',
        data: {
          likelyHighPerformers: ['Emma Watson', 'David Kim', 'Priya Patel', 'James Wilson'],
          improvementFactors: ['Consistent homework submission', 'Increased class participation', 'Peer collaboration'],
          confidenceLevel: 85
        },
        actionItems: [
          'Prepare advanced materials for high performers',
          'Consider leadership roles for improved students',
          'Document successful intervention strategies'
        ],
        confidence: 85,
        timestamp: new Date()
      }
    ];
    
    setInsights(mockInsights);
    setLastUpdated(new Date());
    setIsAnalyzing(false);
  };

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

  return (
    <div className="stats-card p-8">
      {/* Header */}
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
              Smart analysis of your classroom data • Updated {formatTimestamp(lastUpdated)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-purple-600">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Analyzing...</span>
            </div>
          )}
          <button
            onClick={generateSmartInsights}
            className="btn-secondary flex items-center gap-2"
            disabled={isAnalyzing}
          >
            <Brain className="w-4 h-4" />
            {isAnalyzing ? 'Analyzing...' : 'Refresh Insights'}
          </button>
        </div>
      </div>

      {/* Insights Grid */}
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
              {/* Insight Header */}
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

              {/* Confidence Score */}
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

              {/* Quick Actions Preview */}
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

              {/* Timestamp */}
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-xs text-neutral-500">
                  Generated {formatTimestamp(insight.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {insights.length === 0 && !isAnalyzing && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl 
                         flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            No insights available yet
          </h3>
          <p className="text-neutral-600 mb-6">
            Our AI is analyzing your classroom data to generate personalized insights
          </p>
          <button
            onClick={generateSmartInsights}
            className="btn-primary"
          >
            Generate Insights
          </button>
        </div>
      )}

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
              {/* Confidence and Timestamp */}
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

              {/* Detailed Data */}
              <div>
                <h4 className="text-lg font-semibold text-neutral-900 mb-4">Detailed Analysis</h4>
                <div className="stats-card p-4 space-y-3">
                  {Object.entries(selectedInsight.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-start">
                      <span className="text-sm font-medium text-neutral-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-sm text-neutral-900 text-right max-w-xs">
                        {Array.isArray(value) ? value.join(', ') : 
                         typeof value === 'object' ? JSON.stringify(value, null, 2) : 
                         String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Items */}
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

              {/* Action Buttons */}
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
                    // Implement action to create tasks from insights
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

export default SmartInsightsPanel;
