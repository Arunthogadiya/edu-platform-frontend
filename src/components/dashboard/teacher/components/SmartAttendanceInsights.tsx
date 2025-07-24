import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  Target,
  Lightbulb,
  Award,
  Sparkles
} from 'lucide-react';

interface SmartInsight {
  id: string;
  type: 'pattern' | 'prediction' | 'anomaly' | 'suggestion';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  timestamp: Date;
}

interface AttendancePattern {
  pattern: string;
  frequency: number;
  students: string[];
  recommendation: string;
}

const SmartAttendanceInsights: React.FC<{
  attendanceData: any[];
  classId: string;
  section: string;
}> = ({ attendanceData, classId, section }) => {
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [patterns, setPatterns] = useState<AttendancePattern[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (attendanceData.length > 0) {
      generateSmartInsights();
    }
  }, [attendanceData]);

  const generateSmartInsights = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockInsights: SmartInsight[] = [
      {
        id: '1',
        type: 'pattern',
        title: 'Monday Morning Absence Pattern',
        description: '15% higher absence rate on Monday mornings detected. Students like Arjun, Meera tend to miss first period.',
        confidence: 87,
        impact: 'medium',
        actionable: true,
        timestamp: new Date()
      },
      {
        id: '2',
        type: 'prediction',
        title: 'Weather Impact Prediction',
        description: 'Rain forecast for tomorrow. Historical data shows 23% increase in absences during rainy days.',
        confidence: 73,
        impact: 'low',
        actionable: true,
        timestamp: new Date()
      },
      {
        id: '3',
        type: 'anomaly',
        title: 'Unusual Absence Cluster',
        description: '3 students from same locality absent today. Possible transportation issue or local event.',
        confidence: 92,
        impact: 'high',
        actionable: true,
        timestamp: new Date()
      },
      {
        id: '4',
        type: 'suggestion',
        title: 'Engagement Opportunity',
        description: 'Students with 90%+ attendance show 15% better performance. Consider recognition program.',
        confidence: 95,
        impact: 'high',
        actionable: true,
        timestamp: new Date()
      }
    ];

    const mockPatterns: AttendancePattern[] = [
      {
        pattern: 'Late Arrival Trend',
        frequency: 78,
        students: ['Arjun Kumar', 'Priya Sharma'],
        recommendation: 'Consider flexible start time or transportation assistance'
      },
      {
        pattern: 'Pre-exam Absence',
        frequency: 45,
        students: ['Multiple students'],
        recommendation: 'Implement pre-exam counseling sessions'
      }
    ];

    setInsights(mockInsights);
    setPatterns(mockPatterns);
    setIsAnalyzing(false);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <BarChart3 className="w-5 h-5" />;
      case 'prediction': return <TrendingUp className="w-5 h-5" />;
      case 'anomaly': return <AlertCircle className="w-5 h-5" />;
      case 'suggestion': return <Lightbulb className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'prediction': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'anomaly': return 'bg-red-100 text-red-700 border-red-200';
      case 'suggestion': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Smart Analytics Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Smart Attendance Analytics</h2>
            <p className="text-indigo-100">AI-powered insights for Class {classId}{section}</p>
          </div>
        </div>

        {isAnalyzing && (
          <div className="bg-white/10 rounded-xl p-4 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white">Analyzing attendance patterns...</span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">94%</div>
              <div className="text-sm text-gray-500">Avg Attendance</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">+3%</div>
              <div className="text-sm text-gray-500">This Month</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-500">Patterns Found</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">85%</div>
              <div className="text-sm text-gray-500">AI Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Insights */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="text-lg font-bold text-purple-900">AI-Generated Insights</h3>
              <p className="text-purple-700">Smart patterns and recommendations</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-xl border-2 ${getInsightColor(insight.type)} transition-all hover:shadow-lg`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {getInsightIcon(insight.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-gray-900">{insight.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                      insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {insight.impact} impact
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{insight.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Confidence:</span>
                        <span className="font-semibold text-gray-900">{insight.confidence}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {insight.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
                    {insight.actionable && (
                      <button className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold">
                        Take Action
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Patterns */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-bold text-blue-900">Detected Patterns</h3>
              <p className="text-blue-700">Recurring attendance behaviors</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {patterns.map((pattern, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-900">{pattern.pattern}</h4>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${pattern.frequency}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{pattern.frequency}%</span>
                </div>
              </div>
              
              <div className="mb-3">
                <span className="text-sm text-gray-600">Affected students: </span>
                <span className="text-sm font-medium text-gray-900">{pattern.students.join(', ')}</span>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-blue-900">Recommendation:</span>
                    <p className="text-sm text-blue-800">{pattern.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartAttendanceInsights;
