import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Radar, Line } from 'react-chartjs-2';
import {
  Award,
  Trophy,
  Clock,
  ExternalLink,
  ArrowUp,
  Target,
  Zap
} from 'lucide-react';
import { talentService } from '../../../../services/talentService';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

const TalentProfile: React.FC = () => {
  const [scores, setScores] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [peerComparison, setPeerComparison] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const radarChartRef = useRef<ChartJS | null>(null);
  const lineChartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    loadTalentData();

    // Cleanup function to destroy chart instances
    return () => {
      if (radarChartRef.current) {
        radarChartRef.current.destroy();
      }
      if (lineChartRef.current) {
        lineChartRef.current.destroy();
      }
    };
  }, []);

  const loadTalentData = async () => {
    try {
      const [
        talentScores,
        talentRecommendations,
        comparisons,
        talentProfile
      ] = await Promise.all([
        talentService.getTalentScores(),
        talentService.getRecommendations(),
        talentService.getPeerComparison(),
        talentService.getTalentProfile()
      ]);

      setScores(talentScores);
      setRecommendations(talentRecommendations);
      setPeerComparison(comparisons);
      setProfile(talentProfile);
    } catch (error) {
      console.error('Error loading talent data:', error);
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

      {/* Talent Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Talent DNA</h3>
          <div className="h-[400px]">
            <Radar
              ref={radarChartRef}
              data={{
                labels: scores.map(s => s.category),
                datasets: [{
                  label: 'Talent Score',
                  data: scores.map(s => s.score),
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  borderColor: 'rgba(99, 102, 241, 1)',
                  pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                  pointBorderColor: '#fff',
                  pointHoverBackgroundColor: '#fff',
                  pointHoverBorderColor: 'rgba(99, 102, 241, 1)'
                }]
              }}
              options={{
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100
                  }
                },
                maintainAspectRatio: false,
                responsive: true
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Talents</h3>
          <div className="space-y-4">
            {scores
              .sort((a, b) => b.score - a.score)
              .slice(0, 3)
              .map((talent, index) => (
                <div key={talent.category} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mr-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center
                      ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                        'bg-orange-100 text-orange-600'}`}>
                      <Trophy className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{talent.category}</h4>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500">Score: {talent.score}%</span>
                      <span className="mx-2">•</span>
                      <span className="text-green-600">Top {100 - talent.percentile}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{talent.hoursPerWeek}h</div>
                    <div className="text-xs text-gray-500">per week</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Opportunities</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex items-start justify-between mb-2">
                <span className={`px-2 py-1 text-xs rounded-full
                  ${rec.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                    rec.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'}`}>
                  {rec.difficulty}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700`}>
                  {rec.type}
                </span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">{rec.title}</h4>
              <p className="text-sm text-gray-600 mb-4">{rec.description}</p>
              {rec.deadline && (
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Deadline: {new Date(rec.deadline).toLocaleDateString()}</span>
                </div>
              )}
              {rec.url && (
                <a
                  href={rec.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  Learn More
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Timeline</h3>
        <div className="h-[300px]">
          <Line
            ref={lineChartRef}
            data={{
              labels: profile.history.map((h: any) => h.date),
              datasets: scores.map(talent => ({
                label: talent.category,
                data: profile.history.map((h: any) => 
                  h.scores.find((s: any) => s.category === talent.category)?.score || null
                ),
                borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                tension: 0.4
              }))
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TalentProfile;
