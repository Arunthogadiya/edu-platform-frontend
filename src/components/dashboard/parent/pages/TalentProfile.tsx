import React, { useState, useEffect } from 'react';
import { Award, Trophy, Medal, Star, TrendingUp, Target, BookOpen, BarChart2, Activity, Gift } from 'lucide-react';
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
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Define interfaces for type safety
interface StudentActivity {
  activity_name: string;
  badge: string;
  description: string;
}

interface StudentData {
  student_id: number;
  student_name: string;
  gender: string;
  activities: StudentActivity[];
}

interface BadgeCounts {
  mvp: number;
  gold: number;
  silver: number;
  bronze: number;
  merit: number;
  other: number;
  [key: string]: number;
}

interface TalentCategory {
  category: string;
  activities: StudentActivity[];
}

interface TalentHistoryEntry {
  date: string;
  scores: Array<{
    category: string;
    score: number;
    hoursPerWeek?: number;
  }>;
}

interface TalentHistoryData {
  history: TalentHistoryEntry[];
}

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
    case 'merit':
      return <Star className="h-6 w-6 text-green-500" />;
    default:
      return <Star className="h-6 w-6 text-blue-500" />;
  }
};

const getBadgeColor = (badge: string) => {
  switch (badge.toLowerCase()) {
    case 'mvp':
      return 'bg-purple-100 text-purple-700';
    case 'gold':
      return 'bg-yellow-100 text-yellow-700';
    case 'silver':
      return 'bg-gray-100 text-gray-700';
    case 'bronze':
      return 'bg-orange-100 text-orange-700';
    case 'merit':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-blue-100 text-blue-700';
  }
};

