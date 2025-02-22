import React, { useState, useEffect } from 'react';
import { Award, Star, Medal, Trophy, AlertCircle } from 'lucide-react';
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activitiesData?.activities?.length > 0 ? (
          activitiesData.activities.map((activity: any, index: number) => 
            renderActivityCard(activity, index)
          )
        ) : (
          renderEmptyState()
        )}
      </div>

      {/* Coming Soon Features */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Achievement Tracking</h2>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Achievement tracking coming soon</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h2>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Activity timeline coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activities;
