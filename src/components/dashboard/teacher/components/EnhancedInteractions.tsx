import React, { useState, useEffect, useCallback } from 'react';
import { 
  GripVertical, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Award,
  AlertTriangle,
  TrendingUp,
  Eye,
  Edit3,
  Archive,
  Star,
  Command,
  Keyboard
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  rollNo: string;
  avatar?: string;
  performance: number;
  attendance: number;
  behaviorScore: number;
  recentActivity: string;
  parentContact: {
    name: string;
    phone: string;
    email: string;
  };
  tags: string[];
  lastInteraction: Date;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

interface DragItem {
  id: string;
  type: 'student' | 'group';
  data: any;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut: string;
  action: (student?: Student) => void;
  contextual?: boolean;
}

interface Group {
  id: string;
  name: string;
  students: string[];
  color: string;
  created: Date;
}

const EnhancedInteractions: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [isDropZoneActive, setIsDropZoneActive] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; student: Student } | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [filterBy, setFilterBy] = useState<'all' | 'high_priority' | 'needs_attention' | 'recent'>('all');

  // Mock data
  useEffect(() => {
    const mockStudents: Student[] = [
      {
        id: 'student-1',
        name: 'Alex Johnson',
        rollNo: '1001',
        performance: 85,
        attendance: 92,
        behaviorScore: 88,
        recentActivity: 'Submitted Math assignment',
        parentContact: {
          name: 'Sarah Johnson',
          phone: '+1234567890',
          email: 'sarah.johnson@email.com'
        },
        tags: ['math_excellence', 'needs_reading_support'],
        lastInteraction: new Date(Date.now() - 86400000),
        priority: 'medium',
        notes: 'Strong in mathematics, needs encouragement in literature'
      },
      {
        id: 'student-2',
        name: 'Emma Wilson',
        rollNo: '1002',
        performance: 78,
        attendance: 85,
        behaviorScore: 95,
        recentActivity: 'Led group discussion',
        parentContact: {
          name: 'Michael Wilson',
          phone: '+1234567891',
          email: 'michael.wilson@email.com'
        },
        tags: ['leadership', 'consistent_performer'],
        lastInteraction: new Date(Date.now() - 172800000),
        priority: 'low'
      },
      {
        id: 'student-3',
        name: 'David Chen',
        rollNo: '1003',
        performance: 65,
        attendance: 76,
        behaviorScore: 72,
        recentActivity: 'Missed last two classes',
        parentContact: {
          name: 'Lisa Chen',
          phone: '+1234567892',
          email: 'lisa.chen@email.com'
        },
        tags: ['attendance_concern', 'needs_motivation'],
        lastInteraction: new Date(Date.now() - 259200000),
        priority: 'high',
        notes: 'Recent drop in engagement, family situation may be affecting performance'
      }
    ];

    const mockGroups: Group[] = [
      {
        id: 'group-1',
        name: 'Math Excellence',
        students: ['student-1'],
        color: 'bg-blue-100 border-blue-300',
        created: new Date()
      },
      {
        id: 'group-2',
        name: 'Needs Support',
        students: ['student-3'],
        color: 'bg-red-100 border-red-300',
        created: new Date()
      }
    ];

    setStudents(mockStudents);
    setGroups(mockGroups);
  }, []);

  // Quick Actions with keyboard shortcuts
  const quickActions: QuickAction[] = [
    {
      id: 'contact_parent',
      label: 'Contact Parent',
      icon: Phone,
      shortcut: 'Cmd+P',
      action: (student) => console.log('Contacting parent of', student?.name),
      contextual: true
    },
    {
      id: 'schedule_meeting',
      label: 'Schedule Meeting',
      icon: Calendar,
      shortcut: 'Cmd+M',
      action: (student) => console.log('Scheduling meeting with', student?.name)
    },
    {
      id: 'add_note',
      label: 'Add Note',
      icon: Edit3,
      shortcut: 'Cmd+N',
      action: (student) => console.log('Adding note for', student?.name)
    },
    {
      id: 'view_details',
      label: 'View Details',
      icon: Eye,
      shortcut: 'Cmd+D',
      action: (student) => console.log('Viewing details for', student?.name)
    },
    {
      id: 'assign_task',
      label: 'Assign Task',
      icon: BookOpen,
      shortcut: 'Cmd+T',
      action: (student) => console.log('Assigning task to', student?.name)
    }
  ];

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowShortcuts(!showShortcuts);
      }
      
      if (selectedStudents.length > 0) {
        const action = quickActions.find(a => {
          const keys = a.shortcut.toLowerCase().split('+');
          const isCmd = (e.metaKey || e.ctrlKey) && keys.includes('cmd');
          const isKey = keys.includes(e.key.toLowerCase());
          return isCmd && isKey;
        });
        
        if (action) {
          e.preventDefault();
          const student = students.find(s => s.id === selectedStudents[0]);
          action.action(student);
        }
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [selectedStudents, students, showShortcuts, quickActions]);

  // Drag and Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, item: DragItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDropZoneActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDropZoneActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetGroupId?: string) => {
    e.preventDefault();
    setIsDropZoneActive(false);
    
    if (!draggedItem) return;

    if (draggedItem.type === 'student' && targetGroupId) {
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === targetGroupId 
            ? { ...group, students: [...group.students, draggedItem.id] }
            : { ...group, students: group.students.filter(id => id !== draggedItem.id) }
        )
      );
    }
    
    setDraggedItem(null);
  }, [draggedItem]);

  // Context menu handler
  const handleContextMenu = useCallback((e: React.MouseEvent, student: Student) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, student });
  }, []);

  // Close context menu
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNo.includes(searchTerm);
    
    const matchesFilter = filterBy === 'all' ||
                         (filterBy === 'high_priority' && student.priority === 'high') ||
                         (filterBy === 'needs_attention' && (student.attendance < 80 || student.performance < 70)) ||
                         (filterBy === 'recent' && Date.now() - student.lastInteraction.getTime() < 86400000);
    
    return matchesSearch && matchesFilter;
  });

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="stats-card p-8">
      {/* Header with Enhanced Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl shadow-lg">
            <GripVertical className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-neutral-900">
              Enhanced Student Management
            </h2>
            <p className="text-neutral-600">
              Drag, drop, and interact with smart contextual actions
            </p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 
                       focus:ring-indigo-500/20 focus:border-indigo-300 transition-all w-64"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          </div>
          
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 
                     focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
          >
            <option value="all">All Students</option>
            <option value="high_priority">High Priority</option>
            <option value="needs_attention">Needs Attention</option>
            <option value="recent">Recent Activity</option>
          </select>
          
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="p-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
            title="Keyboard Shortcuts (Cmd+K)"
          >
            <Keyboard className="w-4 h-4 text-neutral-600" />
          </button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex items-center gap-2 mb-6 p-4 bg-indigo-50 rounded-xl">
        <Command className="w-4 h-4 text-indigo-600" />
        <span className="text-sm font-medium text-indigo-900">Quick Actions:</span>
        <div className="flex gap-2">
          {quickActions.slice(0, 4).map((action) => (
            <button
              key={action.id}
              onClick={() => action.action()}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-indigo-200 
                       rounded-lg hover:bg-indigo-50 transition-all text-sm font-medium text-indigo-700"
              title={action.shortcut}
            >
              <action.icon className="w-3 h-3" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Students Grid with Drag and Drop */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            draggable
            onDragStart={(e) => handleDragStart(e, { id: student.id, type: 'student', data: student })}
            onContextMenu={(e) => handleContextMenu(e, student)}
            className={`bg-white border border-neutral-200 rounded-xl p-6 cursor-move hover:shadow-lg 
                      transition-all duration-300 group ${
                        selectedStudents.includes(student.id) ? 'ring-2 ring-indigo-500 border-indigo-300' : ''
                      }`}
            onClick={() => {
              if (selectedStudents.includes(student.id)) {
                setSelectedStudents(prev => prev.filter(id => id !== student.id));
              } else {
                setSelectedStudents(prev => [...prev, student.id]);
              }
            }}
          >
            {/* Student Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 
                               rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 group-hover:text-indigo-700">
                    {student.name}
                  </h3>
                  <p className="text-sm text-neutral-500">Roll: {student.rollNo}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {student.priority === 'high' && (
                  <div className="w-2 h-2 bg-red-500 rounded-full" title="High Priority" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContextMenu(e, student);
                  }}
                  className="p-1 hover:bg-neutral-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="w-4 h-4 text-neutral-400" />
                </button>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getPerformanceColor(student.performance)}`}>
                  {student.performance}%
                </div>
                <p className="text-xs text-neutral-500 mt-1">Performance</p>
              </div>
              <div className="text-center">
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getPerformanceColor(student.attendance)}`}>
                  {student.attendance}%
                </div>
                <p className="text-xs text-neutral-500 mt-1">Attendance</p>
              </div>
              <div className="text-center">
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getPerformanceColor(student.behaviorScore)}`}>
                  {student.behaviorScore}%
                </div>
                <p className="text-xs text-neutral-500 mt-1">Behavior</p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {student.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-600 
                                           rounded-md text-xs font-medium">
                  {tag.replace(/_/g, ' ')}
                </span>
              ))}
              {student.tags.length > 2 && (
                <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-md text-xs">
                  +{student.tags.length - 2}
                </span>
              )}
            </div>

            {/* Recent Activity */}
            <p className="text-sm text-neutral-600 mb-3">{student.recentActivity}</p>

            {/* Quick Action Buttons */}
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  quickActions[0].action(student);
                }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 
                         text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
              >
                <Phone className="w-3 h-3" />
                Contact
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  quickActions[3].action(student);
                }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-neutral-100 
                         text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium"
              >
                <Eye className="w-3 h-3" />
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Groups/Drop Zones */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900">Student Groups</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, group.id)}
              className={`${group.color} border-2 border-dashed rounded-xl p-4 min-h-[120px] 
                        transition-all duration-300 ${
                          isDropZoneActive ? 'border-solid shadow-lg scale-105' : ''
                        }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-neutral-900">{group.name}</h4>
                <span className="text-sm text-neutral-600">
                  {group.students.length} student{group.students.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="space-y-2">
                {group.students.map((studentId) => {
                  const student = students.find(s => s.id === studentId);
                  return student ? (
                    <div key={studentId} className="flex items-center gap-2 bg-white/50 rounded-lg p-2">
                      <div className="w-6 h-6 bg-neutral-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-neutral-700">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-neutral-800">{student.name}</span>
                    </div>
                  ) : null;
                })}
                
                {group.students.length === 0 && (
                  <div className="text-center py-4 text-neutral-500">
                    <UserPlus className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm">Drag students here</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Add New Group */}
          <div className="border-2 border-dashed border-neutral-300 rounded-xl p-4 min-h-[120px] 
                         flex items-center justify-center cursor-pointer hover:border-indigo-400 
                         hover:bg-indigo-50 transition-all">
            <div className="text-center">
              <Plus className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-neutral-600">Create New Group</p>
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white border border-neutral-200 rounded-xl shadow-xl py-2 z-50 min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                action.action(contextMenu.student);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 
                       hover:bg-neutral-50 transition-colors"
            >
              <action.icon className="w-4 h-4" />
              {action.label}
              <span className="ml-auto text-xs text-neutral-500">{action.shortcut}</span>
            </button>
          ))}
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="text-xl font-display font-bold text-neutral-900">
                Keyboard Shortcuts
              </h3>
            </div>
            
            <div className="p-6 space-y-3">
              {quickActions.map((action) => (
                <div key={action.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <action.icon className="w-4 h-4 text-neutral-600" />
                    <span className="text-sm text-neutral-900">{action.label}</span>
                  </div>
                  <span className="px-2 py-1 bg-neutral-100 rounded text-xs font-mono text-neutral-600">
                    {action.shortcut}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t border-neutral-200">
              <button
                onClick={() => setShowShortcuts(false)}
                className="w-full btn-primary"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedInteractions;
