export const mockAuthResponses = {
  loginSuccess: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Dummy JWT token
    user_id: 123,
    role: "parent",
    language: "en"
  },
  teacherLoginSuccess: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Dummy JWT token
    user_id: 456,
    role: "teacher",
    language: "en"
  },
  profile: {
    user_id: 123,
    name: "John Doe",
    email: "john@example.com",
    role: "parent",
    children: [
      {
        id: 1,
        name: "Alice Doe",
        grade: "5th",
        section: "A"
      },
      {
        id: 2,
        name: "Bob Doe",
        grade: "3rd",
        section: "B"
      }
    ]
  },
  teacherProfile: {
    user_id: 456,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "teacher",
    subjects: ["Mathematics", "Science"],
    grades: ["5th", "6th"],
    sections: ["A", "B"]
  }
};

export const mockTeacherCredentials = {
  "teacher1@school.com": {
    password: "teacher123",
    userData: {
      id: "T001",
      name: "Dr. Jane Smith",
      email: "teacher1@school.com",
      role: "teacher",
      subject: "Mathematics",
      classes: ["X-A", "X-B", "IX-A"],
      department: "Science",
      stats: {
        classesConducted: 45,
        studentsEnrolled: 120,
        averageAttendance: "92%"
      }
    }
  }
};

export const mockParentCredentials = {
  "parent@example.com": {
    password: "parent123",
    userData: {
      id: "P001",
      name: "John Doe",
      email: "parent@example.com",
      role: "parent",
      studentName: "Alice Doe",
      studentClass: "X-A",
      studentId: "S001"
    }
  }
};