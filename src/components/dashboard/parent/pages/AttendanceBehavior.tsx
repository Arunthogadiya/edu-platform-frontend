import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, User, Users } from 'lucide-react';
import { dashboardService } from '../../../../services/dashboardService';
import { authService } from '../../../../services/authService';

const AttendanceBehavior = () => {
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [timetableData, setTimetableData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  const loadAttendanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [attendanceResponse, timetableResponse] = await Promise.all([
        dashboardService.fetchAttendance(),
        dashboardService.fetchTimeTable()
      ]);
      setAttendanceData(attendanceResponse.students[0]);
      setTimetableData(timetableResponse);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getAttendanceForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const record = attendanceData?.attendance?.find((a: any) => {
      const apiDate = new Date(a.date);
      const apiDateStr = apiDate.toISOString().split('T')[0];
      return apiDateStr === dateStr;
    });

    return record || null; // Return the entire record instead of just status
  };

  const getAbsenceReports = () => {
    if (!attendanceData?.attendance) return [];
    return attendanceData.attendance
      .filter((record: any) => record.status === 'absence')
      .map((record: any) => ({
        date: new Date(record.date).toLocaleDateString(),
        notes: record.notes || 'No reason provided',
        status: record.status
      }));
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    // Convert GMT to IST by adding 5 hours and 30 minutes
    date.setHours(date.getHours() + 5);
    date.setMinutes(date.getMinutes() + 30);
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'AM' : 'PM';
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const getCurrentDaySchedule = (timetableData: any[]) => {
    if (!timetableData) return [];
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return timetableData
      .filter(entry => entry.day_of_week === 'Wednesday')
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };

  const renderCalendar = () => {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Create date at noon to avoid timezone issues
      const date = new Date(year, month, day, 12, 0, 0);
      const attendanceRecord = getAttendanceForDate(date);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      const tooltipText = attendanceRecord
        ? `Date: ${date.toLocaleDateString()}
Status: ${attendanceRecord.status}
${attendanceRecord.notes ? `Notes: ${attendanceRecord.notes}` : ''}`
        : `${date.toLocaleDateString()} - No data`;

      days.push(
        <div
          key={day}
          className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium 
            ${isWeekend ? 'bg-gray-100 text-gray-400' : 
              attendanceRecord?.status === 'present' ? 'bg-green-100 text-green-700' :
              attendanceRecord?.status === 'absence' ? 'bg-red-100 text-red-700' :
              'bg-gray-50 text-gray-500'}`}
          title={tooltipText}
          data-tooltip-id="attendance-tooltip"
          data-tooltip-content={tooltipText}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>{error}</p>
          <button
            onClick={loadAttendanceData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate attendance statistics
  const calculateAttendanceStats = () => {
    if (!attendanceData?.attendance) return { present: 0, absent: 0, total: 0, percentage: '0%' };
    
    const present = attendanceData.attendance.filter((a: any) => a.status === 'present').length;
    const absences = attendanceData.attendance.filter((a: any) => a.status === 'absence').length; // Changed from 'absent' to 'absence'
    const total = attendanceData.attendance.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return {
      present,
      absent: absences,
      total,
      percentage: `${percentage}%`
    };
  };

  const stats = calculateAttendanceStats();

  return (
    <div className="container"> {/* Updated container class */}
      {/* Header with student info */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance & Schedule</h1>
        <div className="flex items-center text-gray-600">
          <span className="font-medium">{attendanceData?.student_name}</span>
          <span className="mx-2">•</span>
          <span>ID: {attendanceData?.student_id}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-800">Today's Status</h3>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-green-600">{attendanceData?.attendance[0]?.status || 'N/A'}</p>
          <p className="text-sm text-green-600 mt-1">
            Last updated: {new Date(attendanceData?.attendance[0]?.date).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-800">Monthly Overview</h3>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-blue-600">{stats.percentage} Attendance</p>
          <p className="text-sm text-blue-600 mt-1">
            {stats.present} present out of {stats.total} days
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Schedule - Updated with real data */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
            {timetableData ? (
              getCurrentDaySchedule(timetableData).map((period: any, index: number) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-40 flex-shrink-0"> {/* Increased width for time */}
                    <p className="text-sm font-medium text-gray-900">
                      {formatTime(period.start_time)} - {formatTime(period.end_time)}
                    </p>
                  </div>
                  <div className="flex-1 ml-4">
                    <p className="font-medium text-gray-900">{period.subject}</p>
                    <p className="text-sm text-gray-500">
                      Class {period.class_value}-{period.section}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {/* Teacher ID: {period.teacher_id} */}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">
                <p>No schedule available for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Absence Reports */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Absence Reports</h2>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="space-y-4">
            {getAbsenceReports().length > 0 ? (
              getAbsenceReports().map((report, index) => (
                <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        Absent on {report.date}
                      </p>
                      <p className="mt-1 text-sm text-red-600">
                        {report.notes}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">
                <p>No absence reports</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Calendar with real data and enhanced tooltips */}
      <div className="mt-8 bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {currentMonth} {currentYear} Attendance
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
              <span className="text-sm text-gray-600">Present</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
              <span className="text-sm text-gray-600">Absent</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-3 text-center"> {/* Increased gap */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          {renderCalendar()}
        </div>
      </div>
    </div>
  );
};

export default AttendanceBehavior;