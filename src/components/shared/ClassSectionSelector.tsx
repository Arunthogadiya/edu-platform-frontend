import React from 'react';

interface ClassSectionSelectorProps {
  currentClass: string;
  currentSection: string;
  onClassChange: (value: string) => void;
  onSectionChange: (value: string) => void;
}

export const ClassSectionSelector: React.FC<ClassSectionSelectorProps> = ({
  currentClass,
  currentSection,
  onClassChange,
  onSectionChange
}) => {
  const classes = ['6', '7', '8', '9', '10'];
  const sections = ['A', 'B', 'C'];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class
          </label>
          <select
            value={currentClass}
            onChange={(e) => onClassChange(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>Class {cls}th</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section
          </label>
          <select
            value={currentSection}
            onChange={(e) => onSectionChange(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Section</option>
            {sections.map((section) => (
              <option key={section} value={section}>Section {section}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
