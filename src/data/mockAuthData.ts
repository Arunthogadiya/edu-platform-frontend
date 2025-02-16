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