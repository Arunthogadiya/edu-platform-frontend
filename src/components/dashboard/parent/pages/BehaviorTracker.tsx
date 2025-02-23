import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

import { 
  Smile, 
  Frown, 
  Medal, 
  AlertTriangle, 
  TrendingUp, 
  Book,
  Users,
  Star,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Activity,
  PencilIcon,
  SendIcon,
  InfoIcon,
  Loader2Icon
} from 'lucide-react';
import { dashboardService } from '../../../../services/dashboardService';
import { behaviorService } from '../../../../services/behaviorService';

const BehaviorTracker: React.FC = () => {
  const [behaviorData, setBehaviorData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add key state for chart rerendering
  const [chartKey, setChartKey] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadBehaviorData();
  }, []);

  // Update key when data changes
  useEffect(() => {
    if (behaviorData) {
      setChartKey(prev => prev + 1);
    }
  }, [behaviorData]);

  const loadBehaviorData = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardService.fetchBehavior();
      setBehaviorData(response.students[0]);
    } catch (error) {
      console.error('Error loading behavior data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBehaviorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await behaviorService.logHomeBehavior(comment);
      if (result.success) {
        setComment('');
        // Optionally refresh behavior data
        await loadBehaviorData();
      }
    } catch (error) {
      console.error('Error submitting behavior:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBehaviorTypeColor = (type: string, score: number): string => {
    if (score > 0) return 'bg-green-50 text-green-700 border-green-100';
    if (score < 0) return 'bg-red-50 text-red-700 border-red-100';
    return 'bg-gray-50 text-gray-700 border-gray-100';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const analyzeBehaviorData = (records: any[]) => {
    const positiveRecords = records.filter(r => parseFloat(r.sentiment_score) > 0);
    const negativeRecords = records.filter(r => parseFloat(r.sentiment_score) < 0);
    const neutralRecords = records.filter(r => parseFloat(r.sentiment_score) === 0);

    // Updated categorization logic
    const categoryMap = {
      academic: [
        'classroom',
        'creative',
        'participation',
        'cheating',
        'inattentiveness'
      ],
      social: [
        'teamwork',
        'leadership',
        'helpful',
        'collaboration'
      ],
      conduct: [
        'conduct',
        'behavior',
        'attitude',
        'disruption'
      ]
    };

    // Helper function to check if record belongs to category
    const belongsToCategory = (record: any, categoryKeywords: string[]) =>
      categoryKeywords.some(keyword => 
        record.behavior_type.toLowerCase().includes(keyword) ||
        record.comment.toLowerCase().includes(keyword)
      );

    // Categorize records
    const categories = {
      academic: records.filter(r => belongsToCategory(r, categoryMap.academic)),
      social: records.filter(r => belongsToCategory(r, categoryMap.social)),
      conduct: records.filter(r => belongsToCategory(r, categoryMap.conduct)),
      other: records.filter(r => 
        !belongsToCategory(r, [...categoryMap.academic, ...categoryMap.social, ...categoryMap.conduct])
      )
    };

    // Sort records by date within each category
    Object.keys(categories).forEach(key => {
      categories[key as keyof typeof categories].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });

    return {
      positiveCount: positiveRecords.length,
      negativeCount: negativeRecords.length,
      categories,
      overallSentiment: records.reduce((acc, r) => acc + parseFloat(r.sentiment_score), 0) / records.length
    };
  };

  const getGradientFill = (context: any) => {
    const chart = context.chart;
    const { ctx, chartArea } = chart;
    if (!chartArea) return null;
    
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.1)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0.4)');
    return gradient;
  };

  const getSentimentDistribution = (records: any[]) => {
    const positive = records.filter(r => parseFloat(r.sentiment_score) > 0.5).length;
    const neutral = records.filter(r => parseFloat(r.sentiment_score) >= -0.5 && parseFloat(r.sentiment_score) <= 0.5).length;
    const negative = records.filter(r => parseFloat(r.sentiment_score) < -0.5).length;
    return { positive, neutral, negative };
  };

  const getBehaviorTypeTag = (type: string) => {
    const typeColors: Record<string, string> = {
      'Classroom Participation': 'bg-blue-100 text-blue-700',
      'Social Interaction': 'bg-purple-100 text-purple-700',
      'Academic Performance': 'bg-green-100 text-green-700',
      'Conduct': 'bg-yellow-100 text-yellow-700',
      'Leadership': 'bg-indigo-100 text-indigo-700',
      'Homework': 'bg-pink-100 text-pink-700',
      // Add more behavior types and colors as needed
    };

    // Default color if type doesn't match
    const colorClass = typeColors[type] || 'bg-gray-100 text-gray-700';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {type}
      </span>
    );
  };

  const BehaviorRecord = ({ record }: { record: any }) => (
    <div className={`p-3 rounded-lg ${
      parseFloat(record.sentiment_score) > 0 ? 'bg-green-50' : 'bg-red-50'
    }`}>
      <div className="flex items-start justify-between mb-2">
        {getBehaviorTypeTag(record.behavior_type)}
        <span className="text-xs text-gray-500">
          {new Date(record.date).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm font-medium text-gray-800">{record.comment}</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const analysis = behaviorData?.behavior_records ? 
    analyzeBehaviorData(behaviorData.behavior_records) : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with Overall Status */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Behavior Insights</h1>
        <div className="mt-4 bg-white p-6 rounded-xl shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-lg font-medium text-gray-900 mb-2">Overall Behavior</div>
              <div className={`text-3xl font-bold ${(analysis?.overallSentiment ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analysis?.overallSentiment > 0 ? 'Positive' : 'Needs Attention'}
                {analysis?.overallSentiment >= 0 ? <Smile className="inline ml-2" /> : <Frown className="inline ml-2" />}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-gray-900 mb-2">Positive Reports</div>
              <div className="text-3xl font-bold text-green-600">
                {analysis?.positiveCount}
                <Medal className="inline ml-2" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-gray-900 mb-2">Areas for Improvement</div>
              <div className="text-3xl font-bold text-amber-600">
                {analysis?.negativeCount}
                <AlertTriangle className="inline ml-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Behavior Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Academic Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Academic Engagement</h3>
            <Book className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {analysis?.categories.academic.map((record: any, index: number) => (
              <BehaviorRecord key={index} record={record} />
            ))}
          </div>
        </div>

        {/* Social Skills */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Social Skills</h3>
            <Users className="h-5 w-5 text-purple-500" />
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {analysis?.categories.social.map((record: any, index: number) => (
              <BehaviorRecord key={index} record={record} />
            ))}
          </div>
        </div>

        {/* Conduct & Attitude */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Conduct & Attitude</h3>
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {analysis?.categories.conduct.map((record: any, index: number) => (
              <BehaviorRecord key={index} record={record} />
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Behavior Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Behavior Trend</h3>
            <Activity className="h-5 w-5 text-blue-500" />
          </div>
          <div className="h-[300px]">
            {!isLoading && behaviorData && (
              <Line
                key={`line-${chartKey}`}
                data={{
                  labels: behaviorData?.behavior_records?.map((r: any) => 
                    new Date(r.date).toLocaleDateString('default', { month: 'short', day: 'numeric' })
                  ).reverse() || [],
                  datasets: [{
                    label: 'Behavior Score',
                    data: behaviorData?.behavior_records?.map((r: any) => 
                      parseFloat(r.sentiment_score)
                    ).reverse() || [],
                    borderColor: '#4F46E5',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: getGradientFill,
                    pointBackgroundColor: '#4F46E5',
                    pointRadius: 4,
                    pointHoverRadius: 6
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 1,
                      min: -1,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                      },
                      ticks: {
                        callback: (value) => {
                          if (value === 1) return '✨ Excellent';
                          if (value === 0) return '😊 Neutral';
                          if (value === -1) return '💭 Needs Work';
                          return '';
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      titleColor: '#1F2937',
                      bodyColor: '#1F2937',
                      borderColor: '#E5E7EB',
                      borderWidth: 1,
                      padding: 12,
                      displayColors: false,
                      callbacks: {
                        label: (context) => {
                          const score = context.raw as number;
                          const sentiment = score > 0 ? '😊 Positive' : score < 0 ? '😔 Needs Attention' : '😐 Neutral';
                          return `${sentiment} (${(score * 100).toFixed(0)}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Sentiment Overview</h3>
          <div className="h-[300px] flex items-center justify-center">
            {!isLoading && behaviorData && (
              <Doughnut
                key={`doughnut-${chartKey}`}
                data={{
                  labels: ['Positive', 'Neutral', 'Needs Work'],
                  datasets: [{
                    data: Object.values(getSentimentDistribution(behaviorData?.behavior_records || [])),
                    backgroundColor: [
                      'rgba(34, 197, 94, 0.8)',
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(249, 115, 22, 0.8)'
                    ],
                    borderWidth: 0,
                    borderRadius: 4
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '70%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                      }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Log Home Behavior Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-lg border border-blue-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PencilIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Log Home Behavior</h3>
          </div>
          
          <form onSubmit={handleBehaviorSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your observations about your child's behavior at home..."
                className="w-full min-h-[120px] p-4 bg-white rounded-xl border border-blue-200 shadow-sm 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                         placeholder-gray-400 text-gray-600 transition-all duration-200"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {comment.length}/500
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <InfoIcon className="h-4 w-4" />
                <span>Your insights help us better understand your child's development</span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         disabled:opacity-50 disabled:cursor-not-allowed transform transition-all
                         duration-200 hover:scale-105 active:scale-95 flex items-center gap-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <SendIcon className="h-4 w-4" />
                    <span>Submit Observation</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Recent Submissions Preview */}
          <div className="mt-8">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Submissions</h4>
            <div className="space-y-2">
              {behaviorData?.behavior_records
                ?.filter(record => record.source === 'home')
                ?.slice(0, 3)
                ?.map((record, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white/80 rounded-lg border border-blue-100 backdrop-blur-sm"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-medium text-blue-600">
                        {formatDate(record.date)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        parseFloat(record.sentiment_score) > 0 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {parseFloat(record.sentiment_score) > 0 ? 'Positive' : 'Needs Attention'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{record.comment}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorTracker;
