import React, { useState, useEffect } from 'react';
import { Award, Trophy, Medal, Star, TrendingUp, Target, BookOpen } from 'lucide-react';
import { dashboardService } from '../../../../services/dashboardService';
import { talentService } from '../../../../services/talentService';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';

const getBadgeIcon = (badge: string) => {
  switch (badge.toLowerCase()) {
    case 'mvp':
      return <Trophy className="h-6 w-6 text-yellow-500" />;
    case 'gold':
      return <Medal className="h-6 w-6 text-yellow-500" />;
    case 'silver':
      return <Medal className="h-6 w-6 text-gray-400" />;
    case 'bronze':
      return <Medal className="h-6 w-6 text-orange-500" />;
    default:
      return <Star className="h-6 w-6 text-blue-500" />;
  }
};

const TalentProfile: React.FC = () => {
  const [activitiesData, setActivitiesData] = useState<any>(null);
  const [talentScores, setTalentScores] = useState<any[]>([]);
  const [peerComparison, setPeerComparison] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [talentHistory, setTalentHistory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [activities, scores, comparisons, recs, history] = await Promise.all([
        dashboardService.fetchActivities(),
        talentService.getTalentScores(),
        talentService.getPeerComparison(),
        talentService.getRecommendations(),
        talentService.getTalentProfile()
      ]);

      setActivitiesData(activities.students[0]);
      setTalentScores(scores);
      setPeerComparison(comparisons);
      setRecommendations(recs);
      setTalentHistory(history);
      setError(null);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load talent profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTalentRadar = () => (
    <div className="bg-white p-6 rounded-xl border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Talent Distribution</h3>
        <Target className="h-6 w-6 text-blue-500" />
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={talentScores}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderPeerComparison = () => (
    <div className="bg-white p-6 rounded-xl border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Peer Comparison</h3>
        <TrendingUp className="h-6 w-6 text-blue-500" />
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={peerComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="studentScore" name="Your Score" fill="#8884d8" />
            <Bar dataKey="averageScore" name="Peer Average" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="bg-white p-6 rounded-xl border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recommended Opportunities</h3>
        <BookOpen className="h-6 w-6 text-blue-500" />
      </div>
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                rec.difficulty === 'advanced' ? 'bg-purple-100 text-purple-700' :
                rec.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                'bg-green-100 text-green-700'
              }`}>
                {rec.difficulty}
              </span>
            </div>
            {rec.deadline && (
              <p className="text-sm text-gray-500 mt-2">
                Deadline: {new Date(rec.deadline).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Talent Profile</h1>
        <p className="text-gray-600 mt-2">Discover and nurture your child's unique talents</p>
      </div>

      {/* Talent Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {renderTalentRadar()}
        {renderPeerComparison()}
      </div>

      {/* Recommendations Section */}
      <div className="mt-8">
        {renderRecommendations()}
      </div>

      {/* Activities Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Achievements</h3>
          <Award className="h-6 w-6 text-blue-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activitiesData?.activities?.slice(0, 3).map((activity: any, index: number) => (
            <div key={index} className="bg-white p-6 rounded-xl border hover:shadow-lg transition-shadow">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {getBadgeIcon(activity.badge)}
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">{activity.activity_name}</h4>
                  <div className="mt-1 flex items-center">
                    <span className={`px-2 py-1 text-sm rounded-full ${
                      activity.badge === 'MVP' ? 'bg-purple-100 text-purple-700' :
                      activity.badge === 'Gold' ? 'bg-yellow-100 text-yellow-700' :
                      activity.badge === 'Silver' ? 'bg-gray-100 text-gray-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {activity.badge}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{activity.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TalentProfile;
