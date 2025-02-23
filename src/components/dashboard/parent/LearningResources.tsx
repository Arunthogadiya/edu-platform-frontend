import React, { useEffect, useState } from 'react';
import { Book, Bookmark, Share2, PlayCircle } from 'lucide-react';
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
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 p-6 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="mt-4 text-gray-600">Loading resources...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Resources</h1>
        <p className="text-gray-600 mb-8">Explore educational materials curated for your learning journey</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource, index) => (
            <div 
              key={index} 
              className="group bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(resource.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Book className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
              </div>
              
              <p className="text-gray-600 mb-6 line-clamp-2">{resource.description}</p>
              
              {resource.audio_data && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <PlayCircle className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Audio Resource</span>
                  </div>
                  <audio controls className="w-full custom-audio">
                    <source src={`data:audio/mp3;base64,${resource.audio_data}`} type="audio/mp3" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              
              <div className="flex items-center justify-end mt-4 gap-3">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Bookmark className="h-5 w-5 text-gray-500" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Share2 className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
          
          {resources.length === 0 && (
            <div className="col-span-full">
              <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
                <Book className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No learning resources available yet</p>
                <p className="text-gray-400 text-sm mt-2">Check back later for new content</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningResources;
