import React, { useState, useEffect, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { 
  AlertTriangle, 
  Brain, 
  Heart, 
  Users, 
  MessageCircle, 
  Plus,
  Mic,
  StopCircle
} from 'lucide-react';
import { behaviorService } from '../../../../services/behaviorService';

const BehaviorTracker: React.FC = () => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [newObservation, setNewObservation] = useState({
    category: 'emotional_regulation',
    score: 7,
    notes: ''
  });
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    loadBehaviorData();
  }, []);

  const loadBehaviorData = async () => {
    try {
      const [analysisData, schoolData, homeData] = await Promise.all([
        behaviorService.getBehaviorAnalysis('123'),
        behaviorService.getSchoolBehavior('123'),
        behaviorService.getHomeBehavior('123')
      ]);
      setAnalysis(analysisData);
    } catch (error) {
      console.error('Error loading behavior data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogBehavior = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await behaviorService.logBehavior({
        ...newObservation,
        date: new Date().toISOString().split('T')[0]
      });
      setShowLogForm(false);
      loadBehaviorData();
    } catch (error) {
      console.error('Error logging behavior:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = async (event) => {
        // Here you would normally send the audio data to a speech-to-text service
        // For demo, we'll just set some mock text
        setNewObservation(prev => ({
          ...prev,
          notes: prev.notes + " Showed good collaboration during group activity."
        }));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
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
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Behavior Insights</h1>
          <p className="text-gray-600 mt-2">Track and understand social-emotional development</p>
        </div>
        <button
          onClick={() => setShowLogForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
            transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Log Observation</span>
        </button>
      </div>

      {/* Behavior Log Form */}
      {showLogForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full m-4">
            <h3 className="text-lg font-semibold mb-4">Log New Observation</h3>
            <form onSubmit={handleLogBehavior} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={newObservation.category}
                  onChange={(e) => setNewObservation(prev => ({
                    ...prev,
                    category: e.target.value
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="emotional_regulation">Emotional Regulation</option>
                  <option value="collaboration">Collaboration</option>
                  <option value="empathy">Empathy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Score (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newObservation.score}
                  onChange={(e) => setNewObservation(prev => ({
                    ...prev,
                    score: parseInt(e.target.value)
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <div className="mt-1 flex space-x-2">
                  <textarea
                    value={newObservation.notes}
                    onChange={(e) => setNewObservation(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-2 rounded-lg ${
                      isRecording ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {isRecording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Observation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Behavior Trends</h3>
          <div className="h-[300px]">
            <Line
              data={{
                labels: analysis.trends.dates,
                datasets: [
                  {
                    label: 'Collaboration',
                    data: analysis.trends.collaboration,
                    borderColor: '#4F46E5',
                    tension: 0.4
                  },
                  {
                    label: 'Empathy',
                    data: analysis.trends.empathy,
                    borderColor: '#059669',
                    tension: 0.4
                  },
                  {
                    label: 'Emotional Regulation',
                    data: analysis.trends.emotional_regulation,
                    borderColor: '#DC2626',
                    tension: 0.4
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas of Focus</h3>
          {analysis.flags.map((flag: any, index: number) => (
            <div key={index} className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">
                    {flag.type.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">{flag.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Activities</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {analysis.suggestions.map((suggestion: any, index: number) => (
            <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-900 mb-2">{suggestion.recommendation}</h4>
              <ul className="space-y-2">
                {suggestion.activities.map((activity: string, actIndex: number) => (
                  <li key={actIndex} className="text-sm text-blue-700 flex items-start space-x-2">
                    <div className="h-5 w-5 flex-shrink-0">•</div>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BehaviorTracker;
