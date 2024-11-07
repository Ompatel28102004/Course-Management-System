import Student from "../model/StudentModel.js"; 
import Attendance from "../model/AttendanceModel.js";
import Course from "../model/CourseModel.js";
import Approval from "../model/ApprovalModel.js";
import Fee from "../model/FeesModel.js";
import Result from "../model/ResultModel.js";
import Assignment from "../model/AssignmentModel.js"
import uploadFile from "../cloudinary_files.js";

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

export const getLecturesData = async (req, res) => {
  try {
    const { userId } = req.query;

    // Ensure userId is treated as a long integer
    const numericUserId = Number(userId);

    // Aggregation pipeline
    const data = await Attendance.aggregate([
      {
        $match: {
          "enrolledStudents.studentID": numericUserId, // Filter documents where the student is enrolled
        },
      },
      {
        $project: {
          totalLectures: 1, // Include total lectures for each course
          lecturesTaken: 1, // Include lectures taken for each course
          enrolledStudents: {
            $filter: {
              input: "$enrolledStudents",
              as: "student",
              cond: { $eq: ["$$student.studentID", numericUserId] },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalLectures: { $sum: "$totalLectures" }, // Sum of total lectures for all courses
          lecturesTaken: { $sum: "$lecturesTaken" }, // Sum of lectures taken for all courses
          lecturesAttended: {
            $sum: { $arrayElemAt: ["$enrolledStudents.lecturesAttended", 0] },
          }, // Sum of lectures attended by the student
        },
      },
    ]);

    // Handle case where no matching documents are found
    if (!data.length) {
      return res
        .status(404)
        .json({ message: "No data found for this student." });
    }

    // Extract aggregated data
    const { totalLectures, lecturesTaken, lecturesAttended } = data[0];

    // Send the result back to the client
    res.status(200).json({
      totalLectures,
      lecturesTaken,
      lecturesAttended,
    });
  } catch (error) {
    console.error("Error in fetching lectures data:", error);
    res.status(500).json({ message: "Internal server error." });
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
      const index = student.UpcomingDeadlines.findIndex(
        (d) => d._id.toString() === deadline.id
      );
      if (index !== -1) {
        // Remove the deadline from the array
        student.UpcomingDeadlines.splice(index, 1);
      } else {
        return res.status(404).json({ message: "Deadline not found" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "Invalid operation: must be 'add' or 'delete'" });
    }

    // Save the updated student data
    await student.save();
    res
      .status(200)
      .json({
        message: `${
          operation === "add" ? "Added" : "Deleted"
        } deadline successfully!`,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to process the request" });
  }
};

export const getCourseData = async (req, res) => {
  try {
    const { userId } = req.query;
    const numericUserId = Number(userId);

    // 1. Find the courses where the student is enrolled
    const attendanceRecords = await Attendance.find({
      "enrolledStudents.studentID": numericUserId,
    });

    // 2. Extract and format the required information from the attendance records
    const courses = [];
    for (const record of attendanceRecords) {
      const student = record.enrolledStudents.find(
        (student) => student.studentID === numericUserId
      );

      // Lookup the course information from the Courses collection
      const courseInfo = await Course.findById(record.courseRefID).select(
        "courseID courseName courseInstructorID courseInstructorName"
      );
      if (courseInfo) {
        courses.push({
          RefID: record.courseRefID.toString(),
          Course_Id: courseInfo.courseID,
          Course_Name: courseInfo.courseName,
          faculty_Id: courseInfo.courseInstructorID,
          faculty_Name: courseInfo.courseInstructorName,
          enroll_req_accepted: student.enroll_req_accepted,
        });
      }
    }

    // 3. Find the student's record in the Students collection for CourseCompleted and semester data
    const studentRecord = await Student.findOne({
      enrollment: numericUserId,
    }).select("CourseCompleted FirstName LastName Academic_info.Semester");

    const courseCompleted = studentRecord ? studentRecord.CourseCompleted : [];
    const firstName = studentRecord ? studentRecord.FirstName : "";
    const lastName = studentRecord ? studentRecord.LastName : "";
    const semester =
      studentRecord && studentRecord.Academic_info
        ? studentRecord.Academic_info.Semester
        : null;

    // 4. Respond with the formatted data, including empty arrays if no data is found
    res.status(200).json({
      Courses: courses,
      CourseCompleted: courseCompleted,
      firstName: firstName,
      lastName: lastName,
      Semester: semester,
    });
  } catch (error) {
    console.error("Error in fetching course data:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getAvailableCourses = async (req, res) => {
  const { semester } = req.query; // Get the semester from request parameters

  try {
    const availableCourses = await Course.find({ semester: semester });

    if (!availableCourses.length) {
      return res
        .status(404)
        .json({ message: "No courses found for this semester." });
    }

    res.status(200).json(availableCourses);
  } catch (error) {
    console.error("Error fetching available courses:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const submitSelectedCourses = async (req, res) => {
  const { userId, firstName, lastName, courses } = req.body;

  try {
    // Convert userId to a long integer if necessary
    const numericUserId = Number(userId);

    const student = await Student.findOne({ enrollment: numericUserId });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    for (const course of courses) {
      // Find the course in the Attendance collection
      const attendanceRecord = await Attendance.findOne({
        courseRefID: course._id,
      });

      if (attendanceRecord) {
        // Add student details to the enrolledStudents array
        attendanceRecord.enrolledStudents.push({
          studentID: numericUserId,
          firstName: firstName,
          lastName: lastName,
          enroll_req_accepted: false, // Enrollment request initially not accepted
          lecturesAttended: 0, // Initial value
          lastLecAttended: null, // Initial value
        });

        // Save the updated Attendance record
        await attendanceRecord.save();
      } else {
        console.log(
          `Course with ID ${course._id} not found in Attendance collection`
        );
      }
    }

    const approvalRequests = courses.map((course) => ({
      instructor_id: course.courseInstructorID,
      student_first_name: firstName,
      student_last_name: lastName,
      student_id: userId,
      dateOfRequest: new Date(),
      course_name: course.courseName,
      course_id: course.courseID,
    }));
    
    await Approval.insertMany(approvalRequests);

    res.status(200).json({ message: "Courses submitted successfully." });
  } catch (error) {
    console.error("Error submitting courses:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const getAllFees = async (req, res) => {
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    const studentFees = await Fee.findOne({ studentId: userId });

    if (!studentFees) {
      return res
        .status(404)
        .json({ message: "No fee records found for this student" });
    }

    const sortedSemesters = studentFees.semesters.sort(
      (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
    );

    res.status(200).json(sortedSemesters);
  } catch (error) {
    console.error("Error fetching fees:", error);
    res
      .status(500)
      .json({ message: "Error fetching fees", error: error.message });
  }
};

export const updateFeeStatus = async (req, res) => {
  try {
    const { id } = req.params; // Assuming this is the semesterId
    const { userId, status, reason } = req.body;

    if (!["pending", "paid", "overdue", "waived"].includes(status)) {
      return res
        .status(400)
        .json({
          message: "Invalid status. Must be pending, paid, overdue, or waived.",
        });
    }

    const studentFees = await Fee.findOne({ studentId: userId });
    if (!studentFees) {
      return res.status(404).json({ message: "Student fee record not found" });
    }

    const semester = studentFees.semesters.find((sem) => sem.semesterId === id);

    if (!semester) {
      return res.status(404).json({ message: "Semester fee record not found" });
    }

    semester.status = status;

    if (status === "paid") {
      semester.paidAt = new Date();
    }

    if (reason) {
      semester.remarks = reason;
    }

    await studentFees.save();

    res.json({ message: "Fee status updated successfully", semester });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating fee status", error: error.message });
  }
};

export const getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const result = await Result.findOne({ studentId }).lean().exec();

    if (!result) {
      return res
        .status(404)
        .json({ message: "No results found for this student" });
    }

    res.status(200).json(result.semesters);
  } catch (error) {
    console.error("Error fetching student results:", error);
    res
      .status(500)
      .json({ message: "Error fetching results", error: error.message });
  }
};

export const getStudentAttendance = async (req, res) => {
  try {
    const { RefID, userId } = req.query;
    const courseRefID = RefID;
    const numericUserId = Number(userId);

    // 1. Find the course in the Attendance table
    const attendanceRecord = await Attendance.findOne({ courseID: courseRefID });

    if (!attendanceRecord) {
      return res.status(404).json({ message: "Course not found." });
    }

    // 2. Extract lecturesTaken
    const { lecturesTaken, dates } = attendanceRecord;

    // 3. If no dates are available, return an empty attendance array
    if (!dates || dates.length === 0) {
      return res.status(200).json({
        lecturesTaken,
        attendance: []
      });
    }

    // 4. Fetch attendance details for the given studentID
    const attendance = dates.map(dateRecord => {
      const attendanceRecord = dateRecord.attendanceRecords.find(record => record.studentID === numericUserId);
      return {
        date: dateRecord.date,
        status: attendanceRecord ? attendanceRecord.status : "not recorded"
      };
    });

    // 5. Respond with lecturesTaken and attendance array
    res.status(200).json({
      lecturesTaken,
      attendance
    });
  } catch (error) {
    console.error("Error in fetching student attendance:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Assignments
export const getStudentAssignments = async (req, res) => {
  try {
    const { enrollment } = req.query; // Get enrollment from query parameters
    const IntEnrollment = parseFloat(enrollment); // Parse enrollment

    const student = await Student.findOne({ enrollment: IntEnrollment });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const courseIds = student.Courses.map(course => course.Course_Id);
    const assignments = await Assignment.find({
      courseId: { $in: courseIds }
    }).sort({ dueDate: 1 });

    const assignmentsWithSubmissions = assignments.map(assignment => {
      const submission = assignment.submissions.find(sub => sub.studentId === student.enrollment);
      return {
        ...assignment.toObject(),
        submissions: submission ? [submission] : []
      };
    });

    res.json({
      success: true,
      data: assignmentsWithSubmissions
    });
  } catch (error) {
    console.error("Error fetching assignments:", error.message);
    res.status(500).json({ success: false, message: 'Error fetching assignments', error: error.message });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.body;
    

    console.log("query",req.query)
    console.log("body",req.body)
    if (!req.file) {
      console.log("This is not file found")
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const upload = await uploadFile(req.file.path);

    const assignment = await Assignment.findById(assignmentId);
    console.log(assignment)
    if (!assignment) {
      console.log("This is not assignment found")
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const { enrollment } = req.body; // Get enrollment from query parameters
    const student = await Student.findOne({ enrollment });
    console.log("student",student)
    if (!student) {
      console.log("stu not found ")
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const isLate = new Date() > assignment.dueDate;

    const submission = {
      studentId: student.enrollment,
      submissionDate: new Date(),
      attachmentUrl: upload.secure_url,
      isLate,
    };

    const existingSubmissionIndex = assignment.submissions.findIndex(
      (sub) => sub.studentId === student.enrollment
    );

    if (existingSubmissionIndex !== -1) {
      assignment.submissions[existingSubmissionIndex] = submission;
    } else {
      assignment.submissions.push(submission);
    }

    await assignment.save();

    // Update student's UpcomingDeadlines
    const deadlineIndex = student.UpcomingDeadlines.findIndex(
      (deadline) => deadline.heading === assignment.title
    );
    if (deadlineIndex !== -1) {
      student.UpcomingDeadlines.splice(deadlineIndex, 1);
      await student.save();
    }

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: {
        submission: {
          ...submission,
          _id: assignment.submissions[assignment.submissions.length - 1]._id,
        },
      },
    });
  } catch (error) {
    console.error("Assignment submission error:", error.message);
    res.status(500).json({ success: false, message: 'Error submitting assignment', error: error.message });
  }
};
export const downloadFile = async (req, res) => {
  const { fileUrl } = req.query;
  console.log(req.query)
  if (!fileUrl) {
    return res.status(400).json({ success: false, message: 'File URL is required' });
  }

  try {
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the content type and set it in the response header
    const contentType = response.headers.get('content-type');
    res.setHeader('Content-Type', contentType);

    // Pipe the response to the client
    response.body.pipe(res);

  } catch (error) {
    console.error('Download failed:', error);
    res.status(500).json({ success: false, message: 'Failed to download the file', error: error.message });
  }
};