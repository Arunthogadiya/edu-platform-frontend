import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  BarChart3,
  Download,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { attendanceApi } from '../../../../services/api/attendanceApi';
import { Student } from '../../../../services/api/studentApi';
import { useAttendance } from '../../../../context/AttendanceContext';

interface AttendanceRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  selectedClass: string;
  selectedSection: string;
}

interface DailyAttendance {
  date: string;
  records: { [studentId: number]: 'present' | 'absence' };
  totalPresent: number;
  totalAbsent: number;
}

const AttendanceRegisterModal: React.FC<AttendanceRegisterModalProps> = ({
  isOpen,
  onClose,
  students,
  selectedClass,
  selectedSection
}) => {
  const { attendanceStats } = useAttendance();
  const [attendanceData, setAttendanceData] = useState<DailyAttendance[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [refreshTriggeredBy, setRefreshTriggeredBy] = useState<string>('');

  const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[calc(90vh-88px)]">
            {children}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (isOpen) {
      setRefreshTriggeredBy('Modal opened');
      loadAttendanceData();
    }
  }, [isOpen, dateRange, selectedClass, selectedSection]);

  // Watch for attendance changes and refresh data
  useEffect(() => {
    if (isOpen && attendanceStats.presentToday !== lastRefreshTime) {
      console.log('📊 Attendance stats changed, refreshing modal data...');
      setRefreshTriggeredBy('Stats changed');
      setLastRefreshTime(attendanceStats.presentToday);
      loadAttendanceData();
    }
  }, [attendanceStats, isOpen]);

  // Listen for attendance save events from the main system
  useEffect(() => {
    const handleAttendanceSaved = (event: CustomEvent) => {
      console.log('📢 Received attendanceSaved event:', event.detail);
      const { classValue, section } = event.detail;
      console.log(`📢 Event class/section: ${classValue}/${section} vs modal: ${selectedClass}/${selectedSection}, modal open: ${isOpen}`);
      
      if (isOpen && classValue === selectedClass && section === selectedSection) {
        console.log('✅ Event matches current modal context, refreshing data...');
        setRefreshTriggeredBy('Attendance saved');
        loadAttendanceData();
      } else {
        console.log('❌ Event does not match current modal context, ignoring');
      }
    };

    if (isOpen) {
      console.log(`📢 Setting up attendanceSaved event listener for ${selectedClass}${selectedSection}`);
      window.addEventListener('attendanceSaved', handleAttendanceSaved as EventListener);
    }

    return () => {
      if (isOpen) {
        console.log(`📢 Removing attendanceSaved event listener for ${selectedClass}${selectedSection}`);
      }
      window.removeEventListener('attendanceSaved', handleAttendanceSaved as EventListener);
    };
  }, [isOpen, selectedClass, selectedSection]);

  // Auto-refresh every 30 seconds when modal is open to catch any missed updates
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isOpen) {
      intervalId = setInterval(() => {
        console.log('🔄 Auto-refreshing attendance register data...');
        setRefreshTriggeredBy('Auto-refresh');
        loadAttendanceData();
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isOpen, dateRange, selectedClass, selectedSection]);

  // Manual refresh function
  const handleManualRefresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered for attendance register');
    setRefreshTriggeredBy('Manual refresh');
    loadAttendanceData();
  }, [dateRange, selectedClass, selectedSection]);

  const loadAttendanceData = async () => {
    try {
      setIsLoading(true);
      console.log(`📊 Loading attendance data for modal - Class ${selectedClass}${selectedSection}, Date range: ${dateRange.startDate} to ${dateRange.endDate}`);
      
      const days = getDaysInRange(dateRange.startDate, dateRange.endDate);
      const attendancePromises = days.map(async (date) => {
        try {
          console.log(`📅 Fetching attendance for ${date}...`);
          const records = await attendanceApi.getAttendanceByDate(date, selectedClass, selectedSection);
          const attendanceMap: { [studentId: number]: 'present' | 'absence' } = {};
          
          // Initialize all students as absent
          students.forEach(student => {
            attendanceMap[student.student_id] = 'absence';
          });
          
          // Update with actual attendance records
          console.log(`📝 Processing attendance records for ${date}:`, records);
          console.log(`📝 Records array length: ${Array.isArray(records) ? records.length : 'not array'}`);
          
          if (Array.isArray(records) && records.length > 0) {
            console.log(`✅ Found ${records.length} attendance records for ${date}`);
            records.forEach((record: any) => {
              if (record && record.student_id) {
                console.log(`✅ Setting attendance for student ${record.student_id}: ${record.status}`);
                attendanceMap[record.student_id] = record.status;
              } else {
                console.warn(`⚠️ Invalid record structure:`, record);
              }
            });
          } else {
            console.log(`❌ No attendance records found for ${date} - all students will show as absent`);
          }
          
          console.log(`📊 Final attendance map for ${date}:`, attendanceMap);
          
          // Debug: Show which students are marked present
          const presentStudents = Object.entries(attendanceMap)
            .filter(([_, status]) => status === 'present')
            .map(([studentId, _]) => {
              const student = students.find(s => s.student_id === parseInt(studentId));
              return `${student?.student_name || 'Unknown'} (ID: ${studentId})`;
            });
          console.log(`✅ Students marked present for ${date}:`, presentStudents);
          
          const totalPresent = Object.values(attendanceMap).filter(status => status === 'present').length;
          const totalAbsent = students.length - totalPresent;
          
          return {
            date,
            records: attendanceMap,
            totalPresent,
            totalAbsent
          };
        } catch (error) {
          console.error(`❌ Error loading attendance for ${date}:`, error);
          // Return empty data for failed dates
          const emptyMap: { [studentId: number]: 'present' | 'absence' } = {};
          students.forEach(student => {
            emptyMap[student.student_id] = 'absence';
          });
          return {
            date,
            records: emptyMap,
            totalPresent: 0,
            totalAbsent: students.length
          };
        }
      });

      const attendanceResults = await Promise.all(attendancePromises);
      console.log(`✅ Loaded attendance data for ${attendanceResults.length} days`);
      setAttendanceData(attendanceResults.reverse()); // Most recent first
      setLastRefreshTime(Date.now()); // Update refresh timestamp
      
      // Clear refresh trigger indicator after 3 seconds
      setTimeout(() => {
        setRefreshTriggeredBy('');
      }, 3000);
    } catch (error) {
      console.error('❌ Error loading attendance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInRange = (startDate: string, endDate: string): string[] => {
    const days: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      days.push(date.toISOString().split('T')[0]);
    }
    
    return days;
  };

  const getStudentAttendancePercentage = (studentId: number): number => {
    if (attendanceData.length === 0) return 0;
    
    const presentDays = attendanceData.filter(day => day.records[studentId] === 'present').length;
    return Math.round((presentDays / attendanceData.length) * 100);
  };

  const getOverallAttendanceStats = () => {
    if (attendanceData.length === 0) return { totalDays: 0, averagePresent: 0, averageAbsent: 0 };
    
    const totalDays = attendanceData.length;
    const totalPossibleAttendance = totalDays * students.length;
    const totalPresent = attendanceData.reduce((sum, day) => sum + day.totalPresent, 0);
    const averageAttendancePercentage = Math.round((totalPresent / totalPossibleAttendance) * 100);
    
    return {
      totalDays,
      averagePresent: averageAttendancePercentage,
      averageAbsent: 100 - averageAttendancePercentage
    };
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.student_name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    if (statusFilter === 'all') return true;
    
    const attendancePercentage = getStudentAttendancePercentage(student.student_id);
    if (statusFilter === 'present') return attendancePercentage >= 80;
    if (statusFilter === 'absent') return attendancePercentage < 80;
    
    return true;
  });

  const exportToCSV = () => {
    if (attendanceData.length === 0) return;
    
    // Create CSV content
    let csvContent = 'Student Name,Student ID';
    attendanceData.forEach(day => {
      csvContent += `,${new Date(day.date).toLocaleDateString()}`;
    });
    csvContent += ',Attendance %\n';
    
    filteredStudents.forEach(student => {
      csvContent += `${student.student_name},${student.student_id}`;
      attendanceData.forEach(day => {
        csvContent += `,${day.records[student.student_id] === 'present' ? 'P' : 'A'}`;
      });
      csvContent += `,${getStudentAttendancePercentage(student.student_id)}%\n`;
    });
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-register-class-${selectedClass}${selectedSection}-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const stats = getOverallAttendanceStats();

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Attendance Register - Class ${selectedClass}${selectedSection}`}
    >
      <div className="p-6 space-y-6">
        {/* Controls Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <label className="text-sm font-semibold text-blue-900">Date Range:</label>
              </div>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                />
                <span className="text-blue-600 self-center">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleManualRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
              <button
                onClick={exportToCSV}
                disabled={isLoading || attendanceData.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
            >
              <option value="all">All Students</option>
              <option value="present">Good Attendance (≥80%)</option>
              <option value="absent">Poor Attendance (&lt;80%)</option>
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{students.length}</div>
                <div className="text-sm text-gray-500">Total Students</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalDays}</div>
                <div className="text-sm text-gray-500">Days Tracked</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.averagePresent}%</div>
                <div className="text-sm text-gray-500">Avg Attendance</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{filteredStudents.length}</div>
                <div className="text-sm text-gray-500">Filtered Results</div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading attendance data...</span>
            </div>
          </div>
        )}

        {/* Attendance Register Table */}
        {!isLoading && attendanceData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Attendance Register</h3>
                  <p className="text-sm text-gray-600">
                    Showing {filteredStudents.length} students from {new Date(dateRange.startDate).toLocaleDateString()} to {new Date(dateRange.endDate).toLocaleDateString()}
                  </p>
                </div>
                {lastRefreshTime > 0 && (
                  <div className="text-xs text-gray-500 text-right">
                    <div>Last updated: {new Date(lastRefreshTime).toLocaleTimeString()}</div>
                    {refreshTriggeredBy && (
                      <div className={`font-medium ${
                        refreshTriggeredBy === 'Attendance saved' ? 'text-blue-600 animate-pulse' : 'text-green-600'
                      }`}>
                        📡 {refreshTriggeredBy}
                        {refreshTriggeredBy === 'Attendance saved' && ' 🎉'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Student
                    </th>
                    {attendanceData.map((day) => (
                      <th key={day.date} className="px-2 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[60px]">
                        <div className="flex flex-col">
                          <span>{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                        </div>
                      </th>
                    ))}
                    <th className="sticky right-0 bg-gray-50 px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-l border-gray-200">
                      Attendance %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student, index) => {
                    const attendancePercentage = getStudentAttendancePercentage(student.student_id);
                    return (
                      <tr key={student.student_id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        <td className="sticky left-0 bg-white px-4 py-3 whitespace-nowrap border-r border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {student.student_name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{student.student_name}</div>
                              <div className="text-xs text-gray-500">ID: {student.student_id}</div>
                            </div>
                          </div>
                        </td>
                        {attendanceData.map((day) => (
                          <td key={`${student.student_id}-${day.date}`} className="px-2 py-3 text-center">
                            {day.records[student.student_id] === 'present' ? (
                              <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto">
                                <XCircle className="w-4 h-4" />
                              </div>
                            )}
                          </td>
                        ))}
                        <td className="sticky right-0 bg-white px-4 py-3 text-center border-l border-gray-200">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                            attendancePercentage >= 90 ? 'bg-green-100 text-green-800' :
                            attendancePercentage >= 80 ? 'bg-yellow-100 text-yellow-800' :
                            attendancePercentage >= 60 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {attendancePercentage}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && attendanceData.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Attendance Data Found</h3>
            <p className="text-gray-500">
              No attendance records found for the selected date range. Try adjusting your date range or check if attendance has been marked.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AttendanceRegisterModal;
