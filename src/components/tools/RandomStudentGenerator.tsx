import React, { useState } from 'react';
import { Users, Plus, Eye, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { studentApi } from '../../services/api/studentApi';

// Sample data arrays for generating realistic student information
const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Ananya', 'Fatima', 'Aadhya', 'Arya', 'Sara', 'Diya', 'Kavya', 'Priya', 'Riya', 'Zara'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Patel', 'Agarwal', 'Jain', 'Mishra', 'Shah',
  'Reddy', 'Rao', 'Iyer', 'Nair', 'Mehta', 'Malhotra', 'Kapoor', 'Chopra', 'Bansal', 'Joshi'
];

const parentFirstNames = [
  'Rajesh', 'Suresh', 'Amit', 'Vikash', 'Pradeep', 'Ramesh', 'Mahesh', 'Dinesh', 'Naresh', 'Rakesh',
  'Sunita', 'Meera', 'Kavita', 'Sita', 'Geeta', 'Neeta', 'Rita', 'Anita', 'Lalita', 'Mamta'
];

const classes = ['6', '7', '8', '9', '10'];
const sections = ['A', 'B', 'C'];
const genders = ['Male', 'Female'];

interface GeneratedStudent {
  student_id: string;
  student_name: string;
  parent_name: string;
  parent_phone: string;
  gender: string;
  class_value: string;
  section: string;
  date_of_birth: string;
}

interface LogEntry {
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
}

const RandomStudentGenerator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewStudents, setPreviewStudents] = useState<GeneratedStudent[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  // Function to generate random phone number
  const generatePhoneNumber = (): string => {
    const prefixes = ['98', '97', '96', '95', '94', '93', '92', '91', '90', '89'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const remaining = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return prefix + remaining;
  };

  // Function to generate random date of birth (for students aged 10-16)
  const generateDateOfBirth = (): string => {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - Math.floor(Math.random() * 7) - 10; // Ages 10-16
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1; // Using 28 to avoid month-specific issues
    
    return `${birthYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  // Function to generate a random student
  const generateRandomStudent = (id: number): GeneratedStudent => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const studentName = `${firstName} ${lastName}`;
    
    const parentFirstName = parentFirstNames[Math.floor(Math.random() * parentFirstNames.length)];
    const parentName = `${parentFirstName} ${lastName}`;
    
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const classValue = classes[Math.floor(Math.random() * classes.length)];
    const section = sections[Math.floor(Math.random() * sections.length)];
    
    return {
      student_id: (1000 + id).toString(),
      student_name: studentName,
      parent_name: parentName,
      parent_phone: generatePhoneNumber(),
      gender: gender,
      class_value: classValue,
      section: section,
      date_of_birth: generateDateOfBirth()
    };
  };

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      message,
      type,
      timestamp: new Date()
    };
    setLogs(prev => [...prev, newLog]);
    setShowLogs(true);
  };

  const generatePreview = () => {
    const students = [];
    for (let i = 1; i <= 10; i++) {
      students.push(generateRandomStudent(i));
    }
    setPreviewStudents(students);
    setShowPreview(true);
    addLog('Generated 10 sample students for preview', 'info');
  };

  const addStudentsToDatabase = async () => {
    setIsLoading(true);
    setLogs([]);
    addLog('Starting to add 10 random students to the database...', 'info');

    try {
      const students = [];
      
      // Generate 10 random students
      for (let i = 1; i <= 10; i++) {
        const student = generateRandomStudent(i);
        students.push(student);
      }

      addLog(`Generated ${students.length} students`, 'success');

      // Add each student to the database
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < students.length; i++) {
        try {
          addLog(`Adding student ${i + 1}/10: ${students[i].student_name}...`, 'info');
          await studentApi.addStudent(students[i]);
          addLog(`✅ Successfully added: ${students[i].student_name}`, 'success');
          successCount++;
          
          // Add a small delay between requests
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          addLog(`❌ Failed to add ${students[i].student_name}: ${error}`, 'error');
          errorCount++;
        }
      }

      addLog(`🎉 Finished! Successfully added ${successCount} students, ${errorCount} failed`, 'success');
      
    } catch (error) {
      addLog(`❌ Error: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Random Student Generator</h1>
        </div>
        <p className="text-blue-100">
          Generate realistic student data to populate your database for testing and analysis
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={generatePreview}
          className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <Eye className="w-5 h-5" />
          Preview Sample Students
        </button>

        <button
          onClick={addStudentsToDatabase}
          disabled={isLoading}
          className="flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adding Students...
            </>
          ) : (
            <>
              <Database className="w-5 h-5" />
              Add 10 Students to Database
            </>
          )}
        </button>
      </div>

      {/* Student Preview */}
      {showPreview && previewStudents.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Student Preview</h2>
            <p className="text-sm text-gray-600">Sample of randomly generated students</p>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {previewStudents.map((student, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {student.student_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{student.student_name}</h3>
                      <p className="text-xs text-gray-500">ID: {student.student_id}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Class:</span> {student.class_value}-{student.section}</p>
                    <p><span className="font-medium">Gender:</span> {student.gender}</p>
                    <p><span className="font-medium">Parent:</span> {student.parent_name}</p>
                    <p><span className="font-medium">Phone:</span> {student.parent_phone}</p>
                    <p><span className="font-medium">DOB:</span> {student.date_of_birth}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs */}
      {showLogs && logs.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
            <p className="text-sm text-gray-600">Real-time progress of student addition</p>
          </div>
          <div className="p-6">
            <div className="max-h-96 overflow-y-auto space-y-2">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  {getLogIcon(log.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-mono">{log.message}</p>
                    <p className="text-xs text-gray-500">
                      {log.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">What this tool does:</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Generates 10 students with realistic Indian names
          </li>
          <li className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Assigns random classes (6-10) and sections (A-C)
          </li>
          <li className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Creates parent information with phone numbers
          </li>
          <li className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Sets appropriate dates of birth (ages 10-16)
          </li>
          <li className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Adds them to your database via the API
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RandomStudentGenerator;
