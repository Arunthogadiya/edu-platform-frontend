import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TeacherContextType {
  selectedClass: string;
  selectedSection: string;
  setSelectedClass: (classValue: string) => void;
  setSelectedSection: (section: string) => void;
  setClassAndSection: (classValue: string, section: string) => void;
  resetSelection: () => void;
}

const TeacherContext = createContext<TeacherContextType | undefined>(undefined);

interface TeacherProviderProps {
  children: ReactNode;
}

export const TeacherProvider: React.FC<TeacherProviderProps> = ({ children }) => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');

  // Load from localStorage on mount
  useEffect(() => {
    const savedClass = localStorage.getItem('teacherSelectedClass');
    const savedSection = localStorage.getItem('teacherSelectedSection');
    
    if (savedClass && savedSection) {
      setSelectedClass(savedClass);
      setSelectedSection(savedSection);
    } else {
      // Set default values if nothing is saved
      setSelectedClass('6');
      setSelectedSection('A');
    }
  }, []);

  // Save to localStorage whenever selection changes
  useEffect(() => {
    if (selectedClass && selectedSection) {
      localStorage.setItem('teacherSelectedClass', selectedClass);
      localStorage.setItem('teacherSelectedSection', selectedSection);
    }
  }, [selectedClass, selectedSection]);

  const handleSetSelectedClass = (classValue: string) => {
    setSelectedClass(classValue);
  };

  const handleSetSelectedSection = (section: string) => {
    setSelectedSection(section);
  };

  const setClassAndSection = (classValue: string, section: string) => {
    setSelectedClass(classValue);
    setSelectedSection(section);
  };

  const resetSelection = () => {
    setSelectedClass('');
    setSelectedSection('');
    localStorage.removeItem('teacherSelectedClass');
    localStorage.removeItem('teacherSelectedSection');
  };

  const value: TeacherContextType = {
    selectedClass,
    selectedSection,
    setSelectedClass: handleSetSelectedClass,
    setSelectedSection: handleSetSelectedSection,
    setClassAndSection,
    resetSelection,
  };

  return (
    <TeacherContext.Provider value={value}>
      {children}
    </TeacherContext.Provider>
  );
};

export const useTeacher = (): TeacherContextType => {
  const context = useContext(TeacherContext);
  if (context === undefined) {
    throw new Error('useTeacher must be used within a TeacherProvider');
  }
  return context;
};
