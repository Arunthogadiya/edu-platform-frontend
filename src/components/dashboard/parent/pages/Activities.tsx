import React, { useState, useEffect } from 'react';
import { Award, Star, Medal, Trophy, AlertCircle } from 'lucide-react';
import { dashboardService } from '../../../../services/dashboardService';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
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

const Activities: React.FC = () => {
  const [activitiesData, setActivitiesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardService.fetchActivities();
      setActivitiesData(response.students[0]);
      setError(null);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Failed to load activities data');
    } finally {
      setIsLoading(false);
    }
  };

  // Analytics helper functions
  const categorizeActivity = (activity: any) => {
    const name = activity.activity_name.toLowerCase();
    if (name.includes('basketball') || name.includes('sports') || name.includes('chess')) {
      return 'Sports';
    }
    if (name.includes('robot') || name.includes('quiz') || name.includes('science')) {
      return 'Academic';
    }
    if (name.includes('drama') || name.includes('music') || name.includes('art')) {
      return 'Arts';
    }
    if (name.includes('debate') || name.includes('leadership')) {
      return 'Leadership';
    }
    return 'Other';
  };

  const calculateSkillScores = (activities: any[]) => {
    const scores: { [key: string]: { total: number; count: number } } = {
      Sports: { total: 0, count: 0 },
      Academic: { total: 0, count: 0 },
      Arts: { total: 0, count: 0 },
      Leadership: { total: 0, count: 0 },
      Other: { total: 0, count: 0 }
    };

    activities.forEach(activity => {
      const category = categorizeActivity(activity);
      const badgeScore = 
        activity.badge.toLowerCase() === 'mvp' ? 100 :
        activity.badge.toLowerCase() === 'gold' ? 80 :
        activity.badge.toLowerCase() === 'silver' ? 60 :
        activity.badge.toLowerCase() === 'bronze' ? 40 : 20;

      scores[category].total += badgeScore;
      scores[category].count++;
    });

    return Object.entries(scores).map(([category, data]) => ({
      subject: category,
      A: data.count > 0 ? data.total / data.count : 0
    }));
  };

  const processAchievements = (activities: any[]) => {
    const categories = ['Academic', 'Sports', 'Arts', 'Leadership', 'Other'];
    const achievements = categories.map(category => ({
      category,
      MVP: 0,
      Gold: 0,
      Silver: 0,
      Bronze: 0
    }));

    activities.forEach(activity => {
      const category = categorizeActivity(activity);
      const badge = activity.badge.charAt(0).toUpperCase() + activity.badge.slice(1).toLowerCase();
      const categoryIndex = achievements.findIndex(a => a.category === category);
      if (categoryIndex !== -1 && ['MVP', 'Gold', 'Silver', 'Bronze'].includes(badge)) {
        achievements[categoryIndex][badge as 'MVP' | 'Gold' | 'Silver' | 'Bronze']++;
      }
    });

    return achievements;
  };

  const renderActivityCard = (activity: any, index: number) => (
    <div key={index} className="bg-white p-6 rounded-xl border hover:shadow-lg transition-shadow">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getBadgeIcon(activity.badge || 'default')}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{activity.activity_name}</h3>
          <div className="mt-1 flex items-center">
            <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
              {activity.badge || 'Participant'}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {activity.description || 'No description available'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
      <AlertCircle className="h-12 w-12 text-gray-400 mb-3" />
      <h3 className="text-lg font-medium text-gray-900">No Activities Found</h3>
      <p className="text-gray-500 text-center mt-2">
        Activities and achievements will appear here once they're available.
      </p>
    </div>
  );

  const renderAnalytics = (activities: any[]) => {
    const skillsData = calculateSkillScores(activities);
    const achievementsData = processAchievements(activities);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Skill Distribution Radar Chart */}
        <div className="bg-white p-6 rounded-xl border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Distribution</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <Radar
                  name="Skills"
                  dataKey="A"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Achievements Bar Chart */}
        <div className="bg-white p-6 rounded-xl border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements Distribution</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={achievementsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="MVP" fill="#FFD700" />
                <Bar dataKey="Gold" fill="#DAA520" />
                <Bar dataKey="Silver" fill="#C0C0C0" />
                <Bar dataKey="Bronze" fill="#CD7F32" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>{error}</p>
          <button onClick={loadActivities} className="mt-2 text-sm underline">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Activities</h1>
        <p className="text-gray-600">
          Extracurricular achievements and participation records
        </p>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {activitiesData?.activities?.length > 0 ? (
          activitiesData.activities.map((activity: any, index: number) => 
            renderActivityCard(activity, index)
          )
        ) : (
          renderEmptyState()
        )}
      </div>

      {/* Activity Analytics */}
      {activitiesData?.activities?.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Activity Analytics</h2>
          {renderAnalytics(activitiesData.activities)}
        </div>
      )}
    </div>
  );
};

export default Activities;
