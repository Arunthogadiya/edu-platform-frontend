import React, { useEffect, useState } from 'react';
import { Book } from 'lucide-react';
import { learningResourceService } from '../../../services/learningResourceService';
import { authService } from '../../../services/authService';

const LearningResources: React.FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResources = async () => {
      try {
        setIsLoading(true);
        const user = authService.getCurrentUser();
        if (!user) {
          throw new Error('User data not found');
        }

        const resources = await learningResourceService.getResources(user.class_value, user.section);
        setResources(resources);
      } catch (error) {
        console.error('Error loading resources:', error);
        setError('Failed to load learning resources');
      } finally {
        setIsLoading(false);
      }
    };

    loadResources();
  }, []);

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Learning Resources</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
              <Book className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
            {resource.audio_data && (
              <audio controls className="w-full">
                <source src={`data:audio/mp3;base64,${resource.audio_data}`} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        ))}
        {resources.length === 0 && (
          <div className="col-span-full text-center p-6 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No learning resources available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningResources;
