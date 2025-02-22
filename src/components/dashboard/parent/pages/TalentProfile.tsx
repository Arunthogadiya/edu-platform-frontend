import React, { useState, useEffect } from 'react';
import { Award, Trophy, Medal, Star, AlertCircle, Clock, BarChart } from 'lucide-react';  // Changed ChartIcon to BarChart
import { dashboardService } from '../../../../services/dashboardService';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatTimeToIST = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const activities = await dashboardService.fetchActivities();
      setActivitiesData(activities.students[0]);
      setError(null);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load activities data');
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Activities Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Activities & Achievements</h3>
          <Award className="h-6 w-6 text-blue-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activitiesData?.activities?.map((activity: any, index: number) => (
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

      {/* Coming Soon Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Talent Assessment - Coming Soon */}
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Talent Assessment</h3>
            <BarChart className="h-6 w-6 text-blue-500" /> {/* Changed from ChartIcon to BarChart */}
          </div>
          <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Talent assessment coming soon</p>
          </div>
        </div>

        {/* Progress Tracking - Coming Soon */}
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Progress Tracking</h3>
            <Clock className="h-6 w-6 text-blue-500" />
          </div>
          <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Progress tracking coming soon</p>
          </div>
        </div>

        {/* Events Timeline - Now using IST */}
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Events Timeline</h3>
            <Clock className="h-6 w-6 text-blue-500" />
          </div>
          <div className="space-y-4">
            {/* Use the IST formatter for any time displays */}
            {activitiesData?.activities?.map((activity: any, index: number) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-24 flex-shrink-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.time && formatTimeToIST(activity.time)}
                  </p>
                </div>
                {/* ...rest of activity display... */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentProfile;
