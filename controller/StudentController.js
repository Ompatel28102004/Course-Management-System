import Student from "../model/StudentModel.js"; 
import Attendance from "../model/AttendanceModel.js";
import Course from "../model/CourseModel.js";
import Approval from "../model/ApprovalModel.js";
import Fee from "../model/FeesModel.js";
import Result from "../model/ResultModel.js";
import Assignment from "../model/AssignmentModel.js"
import {uploadFile} from "../cloudinary_files.js";
import mongoose from "mongoose";
import fetch from 'node-fetch'; 
import Feedback from '../model/feedbackModel.js'
import Question from "../model/FeedbackQuestionModel.js"
import courseExam from '../model/QuizModel.js';
import questionBank from '../model/QuestionBankModel.js';
import result from '../model/QuizResultModel.js';
import Exam from "../model/ExamDetailsModel.js";

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


export const getUpcomingEvaluations = async (req, res) => {
    try {
        const { semester } = req.query;

        // Fetch all exam details for the specified semester
        const upcomingEvaluations = await Exam.find({ semester: parseInt(semester) });

        return res.status(200).json({
            success: true,
            upcomingEvaluations: upcomingEvaluations
        });
    } catch (error) {
        console.error("Error fetching upcoming evaluations:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};


export const getUpcomingQuizzes = async (req, res) => {
    try {
        const { semester } = req.query;
        const today = new Date();

        // Lookup courses based on the semester
        const courses = await Course.find({ semester: parseInt(semester) });

        if (!courses || courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No courses found for the given semester'
            });
        }

        // Collect course IDs
        const courseIds = courses.map(course => course.courseID);

        // Lookup exams for those courses where the date is greater than today's date
        const upcomingQuizzesCount = await courseExam.aggregate([
            { $match: { courseId: { $in: courseIds } } },
            { $unwind: "$exam" },
            { $match: { "exam.date": { $gt: today } } },
            { $count: "totalUpcomingQuizzes" }
        ]);

        const totalUpcomingQuizzes = upcomingQuizzesCount.length > 0 ? upcomingQuizzesCount[0].totalUpcomingQuizzes : 0;

        return res.status(200).json({
            success: true,
            totalUpcomingQuizzes: totalUpcomingQuizzes
        });
    } catch (error) {
        console.error("Error fetching upcoming quizzes:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
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
      facultyId: course.courseInstructorID,
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
    const { id } = req.params; 
    const { userId, status, transactionId, invoiceId } = req.body;
    console.log("Id",id)
    console.log("userId",userId)
    console.log("TransactionId",transactionId)
    console.log("invoiceId",invoiceId)
    if (!["pending", "paid", "overdue", "waived"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be pending, paid, overdue, or waived.",
      });
    }

    const studentFees = await Fee.findOne({ studentId: userId });
    if (!studentFees) {
      return res.status(404).json({ message: "Student fee record not found" });
    }
    console.log(studentFees.semesters[0])
    const semester = studentFees.semesters.find((sem) => sem._id == id);
    console.log("semester",semester)
    if (!semester) {
      return res.status(404).json({ message: "Semester fee record not found" });
    }

    semester.status = status;

    if (status === "paid") {
      semester.paidAt = new Date();
      semester.transactionId = transactionId;
      semester.invoiceId = invoiceId;
    }

    await studentFees.save();

    res.json({ message: "Fee status updated successfully", semester });
  } catch (error) {
    res.status(500).json({ message: "Error updating fee status", error: error.message });
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
    const attendanceRecord = await Attendance.findOne({ courseRefID: courseRefID });

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
      if (attendanceRecord && attendanceRecord.studentID === numericUserId) {
        return {
          date: dateRecord.date,
          attendanceType: dateRecord.attendanceType, 
          status: attendanceRecord.status
        };
      }
      else {
        return {
          date: "",
          attendanceType: "", 
          status: ""
        };
      }
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
    const { enrollment } = req.query;
    const IntEnrollment = parseInt(enrollment, 10);

    if (isNaN(IntEnrollment)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment number",
      });
    }

    const attendanceRecords = await Attendance.find({
      "enrolledStudents.studentID": IntEnrollment,
    });

    const courses = [];
    for (const record of attendanceRecords) {
      const courseInfo = await Course.findById(record.courseRefID).select(
        "courseID courseName"
      );
      if (courseInfo) {
        courses.push({
          RefID: record.courseRefID.toString(),
          Course_Id: courseInfo.courseID,
          Course_Name: courseInfo.courseName,
        });
      }
    }

    const courseIds = courses.map((course) => course.Course_Id);
    const assignments = await Assignment.find({
      courseId: { $in: courseIds },
    }).sort({ "assignments.dueDate": 1 });

    const assignmentsWithSubmissions = assignments.map((assignment) => {
      const courseAssignments = assignment.assignments.map((a) => {
        const submission = a.submissions.find(
          (sub) => sub.studentId === IntEnrollment
        );
        return {
          ...a.toObject(),
          submissions: submission ? [submission] : [],
        };
      });
      return {
        courseId: assignment.courseId,
        assignments: courseAssignments,
      };
    });

    res.json({
      success: true,
      data: assignmentsWithSubmissions,
    });
  } catch (error) {
    console.error("Error fetching assignments:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching assignments",
      error: error.message,
    });
  }
};


