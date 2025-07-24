import { studentApi } from '../services/api/studentApi';

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

// Function to generate random phone number
function generatePhoneNumber(): string {
  const prefixes = ['98', '97', '96', '95', '94', '93', '92', '91', '90', '89'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const remaining = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + remaining;
}

// Function to generate random date of birth (for students aged 10-16)
function generateDateOfBirth(): string {
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - Math.floor(Math.random() * 7) - 10; // Ages 10-16
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1; // Using 28 to avoid month-specific issues
  
  return `${birthYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// Function to generate a random student
function generateRandomStudent(id: number): any {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const studentName = `${firstName} ${lastName}`;
  
  const parentFirstName = parentFirstNames[Math.floor(Math.random() * parentFirstNames.length)];
  const parentName = `${parentFirstName} ${lastName}`;
  
  const gender = genders[Math.floor(Math.random() * genders.length)];
  const classValue = classes[Math.floor(Math.random() * classes.length)];
  const section = sections[Math.floor(Math.random() * sections.length)];
  
  return {
    student_id: (1000 + id).toString(), // Start from 1001, 1002, etc.
    student_name: studentName,
    parent_name: parentName,
    parent_phone: generatePhoneNumber(),
    gender: gender,
    class_value: classValue,
    section: section,
    date_of_birth: generateDateOfBirth()
  };
}

// Function to add students to database
async function addRandomStudents() {
  console.log('Starting to add 10 random students to the database...\n');
  
  const students = [];
  
  // Generate 10 random students
  for (let i = 1; i <= 10; i++) {
    const student = generateRandomStudent(i);
    students.push(student);
    
    console.log(`Generated Student ${i}:`, {
      ID: student.student_id,
      Name: student.student_name,
      Parent: student.parent_name,
      Phone: student.parent_phone,
      Gender: student.gender,
      Class: `${student.class_value}-${student.section}`,
      DOB: student.date_of_birth
    });
  }
  
  console.log('\n--- Adding students to database ---\n');
  
  // Add each student to the database
  for (let i = 0; i < students.length; i++) {
    try {
      console.log(`Adding student ${i + 1}/10: ${students[i].student_name}...`);
      await studentApi.addStudent(students[i]);
      console.log(`✅ Successfully added: ${students[i].student_name}`);
      
      // Add a small delay between requests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Failed to add ${students[i].student_name}:`, error);
    }
  }
  
  console.log('\n🎉 Finished adding random students to the database!');
  console.log('\nYou can now:');
  console.log('1. Check your teacher dashboard to see the new students');
  console.log('2. View attendance, grades, and behavior data');
  console.log('3. Use the data for analysis and testing');
}

// Export the function for use
export { addRandomStudents, generateRandomStudent };
