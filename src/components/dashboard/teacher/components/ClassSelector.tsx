import React from 'react';
import { useTeacher } from '../../../../contexts/TeacherContext';
import { ChevronDown } from 'lucide-react';

const ClassSelector: React.FC = () => {
  const { selectedClass, selectedSection, setSelectedClass, setSelectedSection } = useTeacher();

  const classes = ['6', '7', '8', '9', '10'];
  const sections = ['A', 'B', 'C'];

  return (
    <div className="flex gap-4 items-center">
      <div className="bg-white border border-neutral-200 rounded-xl p-4 min-w-0 relative">
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Class</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="bg-transparent border-0 focus:ring-0 font-bold text-neutral-900 cursor-pointer text-lg appearance-none pr-8 w-full"
        >
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>Class {cls}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-12 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      
      <div className="bg-white border border-neutral-200 rounded-xl p-4 min-w-0 relative">
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Section</label>
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="bg-transparent border-0 focus:ring-0 font-bold text-neutral-900 cursor-pointer text-lg appearance-none pr-8 w-full"
          disabled={!selectedClass}
        >
          <option value="">Select Section</option>
          {sections.map((section) => (
            <option key={section} value={section}>Section {section}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-12 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

export default ClassSelector;
