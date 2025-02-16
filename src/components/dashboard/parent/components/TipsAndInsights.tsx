import React from 'react';
import { Lightbulb, ArrowRight, Book, Brain, Clock, Target } from 'lucide-react';
import { calculateGradeStats } from '@utils/gradeUtils';

interface PerformanceInsight {
  subject: string;
  score: number;
  previousScore: number;
  trend: 'up' | 'down' | 'stable';
}

interface TipsAndInsightsProps {
  performance: PerformanceInsight[];
}

const TipsAndInsights: React.FC<TipsAndInsightsProps> = ({ performance }) => {
  const getSubjectSpecificTips = (subject: string, trend: string) => {
    const tips = {
      Mathematics: {
        down: [
          "Practice basic calculations daily",
          "Use math learning apps for 15 minutes",
          "Solve one extra problem each day"
        ],
        stable: [
          "Try more challenging problems",
          "Join math club activities",
          "Practice time management during tests"
        ],
        up: [
          "Keep up the great work!",
          "Help classmates with difficult topics",
          "Explore advanced concepts"
        ]
      },
      Science: {
        down: [
          "Watch educational science videos",
          "Do more hands-on experiments",
          "Create concept mind maps"
        ],
        stable: [
          "Connect concepts to daily life",
          "Join science club activities",
          "Take notes with diagrams"
        ],
        up: [
          "Explore science projects",
          "Read science magazines",
          "Share knowledge with peers"
        ]
      }
    };
    
    return tips[subject as keyof typeof tips]?.[trend as keyof (typeof tips)['Mathematics']] || [];
  };

  const getLearningStyle = (scores: PerformanceInsight[]) => {
    if (!scores || scores.length === 0) {
      return "No data available yet";
    }

    // Use the new gradeUtils to calculate stats for each subject
    const subjectStats = scores.map(subject => ({
      ...subject,
      ...calculateGradeStats([subject.previousScore, subject.score])
    }));

    const bestSubject = subjectStats.reduce((best, current) => 
      current.average > best.average ? current : best, 
      subjectStats[0]
    );

    const styles = {
      Mathematics: "Logical and analytical learner",
      Science: "Experimental and curious learner",
      English: "Verbal and communicative learner",
      History: "Reading and memory-oriented learner"
    };

    return styles[bestSubject.subject as keyof typeof styles] || "Balanced learner";
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-6">
        <Lightbulb className="h-6 w-6 text-yellow-500" />
        <h2 className="text-lg font-semibold text-gray-900">Learning Insights</h2>
      </div>

      {(!performance || performance.length === 0) ? (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100 text-center">
          <p className="text-gray-600">No performance data available yet. Check back after some assessments.</p>
        </div>
      ) : (
        <>
          {/* Learning Style Card */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-blue-100">
            <div className="flex items-start space-x-3">
              <Brain className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Learning Style</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your child appears to be a {getLearningStyle(performance)}
                </p>
              </div>
            </div>
          </div>

          {/* Study Tips */}
          <div className="space-y-4">
            {performance
              .filter(p => p.trend === 'down' || p.trend === 'stable')
              .map((subject, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Book className="h-5 w-5 text-indigo-500" />
                      <h3 className="font-medium text-gray-900">{subject.subject} Tips</h3>
                    </div>
                    <span className={`text-sm ${
                      subject.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {subject.trend === 'down' ? 'Needs attention' : 'Room for improvement'}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {getSubjectSpecificTips(subject.subject, subject.trend).map((tip, i) => (
                      <li key={i} className="flex items-start space-x-2 text-sm text-gray-600">
                        <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>

          {/* Time Management Suggestion */}
          <div className="mt-6 bg-white rounded-lg p-4 shadow-sm border border-blue-100">
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Study Schedule Suggestion</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Based on performance patterns, the best study time appears to be during:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Early Morning', 'After School', 'Early Evening'].map((time, i) => (
                    <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Goal Setting */}
          <div className="mt-6 bg-white rounded-lg p-4 shadow-sm border border-blue-100">
            <div className="flex items-start space-x-3">
              <Target className="h-5 w-5 text-purple-500 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Suggested Goals</h3>
                <div className="mt-2 space-y-2">
                  {performance.map((subject, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{subject.subject}</span>
                      <span className="text-purple-600 font-medium">
                        Target: {Math.min(100, Math.ceil(subject.score + 5))}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TipsAndInsights;