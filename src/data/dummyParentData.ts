export const dummyParentData = {
  phones: [
    {
      phone: '9876543210',
      name: 'John Doe',
      studentName: 'Sarah Doe',
      class: 'Class X-A',
      attendance: {
        today: 'Present',
        percentage: '95%',
        lastAbsent: '2023-11-15'
      },
      messages: {
        unread: 2,
        notifications: [
          {
            id: 1,
            title: 'Math Assignment Due',
            description: 'Algebra homework due tomorrow',
            date: '2023-11-20'
          },
          {
            id: 2,
            title: 'Parent-Teacher Meeting',
            description: 'Scheduled for next Monday',
            date: '2023-11-22'
          }
        ]
      },
      academics: {
        currentGrade: 'A',
        recentTests: [
          {
            subject: 'Mathematics',
            score: '92%',
            date: '2023-11-18'
          },
          {
            subject: 'Science',
            score: '88%',
            date: '2023-11-16'
          }
        ]
      }
    }
  ],
  schoolIds: [
    {
      id: 'SCH123',
      name: 'Jane Smith',
      studentName: 'Mike Smith',
      class: 'Class IX-B',
      attendance: {
        today: 'Present',
        percentage: '92%',
        lastAbsent: '2023-11-10'
      },
      messages: {
        unread: 1,
        notifications: [
          {
            id: 1,
            title: 'Science Project Submission',
            description: 'Final project due next week',
            date: '2023-11-21'
          }
        ]
      },
      academics: {
        currentGrade: 'B+',
        recentTests: [
          {
            subject: 'English',
            score: '85%',
            date: '2023-11-17'
          },
          {
            subject: 'History',
            score: '90%',
            date: '2023-11-15'
          }
        ]
      }
    }
  ]
};