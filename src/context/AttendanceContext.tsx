import React, { createContext, useContext, useState, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';

interface AttendanceContextType {
  refreshAttendance: (classValue: string, section: string) => Promise<void>;
  attendanceStats: {
    totalStudents: number;
    presentToday: number;
  };
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attendanceStats, setAttendanceStats] = useState({
    totalStudents: 0,
    presentToday: 0
  });

  const refreshAttendance = useCallback(async (classValue: string, section: string) => {
    try {
      const stats = await dashboardService.getTeacherDashboardStats(classValue, section);
      setAttendanceStats({
        totalStudents: stats.totalStudents,
        presentToday: stats.presentToday
      });
    } catch (error) {
      console.error('Error refreshing attendance:', error);
    }
  }, []);

  return (
    <AttendanceContext.Provider value={{ refreshAttendance, attendanceStats }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
