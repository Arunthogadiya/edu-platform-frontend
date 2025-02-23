import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mockResources } from '@/data/dummyTeacherData';

const LearningResources: React.FC = () => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<'all' | 'materials' | 'assignments'>('all');

  const filteredResources = selectedType === 'all' 
    ? mockResources 
    : mockResources.filter(resource => resource.type === selectedType);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('teacher.resources.title')}</h1>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => {/* Open upload modal */}}
          >
            {t('teacher.resources.uploadResource')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-4 py-2 rounded ${
                  selectedType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                {t('teacher.resources.allResources')}
              </button>
              <button
                onClick={() => setSelectedType('materials')}
                className={`px-4 py-2 rounded ${
                  selectedType === 'materials' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                {t('teacher.resources.studyMaterials')}
              </button>
              <button
                onClick={() => setSelectedType('assignments')}
                className={`px-4 py-2 rounded ${
                  selectedType === 'assignments' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                {t('teacher.resources.assignments')}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map(resource => (
                <div key={resource.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{resource.title}</h3>
                      <p className="text-sm text-gray-500">{resource.subject}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      resource.type === 'material' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {resource.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{resource.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(resource.uploadedAt).toLocaleDateString()}
                    </span>
                    {resource.url && (
                      <a 
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Resource →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">{t('teacher.resources.quickActions')}</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded">
                {t('teacher.resources.createAssignment')}
              </button>
              <button className="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded">
                {t('teacher.resources.shareResources')}
              </button>
              <button className="w-full px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded">
                {t('teacher.resources.externalLinks')}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">{t('teacher.resources.aiSuggestions')}</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Consider adding practice worksheets for Mathematics Chapter 5</p>
              <p>• Video tutorials might help with complex algebra concepts</p>
              <p>• Students might benefit from interactive science simulations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningResources;