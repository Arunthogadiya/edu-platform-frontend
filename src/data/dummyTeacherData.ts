export const dummyTeacherData = {
  emails: [
    {
      email: 'teacher@school.edu',
      name: 'Dr. Jane Smith',
      subject: 'Mathematics',
      classes: ['X-A', 'X-B', 'IX-A'],
      department: 'Science',
      stats: {
        classesConducted: 45,
        studentsEnrolled: 120,
        averageAttendance: '92%'
      },
      notifications: [
        {
          id: 1,
          title: 'Staff Meeting',
          description: 'Monthly department meeting scheduled',
          date: '2023-11-22'
        },
        {
          id: 2,
          title: 'Test Submissions',
          description: 'Grade submission deadline approaching',
          date: '2023-11-23'
        }
      ],
      upcomingClasses: [
        {
          class: 'X-A',
          time: '09:00 AM',
          subject: 'Algebra',
          room: '302'
        },
        {
          class: 'IX-A',
          time: '11:00 AM',
          subject: 'Geometry',
          room: '304'
        }
      ]
    }
  ],
  schoolIds: [
    {
      id: 'TCH456',
      name: 'Prof. John Davis',
      subject: 'Physics',
      classes: ['XI-A', 'XI-B', 'XII-A'],
      department: 'Science',
      stats: {
        classesConducted: 38,
        studentsEnrolled: 90,
        averageAttendance: '89%'
      },
      notifications: [
        {
          id: 1,
          title: 'Lab Equipment',
          description: 'New equipment arrival for physics lab',
          date: '2023-11-21'
        }
      ],
      upcomingClasses: [
        {
          class: 'XI-A',
          time: '10:00 AM',
          subject: 'Mechanics',
          room: '401'
        }
      ]
    }
  ]
};

// Mock student data
export const mockStudents = [
  {
    id: "S001",
    name: "Alex Johnson",
    grade: "X-A",
    grades: {
      mathematics: 85,
      english: 78,
      science: 90
    },
    attendance: 0.92,
    submissions: {
      pending: 2,
      completed: 15
    },
    behavior: [
      { type: 'positive', category: 'leadership', description: 'Led group project effectively', date: '2024-01-15' },
      { type: 'positive', category: 'teamwork', description: 'Helped classmates with assignments', date: '2024-01-10' }
    ]
  },
  {
    id: "S002",
    name: "Emma Davis",
    grade: "X-A",
    grades: {
      mathematics: 92,
      english: 88,
      science: 85
    },
    attendance: 0.95,
    submissions: {
      pending: 1,
      completed: 16
    },
    behavior: [
      { type: 'positive', category: 'engagement', description: 'Active class participation', date: '2024-01-14' }
    ]
  },
  {
    id: "S003",
    name: "Michael Wilson",
    grade: "X-B",
    grades: {
      mathematics: 72,
      english: 85,
      science: 78
    },
    attendance: 0.88,
    submissions: {
      pending: 3,
      completed: 14
    },
    behavior: [
      { type: 'negative', category: 'discipline', description: 'Talking during class', date: '2024-01-13' },
      { type: 'positive', category: 'teamwork', description: 'Good collaboration in lab work', date: '2024-01-15' }
    ]
  }
];

// Mock attendance data
export const mockAttendanceRecords = [
  {
    date: "2024-01-15",
    records: [
      { studentId: "S001", name: "Alex Johnson", status: "present" },
      { studentId: "S002", name: "Emma Davis", status: "present" },
      { studentId: "S003", name: "Michael Wilson", status: "late" }
    ]
  },
  {
    date: "2024-01-14",
    records: [
      { studentId: "S001", name: "Alex Johnson", status: "present" },
      { studentId: "S002", name: "Emma Davis", status: "present" },
      { studentId: "S003", name: "Michael Wilson", status: "absent" }
    ]
  }
];

// Mock leave requests
export const mockLeaveRequests = [
  {
    id: "L001",
    studentId: "S001",
    studentName: "Alex Johnson",
    startDate: "2024-01-20",
    endDate: "2024-01-22",
    reason: "Family event",
    status: "pending"
  },
  {
    id: "L002",
    studentId: "S003",
    studentName: "Michael Wilson",
    startDate: "2024-01-25",
    endDate: "2024-01-26",
    reason: "Medical appointment",
    status: "pending"
  }
];

// Mock messages
export const mockMessages = [
  {
    id: "M001",
    parentId: "P001",
    studentName: "Alex Johnson",
    subject: "Homework Question",
    content: "Questions about today's math assignment",
    timestamp: "2024-01-15T14:30:00",
    status: "unread"
  },
  {
    id: "M002",
    parentId: "P003",
    studentName: "Michael Wilson",
    subject: "Absence Notification",
    content: "Michael will be absent tomorrow due to a doctor's appointment",
    timestamp: "2024-01-14T09:15:00",
    status: "read"
  }
];

// Mock announcements
export const mockAnnouncements = [
  {
    id: "A001",
    title: "Math Test Next Week",
    content: "Chapter 5 & 6 test scheduled for next Thursday",
    date: "2024-01-22",
    targetGrades: ["X-A", "X-B"]
  },
  {
    id: "A002",
    title: "Science Project Deadline",
    content: "Final science projects due next Friday",
    date: "2024-01-26",
    targetGrades: ["X-A", "X-B", "IX-A"]
  }
];

// Mock calendar events
export const mockCalendarEvents = [
  {
    id: "E001",
    title: "Math Test - Grade X",
    type: "test",
    start: "2024-01-22T09:00:00",
    end: "2024-01-22T10:30:00",
    description: "Chapters 5 & 6 Test"
  },
  {
    id: "E002",
    title: "Parent-Teacher Meeting",
    type: "meeting",
    start: "2024-01-25T15:00:00",
    end: "2024-01-25T17:00:00",
    description: "Term 1 Performance Review"
  },
  {
    id: "E003",
    title: "Science Lab - Grade X",
    type: "class",
    start: "2024-01-18T11:00:00",
    end: "2024-01-18T12:30:00",
    description: "Practical experiment session"
  }
];

// Mock learning resources
export const mockResources = [
  {
    id: "R001",
    title: "Algebra Basics",
    type: "material",
    subject: "Mathematics",
    description: "Introduction to algebraic expressions",
    uploadedAt: "2024-01-10T08:00:00",
    url: "https://example.com/resources/algebra-basics.pdf"
  },
  {
    id: "R002",
    title: "Week 3 Assignment",
    type: "assignment",
    subject: "Mathematics",
    description: "Practice problems for Chapter 5",
    uploadedAt: "2024-01-15T10:00:00",
    dueDate: "2024-01-22T23:59:59"
  },
  {
    id: "R003",
    title: "Science Lab Guide",
    type: "material",
    subject: "Science",
    description: "Laboratory safety and procedures",
    uploadedAt: "2024-01-12T09:30:00",
    url: "https://example.com/resources/lab-guide.pdf"
  }
];