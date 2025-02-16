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