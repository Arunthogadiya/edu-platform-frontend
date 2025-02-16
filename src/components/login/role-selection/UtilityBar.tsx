import React from 'react';
import { Globe, HelpCircle } from 'lucide-react';

interface UtilityBarProps {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  onHelpClick: () => void;
}

export const UtilityBar: React.FC<UtilityBarProps> = ({ 
  selectedLanguage, 
  onLanguageChange,
  onHelpClick 
}) => {
  return (
    <div className="flex items-center justify-end space-x-4 mt-6 pt-4 border-t">
      <div className="flex items-center space-x-2">
        <Globe className="h-5 w-5 text-gray-500" />
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-transparent text-gray-600 text-sm focus:outline-none cursor-pointer"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
        </select>
      </div>
      
      <button
        onClick={onHelpClick}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <HelpCircle className="h-5 w-5" />
      </button>
    </div>
  );
};
