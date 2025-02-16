import React from 'react';
import { Globe, HelpCircle, Volume2 } from 'lucide-react';

interface UtilityBarProps {
  selectedLanguage: 'en' | 'other';
  onLanguageChange: (language: 'en' | 'other') => void;
}

export const UtilityBar: React.FC<UtilityBarProps> = ({
  selectedLanguage,
  onLanguageChange,
}) => {
  return (
    <div className="pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <button 
          className="flex items-center text-gray-600 hover:text-gray-900"
          onClick={() => onLanguageChange(selectedLanguage === 'en' ? 'other' : 'en')}
        >
          <Globe className="h-5 w-5 mr-2" />
          <span>{selectedLanguage === 'en' ? 'English' : 'Other'}</span>
        </button>

        <div className="flex space-x-4">
          <button className="flex items-center text-gray-600 hover:text-gray-900">
            <HelpCircle className="h-5 w-5 mr-2" />
            <span>Help</span>
          </button>
          
          <button className="flex items-center text-gray-600 hover:text-gray-900">
            <Volume2 className="h-5 w-5 mr-2" />
            <span>Voice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
