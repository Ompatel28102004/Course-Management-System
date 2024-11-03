import Student from "../model/StudentModel.js"; 
import Course from "../model/CourseModel.js";
import Approval from "../model/ApprovalModel.js";
import Fee from "../model/FeesModel.js";
import Result from "../model/ResultModel.js";

// Get Student Data Controller
export const getStudentData = async (req, res) => {
    const { userId } = req.query;
    try {
        // Fetch the student data based on userId (can be enrollment, studentId, etc.)
        const student = await Student.findOne({ enrollment: userId });
        
        if (!student) {
            return res.status(404).json({ message: "Student data not found" });
        }

        res.status(200).json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateStudentData = async (req, res) => {
  const { userId } = req.query; // Extract userId from the request parameters
  const {
    Email,
    Contact,
    Gender,
    AadharNumber,
    GuardianNumber,
    GuardianEmail,
    Address,
  } = req.body; // Extract only the fields that are allowed to be updated

  try {
    // Find the current student data
    const student = await Student.findOne({ enrollment: userId });

    // If the student is not found, return a 404 error
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Create an object to hold only changed fields
    const updatedData = {};
    
    // Compare each field to check if it's different from the existing value
    if (Email && Email !== student.Email) {
      updatedData.Email = Email;
    }
    if (Contact && Contact !== student.Contact) {
      updatedData.Contact = Contact;
    }
    if (Gender && Gender !== student.Gender) {
      updatedData.Gender = Gender;
    }
    if (AadharNumber && AadharNumber !== student.AadharNumber) {
      updatedData.AadharNumber = AadharNumber;
    }
    if (GuardianNumber && GuardianNumber !== student.GuardianNumber) {
      updatedData.GuardianNumber = GuardianNumber;
    }
    if (GuardianEmail && GuardianEmail !== student.GuardianEmail) {
      updatedData.GuardianEmail = GuardianEmail;
    }
    if (Address) {
      updatedData.Address = Address;
    }

    // If no data has changed, return a 400 response
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({ message: "No changes detected" });
    }

    // Update the student with the changed fields
    const updatedStudent = await Student.findOneAndUpdate(
      { enrollment: userId }, // Match the student by their enrollment
      { $set: updatedData }, // Update only the changed fields
      { new: true, runValidators: true } // Return the updated document and run validators
    );

    // Return the updated student data
    res.status(200).json(updatedStudent);
  } catch (error) {
    // Handle any errors that occur during the update process
    console.error("Error updating student data:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};


export const addDeleteDeadline = async (req, res) => {
    const { operation } = req.headers; // Get the operation ('add' or 'delete') from the headers
    const { userId, ...deadline } = req.body; // Extract userId and deadline data from the request body
  
    try {
      // Find the student based on their enrollment or student ID
      const student = await Student.findOne({ enrollment: userId });
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      if (operation === "add") {
        // Add the new deadline to the student's upcoming deadlines
        student.UpcomingDeadlines.push(deadline);
      } else if (operation === "delete") {
        // Find the index of the deadline to be deleted by its ID
        const index = student.UpcomingDeadlines.findIndex(d => d._id.toString() === deadline.id);
        if (index !== -1) {
          // Remove the deadline from the array
          student.UpcomingDeadlines.splice(index, 1);
        } else {
          return res.status(404).json({ message: "Deadline not found" });
        }
      } else {
        return res.status(400).json({ message: "Invalid operation: must be 'add' or 'delete'" });
      }
  
      // Save the updated student data
      await student.save();
      res.status(200).json({ message: `${operation === "add" ? "Added" : "Deleted"} deadline successfully!` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to process the request" });
    }
};

export const getAvailableCourses = async (req, res) => {
  const { semester } = req.query; // Get the semester from request parameters

  try {
    const availableCourses = await Course.find({ semester: semester });

    if (!availableCourses.length) {
      return res.status(404).json({ message: 'No courses found for this semester.' });
    }

    res.status(200).json(availableCourses);
  } catch (error) {
    console.error('Error fetching available courses:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

export const submitSelectedCourses = async (req, res) => {
  const { userId, courses } = req.body;

  try {
    const student = await Student.findOne({ enrollment: userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const approvalRequests = courses.map((course) => ({
      instructor_id: course.courseInstructorID,
      student_first_name: student.FirstName,
      student_last_name: student.LastName,
      student_id: userId,
      dateOfRequest: new Date(),
      course_name: course.courseName,
      course_id: course.courseID,
    }));

    // Save approval requests
    await Approval.insertMany(approvalRequests);

    // Add courses to student's Courses field
    const studentCourses = courses.map((course) => ({
      Course_Id: course.courseID,
      Course_Name: course.courseName,
      faculty_Id: course.courseInstructorID,
      faculty_Name: course.courseInstructorName,
      lectures: 50, // Arbitrary value, ask Om to edit course field in admin
      lectures_attended: 0, // Initial value
      enroll_req_accepted: false, // Enrollment request initially not accepted
    }));

    student.Courses.push(...studentCourses);
    await student.save();

    res.status(200).json({ message: 'Courses submitted for approval.' });
  } catch (error) {
    console.error('Error submitting courses:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

export const getAllFees = async (req, res) => {
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    const studentFees = await Fee.findOne({ studentId: userId });
    
    if (!studentFees) {
      return res.status(404).json({ message: 'No fee records found for this student' });
    }

    const sortedSemesters = studentFees.semesters.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.status(200).json(sortedSemesters);
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ message: 'Error fetching fees', error: error.message });
  }
};

export const updateFeeStatus = async (req, res) => {
  try {
      const { id } = req.params; // Assuming this is the semesterId
      const { userId, status, reason } = req.body;

      if (!['pending', 'paid', 'overdue', 'waived'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be pending, paid, overdue, or waived.' });
      }

      const studentFees = await Fee.findOne({ studentId: userId });
      if (!studentFees) {
        return res.status(404).json({ message: 'Student fee record not found' });
      }

      const semester = studentFees.semesters.find((sem) => sem.semesterId === id);

      if (!semester) {
        return res.status(404).json({ message: 'Semester fee record not found' });
      }

      semester.status = status;

      if (status === 'paid') {
        semester.paidAt = new Date();
      }

      if (reason) {
        semester.remarks = reason;
      }

      await studentFees.save();

      res.json({ message: 'Fee status updated successfully', semester });
  } catch (error) {
    res.status(500).json({ message: 'Error updating fee status', error: error.message });
  }
};

export const genReport = async(req,res) => {

}


export const getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const result = await Result.findOne({ studentId }).lean().exec();

    if (!result) {
      return res.status(404).json({ message: 'No results found for this student' });
    }

    res.status(200).json(result.semesters);
  } catch (error) {
    console.error('Error fetching student results:', error);
    res.status(500).json({ message: 'Error fetching results', error: error.message });
  }
};