const TalentProfile: React.FC = () => {
  const [activitiesData, setActivitiesData] = useState<StudentData | null>(null);
  const [talentScores, setTalentScores] = useState<any[]>([]);
  const [peerComparison, setPeerComparison] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [talentHistory, setTalentHistory] = useState<TalentHistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [talentCategories, setTalentCategories] = useState<TalentCategory[]>([]);
  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>({
    mvp: 0,
    gold: 0,
    silver: 0,
    bronze: 0,
    merit: 0,
    other: 0
  });
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activitiesData?.activities) {
      // Extracting talent categories from activities
      const categories = extractTalentCategories(activitiesData.activities);
      setTalentCategories(categories);
      
      // Count badges by type
      const counts = countBadges(activitiesData.activities);
      setBadgeCounts(counts);
    }
  }, [activitiesData]);

  const extractTalentCategories = (activities: StudentActivity[]): TalentCategory[] => {
    // This would ideally be more sophisticated based on the activity data
    // For now we'll create categories based on activity names
    const categoriesMap: {[key: string]: StudentActivity[]} = {
      'Sports': [],
      'Academic': [],
      'Arts': [],
      'Leadership': [],
      'Other': []
    };
    
    activities.forEach(activity => {
      const name = activity.activity_name.toLowerCase();
      if (name.includes('basketball') || name.includes('cricket') || name.includes('sport')) {
        categoriesMap['Sports'].push(activity);
      } else if (name.includes('robot') || name.includes('quiz') || name.includes('chess')) {
        categoriesMap['Academic'].push(activity);
      } else if (name.includes('drama') || name.includes('act')) {
        categoriesMap['Arts'].push(activity);
      } else if (name.includes('debate') || name.includes('lead')) {
        categoriesMap['Leadership'].push(activity);
      } else {
        categoriesMap['Other'].push(activity);
      }
    });
    
    return Object.entries(categoriesMap)
      .filter(([_, activities]) => activities.length > 0)
      .map(([category, activities]) => ({
        category,
        activities
      }));
  };
  
  const countBadges = (activities: StudentActivity[]): BadgeCounts => {
    const counts: BadgeCounts = {
      mvp: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
      merit: 0,
      other: 0
    };
    
    activities.forEach(activity => {
      const badge = activity.badge.toLowerCase();
      if (counts[badge] !== undefined) {
        counts[badge]++;
      } else {
        counts.other++;
      }
    });
    
    return counts;
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [activities, scores, comparisons, recs, history] = await Promise.all([
        dashboardService.fetchActivities(101), // Passing student ID parameter
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

  const renderBadgeSummary = () => {
    const COLORS = ['#8E44AD', '#F1C40F', '#BDC3C7', '#D35400', '#27AE60', '#3498DB'];
    const badgeData = Object.entries(badgeCounts)
      .filter(([_, count]) => count > 0)
      .map(([badge, count]) => ({ name: badge.charAt(0).toUpperCase() + badge.slice(1), value: count }));

    return (
      <div className="bg-white p-6 rounded-xl border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Badge Achievements</h3>
          <Award className="h-6 w-6 text-blue-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={badgeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {badgeData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value} badges`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center">
            <h4 className="font-semibold mb-3">Achievement Summary</h4>
            <ul className="space-y-2">
              {Object.entries(badgeCounts).map(([badge, count]) => (
                count > 0 ? (
                  <li key={badge} className="flex items-center">
                    <div className="mr-2">{getBadgeIcon(badge)}</div>
                    <span className="text-gray-700">{badge.charAt(0).toUpperCase() + badge.slice(1)}: <strong>{count}</strong></span>
                  </li>
                ) : null
              ))}
            </ul>
            <div className="mt-6">
              <p className="text-sm text-gray-700">
                <strong>{activitiesData?.student_name}</strong> has earned {Object.values(badgeCounts).reduce((a: number, b: number) => a + b, 0)} badges across {talentCategories.length} different talent areas.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
                {rec.category && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">
                    {rec.category}
                  </span>
                )}
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

  const renderTalentTabs = () => {
    // Show tabs for different categories
    return (
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              All Activities
            </button>
            {talentCategories.map(category => (
              <button
                key={category.category}
                onClick={() => setActiveTab(category.category)}
                className={`${
                  activeTab === category.category
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                {category.category}
              </button>
            ))}
          </nav>
        </div>
      </div>
    );
  };

  const renderActivitiesForCategory = (category?: string) => {
    let activitiesToShow: StudentActivity[] = [];
    
    if (!category || category === 'all') {
      activitiesToShow = activitiesData?.activities || [];
    } else {
      const categoryData = talentCategories.find(cat => cat.category === category);
      activitiesToShow = categoryData?.activities || [];
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activitiesToShow.map((activity: StudentActivity, index: number) => (
          <div key={index} className="bg-white p-6 rounded-xl border hover:shadow-lg transition-shadow">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getBadgeIcon(activity.badge)}
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-lg font-semibold text-gray-900">{activity.activity_name}</h4>
                <div className="mt-1 flex items-center">
                  <span className={`px-2 py-1 text-sm rounded-full ${getBadgeColor(activity.badge)}`}>
                    {activity.badge.toUpperCase()}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{activity.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTalentTrends = () => {
    if (!talentHistory?.history || talentHistory.history.length < 2) return null;
    
    // Prepare data for line chart
    const trendData = talentHistory.history.map((entry: TalentHistoryEntry) => {
      const data: {[key: string]: any} = { 
        date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) 
      };
      entry.scores.forEach((score: {category: string, score: number}) => {
        data[score.category] = score.score;
      });
      return data;
    });

    // Get unique categories
    const categories: string[] = Array.from(new Set(
      talentHistory.history.flatMap((entry: TalentHistoryEntry) => 
        entry.scores.map((score: {category: string}) => score.category)
      )
    ));

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];

    return (
      <div className="bg-white p-6 rounded-xl border mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Talent Growth Trends</h3>
          <BarChart2 className="h-6 w-6 text-blue-500" />
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {categories.map((category: string, index: number) => (
                <Line 
                  key={`line-${category}`} 
                  type="monotone" 
                  dataKey={category} 
                  stroke={COLORS[index % COLORS.length]} 
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderTalentSummary = () => {
    if (!talentScores.length) return null;
    
    // Calculate average score
    const avgScore = talentScores.reduce((acc, curr) => acc + curr.score, 0) / talentScores.length;
    
    // Find top talents (score >= 90)
    const topTalents = talentScores
      .filter(talent => talent.score >= 90)
      .map(talent => talent.category);
      
    // Find improving talents (would need history data in a real app)
    const improvingTalents = talentScores
      .slice(0, 2) // Just use the first two for demo
      .map(talent => talent.category);

    return (
      <div className="bg-white p-6 rounded-xl border mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Talent Summary</h3>
          <Gift className="h-6 w-6 text-blue-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg bg-blue-50">
            <div className="flex flex-col items-center">
              <Activity className="h-10 w-10 text-blue-500 mb-2" />
              <h4 className="font-semibold text-gray-900 text-center">Average Talent Score</h4>
              <p className="text-3xl font-bold text-blue-600 mt-2">{avgScore.toFixed(1)}</p>
              <span className="text-sm text-gray-500 mt-1">across {talentScores.length} talents</span>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg bg-purple-50">
            <h4 className="font-semibold text-gray-900 mb-2">Top Talents</h4>
            <ul className="space-y-2">
              {topTalents.map(talent => (
                <li key={talent} className="flex items-center">
                  <Star className="h-4 w-4 text-purple-500 mr-2" />
                  <span>{talent}</span>
                </li>
              ))}
            </ul>
            {topTalents.length === 0 && <p className="text-sm text-gray-500">No top talents yet</p>}
          </div>
          
          <div className="p-4 border rounded-lg bg-green-50">
            <h4 className="font-semibold text-gray-900 mb-2">Most Improved</h4>
            <ul className="space-y-2">
              {improvingTalents.map(talent => (
                <li key={talent} className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                  <span>{talent}</span>
                </li>
              ))}
            </ul>
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
      <div className="bg-red-50 p-4 rounded-lg text-red-800 flex items-center justify-center min-h-[200px]">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Talent Profile</h1>
        <p className="text-gray-600 mt-2">Discover and nurture your child's unique talents</p>
        {activitiesData && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800 font-medium">Student: {activitiesData.student_name}</p>
          </div>
        )}
      </div>

      {/* Talent Summary Section */}
      {renderTalentSummary()}

      {/* Talent Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {renderTalentRadar()}
        {renderPeerComparison()}
      </div>

      {/* Badge Analytics */}
      <div className="mb-8">
        {renderBadgeSummary()}
      </div>

      {/* Growth Trends */}
      {renderTalentTrends()}

      {/* Recommendations Section */}
      <div className="mt-8">
        {renderRecommendations()}
      </div>

      {/* Activities Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">All Achievements & Activities</h3>
          <Award className="h-6 w-6 text-blue-500" />
        </div>
        
        {/* Category Tabs */}
        {renderTalentTabs()}
        
        {/* Activities by Category */}
        {renderActivitiesForCategory(activeTab)}
      </div>
    </div>
  );
};

export default TalentProfile;