export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { enrollment, courseId } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const upload = await uploadFile(req.file.path);

    const student = await Student.findOne({ enrollment: parseInt(enrollment, 10) });
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const assignment = await Assignment.findOne({
      courseId: courseId,
      "assignments._id": new mongoose.Types.ObjectId(assignmentId),
    });

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    const targetAssignment = assignment.assignments.find(
      (a) => a._id.toString() === assignmentId
    );

    if (!targetAssignment) {
      return res
        .status(404)
        .json({ success: false, message: "Specific assignment not found" });
    }

    const isLate = new Date() > targetAssignment.dueDate;

    const submission = {
      studentId: student.enrollment,
      submissionDate: new Date(),
      attachmentUrlStudent: upload.secure_url,
      isLate,
    };

    const existingSubmissionIndex = targetAssignment.submissions.findIndex(
      (sub) => sub.studentId === student.enrollment
    );

    if (existingSubmissionIndex !== -1) {
      targetAssignment.submissions[existingSubmissionIndex] = submission;
    } else {
      targetAssignment.submissions.push(submission);
    }

    await assignment.save();

    const deadlineIndex = student.UpcomingDeadlines.findIndex(
      (deadline) =>
        deadline.heading === targetAssignment.title &&
        deadline.date.toDateString() === targetAssignment.dueDate.toDateString()
    );
    if (deadlineIndex !== -1) {
      student.UpcomingDeadlines.splice(deadlineIndex, 1);
      await student.save();
    }

    res.status(201).json({
      success: true,
      message: "Assignment submitted successfully",
      data: { submission },
    });
  } catch (error) {
    console.error("Assignment submission error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error submitting assignment",
      error: error.message,
    });
  }
};



export const downloadFile = async (req, res) => {
  const { fileUrl } = req.query;

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

    // Get the file content as a buffer
    const buffer = await response.arrayBuffer();

    // Send the buffer as the file response
    res.send(buffer);

  } catch (error) {
    console.error('Download failed:', error);
    res.status(500).json({ success: false, message: 'Failed to download the file', error: error.message });
  }
};



