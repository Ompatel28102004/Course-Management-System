import Student from '../model/StudentModel.js';
import User from '../model/UserModel.js';
import Faculty from '../model/facultyModel.js';
import Course from '../model/CourseModel.js';
import Feedback from '../model/feedbackModel.js';
import Question from '../model/FeedbackQuestionModel.js';
import TAModel from '../model/TaModel.js';
import Fees from '../model/FeesModel.js';
import Exam from '../model/ExamDetailsModel.js';
import Attendance from '../model/AttendanceModel.js';
import { hash } from 'bcrypt';
import twilio from 'twilio'; // Import Twilio


const sid = "ACd20c0961e10c674a35238bb1b1e488fa";
const auth_token = "f28213b4ad4f47ca83499349a49e732d";

const twilioClient = twilio(sid, auth_token);

export const Report = async (req, res) => {
  try {
    const { role, ...data } = req.query; // Destructure role and remaining query data
    let reportData;

    const filters = {};  // Initialize an empty object for query filters

    switch (role) {
      case 'student':
        // Apply filters for student role based on query parameters
        if (data) {
          if (data.branch) filters["Academic_info.Branch"] = data.branch;
          if (data.semester) filters["Academic_info.Semester"] = data.semester;
          if (data.degree) filters["Academic_info.Degree"] = data.degree;
        }
        reportData = await Student.find(filters); // Apply filters
        break;

      case 'faculty':
        // Apply filters for faculty role based on query parameters
        if (data) {
          if (data.department) filters["department"] = data.department;
        }
        reportData = await Faculty.find(filters); // Apply filters
        break;

      case 'ta':
        // Apply filters for TA role based on query parameters
        if (data) {
          if (data.teachingSem) filters["teachingSemester"] = data.teachingSem;
          if (data.facultyId) filters["facultyId"] = data.facultyId;
        }
        reportData = await TAModel.find(filters); // Apply filters
        break;

      case 'course':
        // Apply filters for course role based on query parameters
        if (data) {
          if (data.branch) filters["branch"] = data.branch;
          if (data.semester) filters["semester"] = data.semester;
          if (data.department) filters["department"] = data.department;
          if (data.facultyId) filters["courseInstructorID"] = data.facultyId;
        }
        reportData = await Course.find(filters); // Apply filters
        break;

      case 'exam':
        // Apply filters for exam role based on query parameters
        if (data) {
          if (data.branch) filters["branch"] = data.branch;
          if (data.semester) filters["semester"] = data.semester;
          if (data.degree) filters["degree"] = data.degree;
        }
        reportData = await Exam.find(filters); // Apply filters
        break;

      default:
        return res.status(400).json({ message: "Invalid role specified." });
    }

    if (reportData.length === 0) {
      return res.status(404).json({ message: "No data found matching the given filters." });
    }

    // Send response with the retrieved report data
    return res.status(200).json({
      message: `${role} report data retrieved successfully.`,
      data: reportData,
    });
  } catch (error) {
    console.error("Error retrieving report data:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};




export const Overview = async (req, res) => {
  try {
    // Total students
    const totalStudents = await Student.countDocuments();

    // Students by degree
    const studentsByDegree = await Student.aggregate([
      {
        $group: {
          _id: "$Academic_info.Degree", // Correctly reference the degree field
          count: { $sum: 1 }
        }
      }
    ]);

    // Total faculty
    const totalFaculty = await Faculty.countDocuments();

    // Faculty by department
    const facultyByDepartment = await Faculty.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);

    // Total courses
    const totalCourses = await Course.countDocuments();

    // Courses by department
    const coursesByDepartment = await Course.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);

    return res.status(200).json({
      message: "Overview data retrieved successfully",
      data: {
        students: {
          total: totalStudents,
          byDegree: studentsByDegree,
        },
        faculty: {
          total: totalFaculty,
          byDepartment: facultyByDepartment,
        },
        courses: {
          total: totalCourses,
          byDepartment: coursesByDepartment,
        },
      }
    });
  } catch (error) {
    console.error("Error retrieving overview data:", error);
    return res.status(500).send({ message: "Internal Server Error", error });
  }
};

export const UserDetails = async (req, res) => {
  try {
    const user = await User.findOne({ role: "academic-admin" }, {
      user_id: 1,
      role: 1,
      email: 1,
    });

    return res.status(200).json({
      user,
      message: 'user Data retrieved successfully!',
    });
  } catch (error) {
    console.error('Error fetching User:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// Helper function to generate enrollment number
const generateUniqueEnrollmentNumber = async (branchCode, degreeCode) => {
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const prefix = `${currentYear}${currentMonth}${degreeCode}${branchCode}`;

  let increment = 1; // Start from 1
  let enrollmentNumber;

  while (true) {
    // Format the increment with leading zeros (3 digits)
    enrollmentNumber = Number(`${prefix}${increment.toString().padStart(3, '0')}`);

    // Check if this enrollment number already exists
    const exists = await Student.exists({ enrollment: enrollmentNumber });
    if (!exists) {
      break; // Exit loop if the number does not exist
    }
    increment++; // Increment and try again
  }

  return enrollmentNumber; // Return the unique enrollment number
};

// Helper function to generate CollegeEmail
const generateCollegeEmail = (firstName, lastName, branchCode, enroll) => {
  const currentYear = enroll.toString().slice(-2);
  return `${lastName.toLowerCase()}.${firstName.toLowerCase()}.${currentYear}${branchCode}@iitram.ac.in`;
};
// Helper function to generate totalcourses
const generateTotalCourses = (degree, name) => {
  if (degree === "B.Tech") {
    switch (name) {
      case "Computer Engineering":
        return 40;
      case "Mechanical Engineering":
        return 38;
      case "Electrical Engineering":
        return 36;
      case "Civil Engineering":
        return 39;
      default:
        return 0;
    }
  } else if (degree === "M.Tech") {
    switch (name) {
      case "Computer Engineering":
        return 25;
      case "Mechanical Engineering":
        return 22;
      case "Electrical Engineering":
        return 24;
      case "Civil Engineering":
        return 23;
      default:
        return 0;
    }
  } else if (degree === "PhD") {
    switch (name) {
      case "Computer Engineering":
        return 10;
      case "Mechanical Engineering":
        return 8;
      case "Electrical Engineering":
        return 9;
      case "Civil Engineering":
        return 9;
      default:
        return 0;
    }
  } else {
    return 0;
  }
};

const getSemesterFees = (degree, branch) => {
  // Define semester count based on degree
  const semesterCountMapping = {
    "B.Tech": 8, // Example: B.Tech has 8 semesters
    "M.Tech": 4,  // Example: M.Tech has 4 semesters
    "Ph.D": 6,    // Example: Ph.D has 6 semesters
  };

  // Define fee structure based on degree and branch
  const feeMapping = {
    "B.Tech": {
      "Computer Engineering": 42500,
      "Electrical Engineering": 42500,
      "Mechanical Engineering": 42500,
      "Civil Engineering": 42500,
    },
    "M.Tech": {
      "Computer Engineering": 55000,
      "Electrical Engineering": 55000,
      "Mechanical Engineering": 55000,
      "Civil Engineering": 55000,
    },
    "Ph.D": {
      "Computer Engineering": 60000,
      "Electrical Engineering": 60000,
      "Mechanical Engineering": 60000,
      "Civil Engineering": 60000,
    },
  };

  const totalSemesters = semesterCountMapping[degree] || 0;
  const feePerSemester = feeMapping[degree]?.[branch] || 0;

  // Generate semester fees details
  return Array.from({ length: totalSemesters }, (_, index) => ({
    semester: index + 1,
    branch,
    amount: feePerSemester,
    status: "unpaid",
    dueDate: null, // Adjust as necessary for your application logic
  }));
};
// Add student and initialize their fee record
export const addStudent = async (req, res) => {
  try {
    const {
      Email,
      tempPassword,
      Contact,
      image_url,
      FirstName,
      LastName,
      Gender,
      AadharNumber,
      GuardianNumber,
      GuardianEmail,
      Other,
      Academic_info,
      Address
    } = req.body;

    if (!tempPassword) {
      return res.status(400).send({ message: "Temporary password is required." });
    }

    // Check contact number length
    const contactString = Contact.toString();
    if (contactString.length < 10) {
      return res.status(400).send({ message: "Contact number must be exactly 10 digits or more." });
    }

    // Check for existing student by AadharNumber
    const existingStudent = await Student.findOne({ AadharNumber });
    if (existingStudent) {
      return res.status(400).send({ message: "A student with this Aadhar number already exists." });
    }

    // Map branch and degree codes, generate enrollment
    const branchCodeMapping_ENROLL = {
      "Computer Engineering": "400",
      "Electrical Engineering": "300",
      "Mechanical Engineering": "200",
      "Civil Engineering": "100"
    };
    const degreeCodeMapping = {
      "B.Tech": "300",
      "M.Tech": "200",
      "Ph.D": "100"
    };
    const branchCode = branchCodeMapping_ENROLL[Academic_info.Branch];
    if (!branchCode) {
      return res.status(400).send({ message: "Invalid branch provided." });
    }
    const degreeCode = degreeCodeMapping[Academic_info.Degree];
    if (!degreeCode) {
      return res.status(400).send({ message: "Invalid degree provided." });
    }
    const enrollment = await generateUniqueEnrollmentNumber(branchCode, degreeCode);

    // Generate CollegeEmail
    const branchCodeMapping = {
      "Computer Engineering": "co",
      "Electrical Engineering": "e",
      "Mechanical Engineering": "m",
      "Civil Engineering": "c"
    };
    const branchCode_email = branchCodeMapping[Academic_info.Branch];
    const CollegeEmail = generateCollegeEmail(FirstName, LastName, branchCode_email, Academic_info.Enroll_Year);

    // Hash password and create student
    const hashedPassword = await hash(tempPassword, 10);
    const Total_Courses = generateTotalCourses(Academic_info.Degree, Academic_info.Branch);
    const newStudent = await Student.create({
      enrollment,
      FirstName,
      LastName,
      Email,
      image_url,
      CollegeEmail,
      Contact: contactString,
      Gender,
      AadharNumber,
      GuardianNumber,
      GuardianEmail,
      Other: {
        isPhysicalHandicap: Other?.isPhysicalHandicap || false,
        birthPlace: Other?.birthPlace || "",
        AdmissionThrough: Other?.AdmissionThrough || "",
        CasteCategory: Other?.CasteCategory || ""
      },
      Academic_info: {
        Branch: Academic_info?.Branch || "",
        Semester: Academic_info?.Semester || "",
        Degree: Academic_info?.Degree || "B. Tech",
        Total_Courses,
        Enroll_Year: Academic_info?.Enroll_Year || ""
      },
      Address: {
        Addr: Address?.Addr || "",
        City: Address?.City || "",
        State: Address?.State || "",
        Country: Address?.Country || "",
        PinCode: Address?.PinCode || ""
      }
    });

    // Create user credentials
    const newUser = await User.create({
      user_id: enrollment,
      password: hashedPassword,
      role: "student",
      email: CollegeEmail
    });

    const semesterFees = getSemesterFees(Academic_info.Degree, Academic_info.Branch);
    await Fees.create({
      studentId: enrollment,
      semesters: semesterFees
    });

    return res.status(201).json({
      student: {
        enrollment: newStudent.enrollment,
        email: newStudent.Email,
        collegeEmail: newStudent.CollegeEmail,
        name: `${newStudent.FirstName} ${newStudent.LastName}`,
        contactNumber: newStudent.Contact
      },
      user: {
        user_id: newUser.user_id,
        role: newUser.role,
        email: newUser.email
      },
      message: `Student added successfully! with EnrollmentNo: ${newStudent.enrollment} CollegeEmail: ${newStudent.CollegeEmail}`
    });
  } catch (error) {
    console.error("Error adding student:", error);
    return res.status(500).send({ message: "Internal Server Error", error });
  }
};

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    // Find all students and select specific fields
    const students = await Student.find({}, {
      enrollment: 1,            // Enrollment No
      FirstName: 1,             // First Name
      LastName: 1,              // Last Name
      CollegeEmail: 1,                 // Email Id
      Academic_info: 1,         // Academic info to get degree, branch, and semester
      Contact: 1,               // Phone No
    });

    // Map students to the required format
    const formattedStudents = students.map(student => ({
      enrollmentNo: student.enrollment,
      name: `${student.FirstName} ${student.LastName}`,
      CollegeEmail: student.CollegeEmail,
      degree: student.Academic_info.Degree,
      branch: student.Academic_info.Branch,
      semester: student.Academic_info.Semester,
      contactNumber: student.Contact,
    }));

    // Return the list of students
    return res.status(200).json({
      students: formattedStudents,
      message: 'Students retrieved successfully!',
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  const { enrollmentNo } = req.params; // Get enrollment number from request parameters

  try {
    // Delete the student record
    const student = await Student.findOneAndDelete({ enrollment: enrollmentNo });
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Delete the corresponding user record
    const user = await User.findOneAndDelete({ user_id: enrollmentNo });
    if (!user) {
      console.warn(`User entry not found for enrollmentNo: ${enrollmentNo}`);
    }

    // Return success response
    return res.status(200).json({ message: 'Student and corresponding user deleted successfully!' });
  } catch (error) {
    console.error('Error deleting student and user:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// Search student by enrollment number
export const searchStudents = async (req, res) => {
  try {
    const { enrollmentNo, search } = req.query; // Get the enrollment number or search query from the URL

    // Choose which parameter to use
    const enrollmentNumber = enrollmentNo ? Number(enrollmentNo) : (search ? Number(search) : null);

    // Check if enrollmentNumber is a valid number
    if (enrollmentNumber === null || isNaN(enrollmentNumber)) {
      return res.status(400).json({ message: 'Invalid enrollment number. Please provide a valid number.' });
    }

    // Find student based on the enrollment number
    const student = await Student.findOne({ enrollment: enrollmentNumber });

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Return the student details
    return res.status(200).json({
      student,
      message: 'Student retrieved successfully!',
    });
  } catch (error) {
    console.error('Error searching student by enrollment number:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// Edit student
export const editStudent = async (req, res) => {
  try {
    const { enrollmentNo } = req.params; // Get the enrollment number from the URL
    const { tempPassword, image_url, ...otherDetails } = req.body; // Get new details and temp password
    // Check if the student exists
    const student = await Student.findOne({ enrollment: enrollmentNo });
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }


    // If a new tempPassword is provided, hash it
    if (tempPassword) {
      otherDetails.tempPassword = await hash(tempPassword, 10);
    }
    const updateData = { ...otherDetails }
    if (image_url) {
      updateData.image_url = image_url;
    }
    // Update the student details in the database
    const updatedStudent = await Student.findOneAndUpdate(
      { enrollment: enrollmentNo },
      { $set: updateData },
      { new: true, runValidators: true } // Return the updated document
    );

    // Return success response
    return res.status(200).json({
      student: {
        enrollment: updatedStudent.enrollment,
        Email: updatedStudent.Email,
        FirstName: updatedStudent.FirstName,
        LastName: updatedStudent.LastName,
        Contact: updatedStudent.Contact,
      },
      message: 'Student details updated successfully!',
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// Helper function to generate CollegeEmail
const generateFacultyCollegeEmail = (firstName, lastName) => {
  return `${firstName.toLowerCase()}${lastName.toLowerCase()}@iitram.ac.in`;
};

const generateSixDigitPassword = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to generate Faculty Id
const generateUniqueFacultyId = async (departmentCode) => {
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const prefix = `${currentYear}${currentMonth}${departmentCode}`;

  let increment = 1; // Start from 0
  let facultyId;

  while (true) {
    // Format the increment with leading zeros (3 digits)
    facultyId = Number(`${prefix}${increment.toString().padStart(3, '0')}`);

    // Check if this enrollment number already exists
    const exists = await Faculty.exists({ facultyId: facultyId });
    if (!exists) {
      break; // Exit loop if the number does not exist
    }
    increment++; // Increment and try again
  }

  return facultyId; // Return the unique enrollment number
};

// addFaculty
export const addFaculty = async (req, res) => {
  try {
    const { FirstName, LastName, Email, tempPassword, contactNumber, AadharNumber, department, ...otherDetails } = req.body;

    // Check if FirstName and LastName are provided
    if (!FirstName || !LastName) {
      return res.status(400).json({ message: 'FirstName and LastName are required.' });
    }

    // Generate CollegeEmail based on FirstName and LastName
    const CollegeEmail = generateFacultyCollegeEmail(FirstName, LastName);
    const departmentCodeMapping = {
      "Electrical & Computer department": "300",
      "Mechanical department": "200",
      "Civil department": "100"
    };
    const facultyId = await generateUniqueFacultyId(departmentCodeMapping[department]);
    // Check if faculty with the same facultyId, Email, CollegeEmail, or AadharNumber already exists
    const existingFaculty = await Faculty.findOne({
      $or: [{ facultyId }, { Email }, { CollegeEmail }, { AadharNumber }]
    });

    const existingUser = await User.findOne({ email: Email });

    if (existingFaculty || existingUser) {
      return res.status(400).json({ message: 'Faculty with this ID, Email, College Email, or Aadhar already exists.' });
    }

    // Hash the temporary password
    const hashedPassword = await hash(tempPassword, 10);

    // Create new faculty record with CollegeEmail and required fields
    const newFaculty = await Faculty.create({
      ...otherDetails,
      facultyId,
      Email,
      CollegeEmail,  // Include generated CollegeEmail here
      contactNumber,
      AadharNumber,
      FirstName,     // Ensure FirstName is included
      LastName,
      department,
    });
    const securityCode = generateSixDigitPassword();
    // console.log(securityCode);
    const hashedsecurityCode = await hash(securityCode, 10);
    // Create corresponding user entry
    const newUser = await User.create({
      user_id: facultyId,
      password: hashedPassword,
      role: 'faculty',
      securityCode: hashedsecurityCode,
      email: CollegeEmail,  // Use CollegeEmail for user entry
    });

    // Send SMS to the faculty (optional)
    const messageBody = `
        Welcome to StudySync, ${otherDetails.FirstName || ''} ${otherDetails.LastName || ''}!
        Your faculty ID: ${facultyId}
        Email: ${Email}
        Temporary Password: ${tempPassword}
        security Code: ${securityCode}
        Please log in and change your password at your earliest convenience.
      `;

    // Uncomment to send SMS via Twilio
    // await twilioClient.messages
    //   .create({
    //     from: "+18446216868", // Replace with your Twilio phone number
    //     to: contactNumber, 
    //     body: messageBody,
    //   })
    //   .then(() => console.log('Message sent successfully!'))
    //   .catch((err) => console.error('Error sending message:', err));

    // Return success response
    return res.status(201).json({
      faculty: {
        facultyId: newFaculty.facultyId,
        Email: newFaculty.Email,
        FirstName: newFaculty.FirstName,
        LastName: newFaculty.LastName,
        contactNumber: newFaculty.contactNumber,
      },
      user: {
        user_id: newUser.user_id,
        role: newUser.role,
        email: newUser.email,
      },
      message: `Faculty added successfully! with facultyId: ${facultyId} CollegeEmail: ${CollegeEmail}`
    });
  } catch (error) {
    console.error('Error adding faculty:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Retrieve all faculty
export const getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find({}, {
      facultyId: 1,
      FirstName: 1,
      LastName: 1,
      department: 1,
      Email: 1,
      CollegeEmail: 1,
      contactNumber: 1,
      designation: 1,
      salary: 1
    });

    return res.status(200).json({
      faculty,
      message: 'Faculty retrieved successfully!',
    });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// Delete faculty
export const deleteFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const faculty = await Faculty.findOneAndDelete({ facultyId });

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found.' });
    }

    const user = await User.findOneAndDelete({ user_id: facultyId });
    if (!user) {
      console.warn(`User entry not found for facultyId: ${facultyId}`);
    }
    return res.status(200).json({ message: 'Faculty deleted successfully!' });
  } catch (error) {
    console.error('Error deleting faculty and user:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// search faculty
export const searchFaculty = async (req, res) => {
  try {
    const { search } = req.query; // Get the facultyId from query parameters
    console.log({ search })
    // Ensure facultyId is provided and valid
    if (!search || isNaN(Number(search))) {
      return res.status(400).json({
        message: 'Invalid faculty ID. Please provide a valid numeric ID.',
      });
    }

    const facultyId_no = Number(search);

    // Search for faculty by ID
    const faculty = await Faculty.find({ facultyId: facultyId_no });

    if (faculty.length === 0) {
      return res.status(404).json({
        message: 'No faculty found matching the search criteria.',
      });
    }

    return res.status(200).json({
      faculty,
      message: 'Faculty retrieved successfully!',
    });
  } catch (error) {
    console.error('Error searching faculty:', error);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: error.message || error,
    });
  }
};

// Edit faculty
export const editFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { tempPassword, image_url, ...otherDetails } = req.body;
    const faculty = await Faculty.findOne({ facultyId });
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found.' });
    }

    if (tempPassword) {
      otherDetails.tempPassword = await hash(tempPassword, 10);
    }
    const updateData = { ...otherDetails }
    if (image_url) {
      updateData.image_url = image_url;
    }
    const updatedFaculty = await Faculty.findOneAndUpdate(
      { facultyId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      faculty: {
        facultyId: updatedFaculty.facultyId,
        Email: updatedFaculty.Email,
        FirstName: updatedFaculty.FirstName,
        LastName: updatedFaculty.LastName,
        contactNumber: updatedFaculty.contactNumber,
      },
      message: 'Faculty details updated successfully!',
    });
  } catch (error) {
    console.error('Error updating faculty:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// Add TA
export const addTA = async (req, res) => {
  try {
    const { enrollment, facultyId, teachingSemester, teachingCourses, startDate, stipendAmount, endDate } = req.body;

    // Check if the student exists
    const existingStudent = await Student.findOne({ enrollment: enrollment });
    if (!existingStudent) {
      return res.status(404).send({ message: 'Student not found.' });
    }
    // Check if the faculty exists
    const existingFaculty = await Faculty.findOne({ facultyId }); // Ensure facultyId is a string match
    if (!existingFaculty) {
      return res.status(404).send({ message: 'Faculty not found.' });
    }

    // Check if the teaching courses exist
    const existingCourses = await Course.find({ courseID: teachingCourses }); // Updated here

    // Check if all requested courses were found
    if (!existingCourses.length) {
      return res.status(404).send({ message: 'courses not found.' });
    }

    // Check if the student is already a TA
    if (existingStudent.Academic_info.isTA) {
      return res.status(400).send({ message: 'Student is already a TA.' });
    }

    // Create a new TA record
    const newTA = new TAModel({
      enrollment: existingStudent.enrollment,
      facultyId,
      teachingSemester,
      teachingCourses, // Assuming this is an array of course IDs
      startDate,
      endDate, // Set this null until TA ends
      stipendAmount
    });

    await newTA.save();

    if (existingStudent && existingStudent.Academic_info) {
      existingStudent.Academic_info.isTA = true;
      await existingStudent.save();
    }

    // Return success response
    return res.status(200).json({
      message: 'Student updated to TA successfully!',
      ta: {
        enrollmentNo: existingStudent.enrollment,
        emailId: existingStudent.Email,
        name: `${existingStudent.FirstName} ${existingStudent.LastName}`,
        contactNumber: existingStudent.Contact,
        isTA: existingStudent.Academic_info.isTA, // Ensuring isTA is true
      },
    });
  } catch (error) {
    console.error('Error adding TA:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// Delete TA 
export const deleteTA = async (req, res) => {
  try {
    const { enrollment } = req.params;  // Correctly using enrollment
    if (!enrollment) {
      return res.status(400).send({ message: 'Enrollment number is required.' });
    }

    // Find the student by enrollment number with the isTA field
    const existingStudent = await Student.findOne({
      enrollment: Number(enrollment),  // Ensure enrollment is cast to a number if needed
      'Academic_info.isTA': true,
    });
    if (!existingStudent) {
      return res.status(404).send({ message: 'Student not found.' });
    }

    // Find the TA record using the student enrollment number
    const taRecord = await TAModel.findOne({ enrollment: enrollment });

    if (!taRecord) {
      return res.status(404).send({ message: 'TA record not found.' });
    }

    // Remove the TA record
    await TAModel.findByIdAndDelete(taRecord._id);  // Use the TA's _id

    // Set isTA to false in the student record
    existingStudent.Academic_info.isTA = false;
    await existingStudent.save();

    // Optionally update the user's role back to 'student'
    // await User.findOneAndUpdate({ user_id: enrollment }, { role: 'student' });

    return res.status(200).json({
      message: 'TA role removed successfully!',
      ta: {
        enrollment: existingStudent.enrollment,
        emailId: existingStudent.Email,
        name: `${existingStudent.FirstName} ${existingStudent.LastName}`,
        contactNumber: existingStudent.Contact,
        isTA: existingStudent.Academic_info.isTA,  // Ensuring isTA is now false
      },
    });
  } catch (error) {
    console.error('Error removing TA role:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// Search TAs
export const searchTAs = async (req, res) => {
  try {
    const { enrollmentNo, search } = req.query; // Get the enrollment number or search query from the URL
    const enrollmentNumber = enrollmentNo ? Number(enrollmentNo) : (search ? Number(search) : null);

    // Check if enrollmentNumber is a valid number
    if (enrollmentNumber === null || isNaN(enrollmentNumber)) {
      return res.status(400).json({ message: 'Invalid enrollment number. Please provide a valid number.' });
    }

    // Find student based on the enrollment number
    const student = await Student.findOne({ enrollment: enrollmentNumber });

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Create a query to search for TAs
    let query = {
      'Academic_info.isTA': true,

    };

    // Execute the query
    const students = await Student.find({
      'Academic_info.isTA': true,
      enrollment: enrollmentNumber
    }, {
      enrollment: 1,
      FirstName: 1,
      LastName: 1,
      'Academic_info.Branch': 1,
      'Academic_info.Semester': 1,
      Contact: 1,
      CollegeEmail: 1,
      'Academic_info.Degree': 1,
    });


    if (students.length === 0) {
      return res.status(404).json({ message: 'No TAs found matching the search criteria.' });
    }

    const taDetails = [];

    // Use a for...of loop for synchronous iteration
    for (const student of students) {
      try {
        const taModel = await TAModel.findOne({ enrollment: student.enrollment });
        if (!taModel) continue; // Skip if no TA record is found

        // Fetch faculty and course details in parallel
        const [faculty, course] = await Promise.all([
          Faculty.find({ facultyId: taModel.facultyId }),
          Course.find({ courseID: taModel.teachingCourses }),
        ]);
        // Push the TA details into the result array
        taDetails.push({
          enrollment: student.enrollment || '',
          studentName: `${student.FirstName || ''} ${student.LastName || ''}`.trim(),
          studentEmail: student.CollegeEmail || '',
          contactNumber: student.Contact || '',
          semester: student.Academic_info?.Semester || '',
          facultyId: taModel.facultyId || '',
          teachingSemester: taModel.teachingSemester || '',
          startDate: taModel.startDate || '',
          endDate: taModel.endDate || '',
          stipendAmount: taModel.stipendAmount || '',
          teachingCourses: taModel.teachingCourses || '',
        });
      } catch (innerError) {
        console.error(`Error fetching TA details for student: ${student.enrollment}`, innerError);
        // Continue to the next student on error
      }
    }

    // Return the list of TAs
    return res.status(200).json({
      tas: taDetails,
      message: 'TAs retrieved successfully!',
    });
  } catch (error) {
    console.error('Error searching TAs:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// Get All TAs
export const getAllTAs = async (req, res) => {
  try {
    // Find all students who are TAs
    const students = await Student.find(
      { 'Academic_info.isTA': true },
      {
        enrollment: 1,
        FirstName: 1,
        LastName: 1,
        'Academic_info.Branch': 1,
        'Academic_info.Semester': 1,
        Contact: 1,
        CollegeEmail: 1,
        'Academic_info.Degree': 1,
      }
    );
    const taDetails = [];

    // Use a for...of loop for synchronous iteration
    for (const student of students) {
      try {
        const taModel = await TAModel.findOne({ enrollment: Number(student.enrollment) });
        if (!taModel) continue; // Skip if no TA record is found

        // Fetch faculty and course details in parallel
        const [faculty, courses] = await Promise.all([
          Faculty.findOne({ facultyId: taModel.facultyId }), // Faculty ID is number in DB
          Course.find({ courseID: taModel.teachingCourses }), // teachingCourses should be an array
        ]);
        if (faculty || courses) {
          // Push the TA details into the result array
          taDetails.push({
            enrollment: student.enrollment || '',
            studentName: `${student.FirstName || ''} ${student.LastName || ''}`.trim(),
            studentEmail: student.CollegeEmail || '',
            contactNumber: student.Contact || '',
            semester: student.Academic_info?.Semester || '',
            facultyId: taModel.facultyId || '',
            teachingSemester: taModel.teachingSemester || '',
            teachingCourses: courses.map(course => course.courseName).join(', ') || '', // Join course names
          });
        }
      } catch (innerError) {
        console.error(`Error fetching TA details for student: ${student.enrollment}`, innerError);
        // Continue to the next student on error
      }
    }
    // Return the list of TAs
    return res.status(200).json({
      tas: taDetails,
      message: 'TAs retrieved successfully!',
    });
  } catch (error) {
    console.error('Error fetching TAs:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// Edit TA
export const editTA = async (req, res) => {
  try {
    const { enrollment, facultyId, teachingCourses, startDate, stipendAmount, endDate, teachingSemester } = req.body;

    // Check if the student exists and is already a TA
    const existingStudent = await Student.findOne({
      enrollment: enrollment,
      'Academic_info.isTA': true
    });
    if (!existingStudent) {
      return res.status(404).send({ message: 'TA student not found.' });
    }

    // Check if the faculty exists
    const existingFaculty = await Faculty.findOne({ facultyId });
    if (!existingFaculty) {
      return res.status(404).send({ message: 'Faculty not found.' });
    }

    // Check if the teaching courses exist
    const existingCourses = await Course.find({ courseID: teachingCourses }); // Updated here

    // Check if all requested courses were found
    if (!existingCourses.length) {
      return res.status(404).send({ message: 'courses not found.' });
    }

    // Find the TA record
    const taRecord = await TAModel.findOne({ enrollment: enrollment });
    if (!taRecord) {
      return res.status(404).send({ message: 'TA record not found.' });
    }

    // Update the TA record
    taRecord.facultyId = facultyId;
    taRecord.teachingSemester = teachingSemester;
    taRecord.teachingCourses = teachingCourses;
    taRecord.startDate = startDate;
    taRecord.endDate = endDate; // Set to null if not provided
    taRecord.stipendAmount = stipendAmount;

    await taRecord.save();

    return res.status(200).json({
      message: 'TA record updated successfully!',
      ta: {
        enrollmentNo: existingStudent.enrollment,
        emailId: existingStudent.CollegeEmail,
        name: `${existingStudent.FirstName} ${existingStudent.LastName}`,
        contactNumber: existingStudent.Contact,
        facultyId,
        teachingCourses,
        startDate,
        endDate: endDate || 'Not provided',
        stipendAmount,
      },
    });
  } catch (error) {
    console.error('Error updating TA:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// Helper function to generate Course Id
const generateUniqueCourseId = async (departmentCode, semester) => {
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const prefix = `${departmentCode}${currentYear}${semester}`;

  let increment = 1; // Start from 1
  let courseID;

  while (true) {
    // Format the increment with leading zeros (3 digits)
    courseID = `${prefix}${increment.toString().padStart(3, '0')}`;
    // Check if this enrollment number already exists
    const exists = await Course.exists({ courseID: courseID });

    if (!exists) {
      break;
    }
    increment++; // Increment and try again
  }

  return courseID;
};

// Add a new course
export const addCourse = async (req, res) => {
  try {
    const { department, semester, courseInstructorID, courseFile, ...otherDetails } = req.body;
    // Department Code Mapping
    const departmentCodeMapping = {
      "Computer department": "CS",
      "Mechanical department": "ME",
      "Electrical department": "EE",
      "Civil department": "CE",
      "Physics department": "PH",
      "Maths department": "MA",
      "Chemistry department": "CH",
      "Humanities and Social Sciences department": "HS",
    };

    // Semester-to-Year Conversion
    function semesterToYear(semester) {
      if (semester >= 1 && semester <= 2) return 1;
      if (semester >= 3 && semester <= 4) return 2;
      if (semester >= 5 && semester <= 6) return 3;
      if (semester >= 7 && semester <= 8) return 4;
      return "Invalid semester"; // For semesters outside the 1-8 range
    }

    // Generate Unique Course ID
    const courseID = await generateUniqueCourseId(departmentCodeMapping[department], semesterToYear(semester));

    // Check if the course already exists
    const existingCourse = await Course.findOne({ courseID });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course with this Course ID already exists.' });
    }

    // Check if the instructor exists in the Faculty model
    const faculty = await Faculty.findOne({ facultyId: courseInstructorID });
    if (!faculty) {
      return res.status(404).json({ message: 'Instructor not found in the Faculty database.' });
    }

    // Create new course record with additional details
    const newCourse = await Course.create({
      ...otherDetails,
      courseID,
      courseInstructorID,
      department,
      semester,
      pdfUrl: courseFile, // Include PDF URL if provided
      courseInstructorName: `${faculty.FirstName} ${faculty.LastName}`, // Faculty name from Faculty model
    });
    // Create new course record with additional details
    const newAttendance = await Attendance.create({
      courseRefID: newCourse._id,
      enrolledStudents: [],
      dates: [],
    });
    // Return success response with complete course details
    return res.status(201).json({
      course: {
        courseID: newCourse.courseID,
        courseName: newCourse.courseName,
        department: newCourse.department,
        branch: newCourse.branch,
        courseStartDate: newCourse.courseStartDate,
        semester: newCourse.semester,
        courseInstructorID: newCourse.courseInstructorID,
        courseInstructorName: newCourse.courseInstructorName,
        pdfUrl: newCourse.pdfUrl, // Include PDF URL in response
      },
      message: `Course added successfully! with courseID: ${courseID}`
    });
  } catch (error) {
    console.error('Error adding course:', error);
    return res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Retrieve all courses
export const getAllCourses = async (req, res) => {
  try {
    // Find all courses and select specific fields
    const courses = await Course.find({}, {
      courseID: 1,
      courseName: 1,
      department: 1,
      branch: 1,
      courseStartDate: 1,
      semester: 1,
      courseInstructorID: 1,
      courseInstructorName: 1,
      courseCredit: 1,
      pdfUrl: 1,
    });

    // Return the list of courses
    return res.status(200).json({
      courses,
      message: 'Courses retrieved successfully!',
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// Delete a course
export const deleteCourse = async (req, res) => {
  try {
    const { courseID } = req.params;
    // Delete the course record

    const course = await Course.findOneAndDelete({ courseID });
    const attendance = await Attendance.findOneAndDelete({ courseRefID: course._id })
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Return success response
    return res.status(200).json({ message: 'Course deleted successfully!' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// Search courses
export const searchCourses = async (req, res) => {
  try {
    const { search } = req.query; // Get the search query from the URL
    // Create a base query object
    let query = {
      $or: [
        { courseID: { $regex: search, $options: 'i' } },
        { courseName: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { branch: { $regex: search, $options: 'i' } },
        { courseInstructorName: { $regex: search, $options: 'i' } },
      ]
    };

    // Find courses based on the query
    const courses = await Course.find(query);

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found matching the search criteria.' });
    }

    // Return the list of courses
    return res.status(200).json({
      courses,
      message: 'Courses retrieved successfully!',
    });
  } catch (error) {
    console.error('Error searching courses:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};


// Edit course details
export const editCourse = async (req, res) => {
  try {
    const { courseID } = req.params; // Get the course ID from the URL
    const { courseInstructorID, courseFile, ...otherDetails } = req.body; // Get new details excluding courseInstructorID at first

    // Check if the course exists
    const course = await Course.findOne({ courseID });
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // If the courseInstructorID is provided, fetch the instructor's name from the Faculty model
    if (courseInstructorID) {
      const faculty = await Faculty.findOne({ facultyId: courseInstructorID });
      if (!faculty) {
        return res.status(404).json({ message: 'Instructor not found in the Faculty database.' });
      }
      // Update both the instructor ID and name
      otherDetails.courseInstructorID = courseInstructorID;
      otherDetails.courseInstructorName = faculty.name; // Fetch instructor's name from Faculty model
    }

    // Prepare the update object
    const updateData = { ...otherDetails };

    // Only update pdfUrl if courseFile is provided
    if (courseFile) {
      updateData.pdfUrl = courseFile; // Set pdfUrl if courseFile exists
    }

    // Update the course details in the database
    const updatedCourse = await Course.findOneAndUpdate(
      { courseID },
      { $set: updateData },
      { new: true, runValidators: true } // Return the updated document with validation
    );

    // Return success response with updated course details
    return res.status(200).json({
      course: {
        courseID: updatedCourse.courseID,
        courseName: updatedCourse.courseName,
        department: updatedCourse.department,
        branch: updatedCourse.branch,
        courseStartDate: updatedCourse.courseStartDate,
        semester: updatedCourse.semester,
        courseInstructorID: updatedCourse.courseInstructorID,
        courseInstructorName: updatedCourse.courseInstructorName,
        courseCredit: updatedCourse.courseCredit,
        pdfUrl: updatedCourse.pdfUrl, // Include pdfUrl in the response
      },
      message: 'Course details updated successfully!',
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// Common validation function to check courseID and facultyID
const validateCourseAndFaculty = async (courseID, facultyID) => {
  // Check if courseID is valid and exists in the Course collection
  const courseExists = await Course.findOne({ courseID });
  if (!courseExists) {
    return { success: false, message: 'Invalid courseID. Course not found.' };
  }

  // Check if facultyID is valid and exists in the Faculty collection
  const facultyExists = await Faculty.findOne({ facultyId: facultyID });
  if (!facultyExists) {
    return { success: false, message: 'Invalid facultyID. Faculty not found.' };
  }

  // Return success along with course and faculty data
  return { success: true, course: courseExists, faculty: facultyExists };
};

// create a feedback form
export const createFeedback = async (req, res) => {
  const { feedbackName, courseID, departmentID, branch, facultyID, startDateTime, endDateTime } = req.body;

  try {
    const feedbackID = `F${courseID}`
    // Validate courseID and facultyID and fetch details from DB
    const validation = await validateCourseAndFaculty(courseID, facultyID);
    if (!validation.success) {
      return res.status(400).json({ message: validation.message });
    }

    // Check if endDateTime is after startDateTime
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      return res.status(400).json({ message: 'endDateTime must be after startDateTime.' });
    }

    // Fetch all active default questions
    const defaultQuestions = await Question.find({ isActive: true });
    if (!defaultQuestions || defaultQuestions.length === 0) {
      return res.status(400).json({ message: 'No active questions found to add to feedback form.' });
    }

    // Prepare the questions for the feedback form
    const feedbackQuestions = defaultQuestions.map(question => ({
      questionID: question._id,
    }));

    // Create the feedback form with course and faculty names retrieved from the DB
    const newFeedback = new Feedback({
      feedbackID,
      feedbackName,
      courseID,
      courseName: validation.course.courseName,
      departmentID,
      branch,
      facultyID,
      facultyName: `${validation.faculty.FirstName || ''} ${validation.faculty.LastName || ''}`,
      startDateTime,
      endDateTime,
      questions: feedbackQuestions,
    });

    // Save the feedback entity to the database
    const savedFeedback = await newFeedback.save();

    res.status(201).json({
      message: `Feedback form created successfully with FeedbackID:${feedbackID}`,
      feedback: savedFeedback,
    });
  } catch (error) {
    console.error("Error creating feedback form:", error); // Log the error
    res.status(500).json({ message: 'Error creating feedback form', error: error.message });
  }
};

// Retrieve all active feedback forms
export const getActiveFeedback = async (req, res) => {
  try {
    // Find all feedback forms where isActive is true
    const feedbacks = await Feedback.find({ isActive: true }, {
      feedbackID: 1,
      feedbackName: 1,  // Include feedbackName in the response
      courseID: 1,
      courseName: 1,
      departmentID: 1,
      branch: 1,        // Include branch
      facultyID: 1,
      facultyName: 1,
      startDateTime: 1,
      endDateTime: 1,
      isActive: 1       // Optionally include isActive field
    });

    // Return the list of active feedback forms
    return res.status(200).json({
      feedbacks,
      message: 'Active feedback forms retrieved successfully!',
    });
  } catch (error) {
    console.error('Error fetching active feedback forms:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// Retrieve feedback responses by feedback ID
export const getFeedbackResponses = async (req, res) => {
  const { feedbackID } = req.params;  // Get the feedbackID from the request parameters

  try {
    // Find the feedback by feedbackID and populate the responses and associated question data
    const feedback = await Feedback.findOne({ feedbackID })
      .populate('responses.answers.questionID', 'questionText') // Populate the questionText from the Question model
      .lean(); // Use lean() for better performance since we are only reading data

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found.' });
    }

    // Return the feedback with its responses
    return res.status(200).json({
      feedbackID: feedback.feedbackID,
      feedbackName: feedback.feedbackName,
      responses: feedback.responses,
      message: 'Feedback responses retrieved successfully!',
    });
  } catch (error) {
    console.error('Error fetching feedback responses:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// Retrieve all inactive feedback forms
export const getInactiveFeedback = async (req, res) => {
  try {
    // Find all feedback forms where isActive is false
    const feedbacks = await Feedback.find({ isActive: false }, {
      feedbackID: 1,
      feedbackName: 1,  // Include feedbackName in the response
      courseID: 1,
      courseName: 1,
      departmentID: 1,
      branch: 1,        // Include branch
      facultyID: 1,
      facultyName: 1,
      startDateTime: 1,
      endDateTime: 1,
      isActive: 1       // Optionally include isActive field
    });

    // Return the list of inactive feedback forms
    return res.status(200).json({
      feedbacks,
      message: 'Inactive feedback forms retrieved successfully!',
    });
  } catch (error) {
    console.error('Error fetching inactive feedback forms:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// Delete a feedback form
export const deleteFeedback = async (req, res) => {
  try {
    const { feedbackID } = req.params;

    // Delete the feedback form
    const feedback = await Feedback.findOneAndDelete({ feedbackID });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found.' });
    }

    // Return success response
    return res.status(200).json({ message: 'Feedback form deleted successfully!' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// Search feedback forms
export const searchFeedback = async (req, res) => {
  try {
    const { search } = req.query; // Get the search query from the URL

    // Create a base query object for searching across multiple fields
    let query = {
      $or: [
        { feedbackID: { $regex: search, $options: 'i' } },
        { feedbackName: { $regex: search, $options: 'i' } }, // Added feedbackName to search
        { courseID: { $regex: search, $options: 'i' } },
        { courseName: { $regex: search, $options: 'i' } },
        { facultyName: { $regex: search, $options: 'i' } },
        { facultyID: { $regex: search, $options: 'i' } },
      ]
    };

    // Find feedback forms based on the query
    const feedbacks = await Feedback.find(query);

    if (feedbacks.length === 0) {
      return res.status(404).json({ message: 'No feedback forms found matching the search criteria.' });
    }

    // Return the list of feedback forms
    return res.status(200).json({
      feedbacks,
      message: 'Feedback forms retrieved successfully!',
    });
  } catch (error) {
    console.error('Error searching feedback forms:', error);
    return res.status(500).send({ message: 'Internal Server Error', error });
  }
};

// edit feedback forms
export const editFeedback = async (req, res) => {
  const { feedbackID } = req.params;
  const { facultyID, branch, feedbackName, startDateTime, endDateTime, ...otherDetails } = req.body;

  try {
    // Check if the feedback form exists
    const feedback = await Feedback.findOne({ feedbackID });
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback form not found.' });
    }

    // Determine if isActive should be set to true
    let isActive = feedback.isActive; // Start with current isActive value

    // If the facultyID is provided, fetch the new faculty details from the database
    if (facultyID) {
      const validation = await validateCourseAndFaculty(feedback.courseID, facultyID);
      if (!validation.success) {
        return res.status(400).json({ message: validation.message });
      }

      otherDetails.facultyID = facultyID;
      otherDetails.facultyName = validation.faculty.name; // Update facultyName
    }

    // If branch is provided, include it in the update
    if (branch) {
      otherDetails.branch = branch;
    }

    // If feedbackName is provided, include it in the update
    if (feedbackName) {
      otherDetails.feedbackName = feedbackName;
    }

    // Update startDateTime and endDateTime
    let currentDateTime = new Date();

    // Check and update startDateTime
    if (startDateTime) {
      if (new Date(startDateTime) > currentDateTime) {
        isActive = true; // Set isActive to true if startDateTime is in the future
      }
      otherDetails.startDateTime = startDateTime;
    }

    // Check and update endDateTime
    if (endDateTime) {
      if (new Date(endDateTime) > currentDateTime) {
        isActive = true; // Set isActive to true if endDateTime is in the future
      }
      // Validate endDateTime must be after startDateTime
      if (startDateTime && new Date(endDateTime) <= new Date(startDateTime)) {
        return res.status(400).json({ message: 'endDateTime must be after startDateTime.' });
      }
      otherDetails.endDateTime = endDateTime;
    }
    // Fetch all active default questions
    const defaultQuestions = await Question.find({ isActive: true });

    // Prepare the questions for the feedback form
    const feedbackQuestions = defaultQuestions.map(question => ({
      questionID: question._id,
    }));

    // Update the feedback details in the database
    const updatedFeedback = await Feedback.findOneAndUpdate(
      { feedbackID },
      {
        $set: {
          ...otherDetails,
          isActive, // Update isActive status
          lastModified: Date.now(), // Update lastModified to current time
          questions: feedbackQuestions,
        }
      },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      feedback: {
        feedbackID: updatedFeedback.feedbackID,
        feedbackName: updatedFeedback.feedbackName, // Include updated feedbackName
        courseID: updatedFeedback.courseID,
        courseName: updatedFeedback.courseName, // Keep existing courseName
        departmentID: updatedFeedback.departmentID,
        branch: updatedFeedback.branch, // Include updated branch
        facultyID: updatedFeedback.facultyID,
        facultyName: updatedFeedback.facultyName, // Updated facultyName
        startDateTime: updatedFeedback.startDateTime,
        endDateTime: updatedFeedback.endDateTime,
        questions: updatedFeedback.questions,
        submittedOn: updatedFeedback.submittedOn,
        lastModified: updatedFeedback.lastModified, // Include lastModified
      },
      message: 'Feedback form updated successfully!',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating feedback form', error: error.message });
  }
};

// Function to create a new question
export const createQuestion = async (req, res) => {
  const { questionID, questionText, isActive, responseType } = req.body; // Destructure all necessary fields
  try {
    const newQuestion = new Question({
      questionID,
      questionText,
      isActive,
      responseType // Include responseType in the model
    });
    const savedQuestion = await newQuestion.save();

    res.status(201).json({ message: 'Question created successfully', question: savedQuestion });
  } catch (error) {
    res.status(500).json({ message: 'Error creating question', error: error.message });
  }
};

// Function to get all active questions
export const getActiveQuestions = async (req, res) => {
  try {
    const activeQuestions = await Question.find({ isActive: true });
    res.status(200).json(activeQuestions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active questions', error: error.message });
  }
};

// Function to get all inactive questions
export const getInactiveQuestions = async (req, res) => {
  try {
    const inactiveQuestions = await Question.find({ isActive: false });
    res.status(200).json(inactiveQuestions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inactive questions', error: error.message });
  }
};

// Function to edit a question by ID
export const editQuestion = async (req, res) => {
  const { questionID } = req.params; // Get the question ID from the request parameters
  const updateData = req.body; // Get the data to update from the request body

  try {
    // Validate that updateData has necessary fields if needed (optional)
    // Example: if (!updateData.questionText) { return res.status(400).json({ message: 'Question text is required' }); }

    // Find the question by ID and update it
    const updatedQuestion = await Question.findOneAndUpdate(
      { questionID }, // Match by questionID field
      updateData, // Data to update
      { new: true, runValidators: true } // Options
    );

    // Check if the question was found and updated
    if (!updatedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Respond with the updated question
    res.status(200).json({ message: 'Question updated successfully', question: updatedQuestion });
  } catch (error) {
    // Handle any potential errors
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ message: 'Error updating question', error: error.message });
  }
};

// Function to delete a question by ID
export const deleteQuestion = async (req, res) => {
  const { questionID } = req.params;

  try {
    // Use findOneAndDelete to delete by questionID
    const deletedQuestion = await Question.findOneAndDelete({ questionID: questionID }); // Adjusted to use the field name

    if (!deletedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error deleting question', error: error.message });
  }
};

// Function to create a new Exam
export const createExam = async (req, res) => {
  const { ExamName, degree, branch, semester, ExamStartDate } = req.body;

  try {
    const startDate = new Date(ExamStartDate);
    if (isNaN(startDate.getTime())) {
      throw new Error("Invalid ExamStartDate");
    }

    let duration;
    switch (ExamName) {
      case 'Class Test 1':
      case 'Class Test 2':
        duration = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
        break;
      case 'Mid Semester':
        duration = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
        break;
      case 'End Semester':
        duration = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
        break;
      default:
        throw new Error('Unknown exam type');
    }

    const endDate = new Date(startDate.getTime() + duration);

    const newExam = new Exam({
      ExamName,
      degree,
      branch,
      semester,
      ExamStartDate: startDate,
      ExamEndDate: endDate,
    });

    const savedExam = await newExam.save();
    res.status(201).json({ message: 'Exam created successfully', exam: savedExam });
  } catch (error) {
    res.status(500).json({ message: 'Error creating exam', error: error.message });
  }
};

// Function to get all active questions
export const getExam = async (req, res) => {
  try {
    const exam = await Exam.find();
    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active questions', error: error.message });
  }
};

// Function to edit an exam by ID
export const editExam = async (req, res) => {
  const { examID } = req.params; // Get the exam ID from the request parameters
  const updateData = req.body; // Get the data to update from the request body

  try {
    // Fetch the current exam data to access ExamName if not provided in the update
    const currentExam = await Exam.findById(examID);
    if (!currentExam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Determine the exam name to use for duration calculation
    const examName = updateData.ExamName || currentExam.ExamName;

    // Check if the start date is being changed and is valid
    if (updateData.ExamStartDate) {
      const startDate = new Date(updateData.ExamStartDate);
      if (isNaN(startDate.getTime())) {
        throw new Error("Invalid ExamStartDate");
      }

      // Determine duration based on ExamName
      let duration;
      switch (examName) {
        case 'Class Test 1':
        case 'Class Test 2':
          duration = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
          break;
        case 'Mid Semester':
          duration = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
          break;
        case 'End Semester':
          duration = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
          break;
        default:
          throw new Error('Unknown exam type');
      }

      // Calculate and set the new end date based on the updated start date
      const endDate = new Date(startDate.getTime() + duration);
      updateData.ExamEndDate = endDate.toISOString();
    }

    // Update the exam
    const updatedExam = await Exam.findOneAndUpdate(
      { _id: examID },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedExam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.status(200).json({ message: 'Exam updated successfully', exam: updatedExam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating exam', error: error.message });
  }
};

// Function to delete an exam by ID
export const deleteExam = async (req, res) => {
  const { examID } = req.params;

  try {
    // Use findOneAndDelete to delete by examID
    const deletedExam = await Exam.findOneAndDelete({ _id: examID }); // Match by _id field (assuming examID is the unique identifier for the exam document)

    if (!deletedExam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.status(200).json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error deleting exam', error: error.message });
  }
};