export const getCourseDataForFeedback = async (req, res) => {
  try {
    const { userId } = req.query;
    const student = await Student.findOne({ enrollment: userId });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const attendanceRecords = await Attendance.find({
      "enrolledStudents.studentID": student.enrollment,
    });

    const courses = [];
    for (const record of attendanceRecords) {
      const courseInfo = await Course.findById(record.courseRefID).select(
        "courseID courseName courseInstructorName"
      );

      // Check if the course has an active feedback
      const feedback = await Feedback.findOne({ courseID: courseInfo.courseID });

      if (courseInfo && feedback && feedback.isActive) {
        // Check if the student has already submitted responses for this feedback
        const hasResponded = feedback.responses.some(response => response.studentID === student.enrollment);

        if (!hasResponded) {
          const feedbackData = {
            courseId: courseInfo.courseID,
            courseName: courseInfo.courseName,
            facultyName: courseInfo.courseInstructorName,
            feedbackID: feedback.feedbackID,
            feedbackName: feedback.feedbackName,
            questions: feedback.questions, // Assuming questions array contains the question details
          };

          // Optionally, you can format the questions if necessary (e.g., retrieving detailed question text)
          const formattedQuestions = await Promise.all(
            feedback.questions.map(async (q) => {
              const question = await Question.findById(q.questionID); // Assuming questions are in Question model
              return {
                questionID: question.questionID,
                questionText: question.questionText,
                responseType: question.responseType,
              };
            })
          );

          feedbackData.questions = formattedQuestions;

          courses.push(feedbackData);
        }
      }
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching course data for feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getFeedbackQuestions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const feedback = await Feedback.findOne({ courseID: courseId, isActive: true });
    console.log(feedback)
    if (!feedback) {
      return res.status(404).json({ message: 'No active feedback found for this course' });
    }

    const questions = await Question.find({ 
      _id: { $in: feedback.questions.map(q => q.questionID) },
      isActive: true
    });
    console.log(questions)
    const formattedQuestions = questions.map(q => ({
      questionId: q.questionID,
      questionText: q.questionText,
      responseType: q.responseType
    }));

    res.status(200).json(formattedQuestions);
  } catch (error) {
    console.error('Error fetching feedback questions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const { courseId, studentId, responses } = req.body;
    console.log('Received feedback submission:', { courseId, studentId, responses });

    // Check if the required fields are provided
    if (!courseId || !studentId || !responses || !Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({ message: 'Missing or invalid required fields' });
    }

    // Fetch active feedback for the course
    const feedback = await Feedback.findOne({ courseID: courseId, isActive: true });
    if (!feedback) {
      return res.status(404).json({ message: 'No active feedback found for this course' });
    }

    // Check if student has already submitted feedback
    const existingResponse = feedback.responses.find(r => r.studentID === studentId);
    if (existingResponse) {
      return res.status(400).json({ message: 'You have already submitted feedback for this course' });
    }

    // Fetch active questions for the feedback
    const activeQuestions = await Question.find({ 
      questionID: { $in: feedback.questions.map(q => q.questionID) },
      isActive: true
    });
  
    // Extract valid question IDs
    const validQuestionIds = activeQuestions.map(q => q.questionID);

    // Validate the response structure
    const studentResponse = responses.find(r => r.studentID === studentId);  // Assuming each student has their own response
    if (!studentResponse || !Array.isArray(studentResponse.answers)) {
      return res.status(400).json({ message: 'Invalid response structure' });
    }

    // Validate the responses against the question IDs
    const invalidResponses = studentResponse.answers.filter(r => validQuestionIds.includes(r.questionID));
    if (invalidResponses.length > 0) {
      return res.status(400).json({ 
        message: 'Invalid question IDs in responses', 
        invalidQuestions: invalidResponses.map(r => r.questionID) 
      });
    }

    // Check if all required questions are answered
    const missingResponses = validQuestionIds.filter(id => 
      !studentResponse.answers.some(r => r.questionID === id)
    );
    if (missingResponses.length > 0) {
      return res.status(400).json({ 
        message: 'Missing responses for some questions', 
        missingQuestions: missingResponses 
      });
    }

    // Add the new response to the feedback
    feedback.responses.push({
      studentID: studentId,
      answers: studentResponse.answers.map(r => ({
        questionID: r.questionID,
        response: r.response
      }))
    });

    // Save the feedback
    await feedback.save();

    res.status(200).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


//Quiz
// controllers/quizController.js

export const getCourseForQuiz = async (req, res) => {
  const { userId } = req.params;
  try {
    const enrolledCourses = await Attendance.find({
      "enrolledStudents.studentID": parseInt(userId),
    });

    if (!enrolledCourses || enrolledCourses.length === 0) {
      return res.status(404).json({ message: 'No courses found for this student' });
    }

    const courses = await Promise.all(enrolledCourses.map(async (record) => {
      const course = await Course.findById(record.courseRefID);
      return course ? { courseName: course.courseName, courseId: course.courseID } : null;
    }));

    const filteredCourses = courses.filter(course => course !== null);
    res.status(200).json(filteredCourses);
  } catch (error) {
    console.error('Error fetching enrolled courses for quiz:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getQuizForCourse = async (req, res) => {
  const { courseId } = req.params;
  const { userId } = req.query;
  try {
    const course = await courseExam.findOne({ courseId });
    if (!course || course.exam.length === 0) {
      return res.status(404).json({ message: 'No quizzes found for this course' });
    }

    const quizzes = await Promise.all(course.exam.map(async (quiz) => {
      const response = {
        examId: quiz.examId,
        examName: quiz.examName,
        isPublished: quiz.isPublished,
        date: quiz.date,
        totalMarks: quiz.totalMarks,
        duration: quiz.duration,
        examGuidelines: quiz.examGuidelines
      };

      if (quiz.isPublished) {
        const studentResult = await result.findOne({
          courseId,
          'parinam.examId': quiz.examId,
          'parinam.results.studentId': parseInt(userId)
        });

        if (studentResult) {
          const examResult = studentResult.parinam.find(exam => exam.examId === quiz.examId);
          const userResult = examResult.results.find(r => r.studentId == parseInt(userId));
          response.alreadyTaken = true;
          response.result = {
            marks: userResult.marks,
            remarks: userResult.remarks
          };
        } else {
          response.alreadyTaken = false;
          response.questions = await Promise.all(quiz.questions.map(async (q) => {
            const fullQuestion = await questionBank.findOne(
              { 'Bank.questionId': q.questionRefId },
              { 'Bank.$': 1 }
            );
            return {
              questionId: fullQuestion.Bank[0].questionId,
              questionText: fullQuestion.Bank[0].questionText,
              options: fullQuestion.Bank[0].options,
              marks: q.marks
            };
          }));
        }
      }

      return response;
    }));

    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const submitQuiz = async (req, res) => {
  const { courseId } = req.params;
  const { userId, examId, answers } = req.body;

  try {
    const course = await courseExam.findOne({ courseId });
    if (!course || !course.exam || course.exam.length === 0) {
      return res.status(404).json({ message: 'No quizzes found for this course' });
    }

    const quiz = course.exam.find(exam => exam.examId === examId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let totalScore = 0;

    // Scoring logic
    for (const [questionId, userAnswer] of Object.entries(answers)) {
      const question = quiz.questions.find(q => q.questionRefId.toString() === questionId);
      if (question) {
        const fullQuestion = await questionBank.findOne(
          { 'Bank.questionId': question.questionRefId },
          { 'Bank.$': 1 }
        );
        
        if (fullQuestion && fullQuestion.Bank && fullQuestion.Bank.length > 0) {
          const correctAnswers = fullQuestion.Bank[0].options
            .filter(option => option.isCorrect)
            .map(option => option.text);

          const userAnswerArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
          const sortedUserAnswer = userAnswerArray.sort();
          const sortedCorrectAnswers = correctAnswers.sort();

          if (JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswers)) {
            totalScore += question.marks || 0;
          }
        }
      }
    }

    const scorePercentage = quiz.totalMarks > 0 
      ? (totalScore / quiz.totalMarks) * 100 
      : 0;

    let remarks = '';
    if (scorePercentage >= 90) remarks = 'Excellent';
    else if (scorePercentage >= 80) remarks = 'Very Good';
    else if (scorePercentage >= 70) remarks = 'Good';
    else if (scorePercentage >= 60) remarks = 'Satisfactory';
    else remarks = 'Needs Improvement';

    // Find existing result or create new
    let existingResult = await result.findOne({ courseId });

    if (existingResult) {
      // Check if this specific exam already exists
      const examIndex = existingResult.parinam.findIndex(
        exam => exam.examId === quiz.examId
      );

      if (examIndex !== -1) {
        // Update existing exam results
        await result.findOneAndUpdate(
          { 
            courseId, 
            'parinam.examId': quiz.examId 
          },
          { 
            $push: {
              [`parinam.${examIndex}.results`]: {
                studentId: parseInt(userId),
                marks: totalScore,
                remarks,
                date: new Date()
              }
            }
          }
        );
      } else {
        // Add new exam to existing result
        await result.findOneAndUpdate(
          { courseId },
          {
            $push: {
              parinam: {
                examId: quiz.examId,
                examName: quiz.examName,
                date: new Date(),
                results: [{
                  studentId: parseInt(userId),
                  marks: totalScore,
                  remarks,
                  date: new Date()
                }]
              }
            }
          }
        );
      }
    } else {
      // Create new result document
      await result.create({
        courseId,
        parinam: [{
          examId: quiz.examId,
          examName: quiz.examName,
          date: new Date(),
          results: [{
            studentId: parseInt(userId),
            marks: totalScore,
            remarks,
            date: new Date()
          }]
        }]
      });
    }

    // Fetch all test results for this student in this course
    const allResults = await result.aggregate([
      { $match: { courseId } },
      { $unwind: '$parinam' },
      { $unwind: '$parinam.results' },
      { $match: { 'parinam.results.studentId': parseInt(userId) } },
      {
        $project: {
          examName: '$parinam.examName',
          examId: '$parinam.examId',
          marks: '$parinam.results.marks',
          remarks: '$parinam.results.remarks',
          date: '$parinam.results.date'
        }
      }
    ]);

    const formattedResults = allResults.map(exam => ({
      examName: exam.examName,
      marks: exam.marks,
      totalMarks: course.exam.find(e => e.examId === exam.examId)?.totalMarks || 0,
      remarks: exam.remarks,
      date: exam.date
    }));

    res.status(200).json({
      currentQuiz: {
        examName: quiz.examName,
        score: totalScore,
        totalMarks: quiz.totalMarks,
        remarks
      },
      allResults: formattedResults
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Internal server error', errorDetails: error.message });
  }
};


