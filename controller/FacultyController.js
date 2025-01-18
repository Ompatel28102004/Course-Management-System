import expressAsyncHandler from "express-async-handler";
import asyncHandler from "express-async-handler";
import async from "express-async-handler"
import course from "../model/CourseModel.js";
import faculty from "../model/facultyModel.js";
import student from "../model/StudentModel.js";
import Attendance from "../model/AttendanceModel.js";
import QuestionBank from "../model/QuestionBankModel.js";
import CourseExam from "../model/QuizModel.js";
import Result from "../model/QuizResultModel.js";
import Assignment from "../model/AssignmentModel.js";
import Approvals from "../model/ApprovalModel.js";
import {v4 as uuidv4} from "uuid";
import mongoose from "mongoose";
import { uploadFile } from "../cloudinary_files.js";

//It will give all the courses assigned to a faculty based on the facultyId
export const getCoursesAssigned = asyncHandler(async (req, res) => {
    const crs = await course.find({ courseInstructorID: req.params.courseInstructorId});
    
    if(!crs){
        return res.status(404);
        throw new Error("Course assgined not found");
    }
    res.status(200).json(crs);
});

//It will give Course Info based on courseId
export const getCourseInfo = asyncHandler(async (req,res) => {
    const crsInfo = await course.findOne({ courseID: req.params.courseId});

    if(!crsInfo){
        return res.status(404);
        throw new Error("Course not found");
    }
    res.status(200).json(crsInfo);

});

//It gives faculty Info for Profile
export const getFacultyProfile = asyncHandler(async (req,res) => {
    const facultyProfile = await faculty.findOne({facultyId: req.params.facultyId});

    if(!facultyProfile){
        return res.status(404);
        throw new Error("Faculty Info not found");
    }
    res.status(200).json(facultyProfile);
});

//It gives the list of registered students in the course 
export const getRegStudents = asyncHandler(async (req, res) => {
    try {

        const courseID = new mongoose.Types.ObjectId(req.params.courseId);

        const attendanceRecords = await Attendance.find(
            { courseRefID: courseID }).select("enrolledStudents.firstName enrolledStudents.lastName enrolledStudents.studentID");
          
        const students = attendanceRecords.flatMap(record => record.enrolledStudents.map(student => ({
            firstName: student.firstName,
            lastName: student.lastName,
            studentId: student.studentID
        })))
    
        if(students.length == 0){
            return res.status(404);
            throw new Error("No registered students are found");
        }
        res.status(200).json(students);
    } catch (error) {
        console.log("Error getting enrolled Students", error);
        return res.status(500).json({error: "Error getting enrolled Students"});
    }
});

//It gives the attendance report for a particular date
export const getAttenByDate = asyncHandler(async (req, res) => {
    try {
        const { courseId, date } = req.params;
        
        const courseRefID = new mongoose.Types.ObjectId(courseId);
        
        // Check for a valid date format
        const isValidDate = !isNaN(new Date(date).getTime());
        if (!isValidDate) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format. Please use YYYY-MM-DD format"
            });
        }

        // Convert date to start and end of day for comparison
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        // Find attendance record for the specified course and date
        const attendance = await Attendance.findOne(
            { courseRefID }
        );
        
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "No attendance record found for this course"
            });
        }

        // Filter all attendance records for the specified date
        const dateAttendances = attendance.dates.filter(d => {
            const recordDate = new Date(d.date);
            return recordDate >= startDate && recordDate <= endDate;
        });
        
        const attendanceData = {
            enrolledStudents: attendance.enrolledStudents,
            attendanceStudents: {
                _id: attendance._id,
                dates: dateAttendances
            }
        };
        
        return res.status(200).json(attendanceData);
    } catch (error) {
        console.log("Error getting attendance by date", error);
        return res.status(500).json({error: "Error getting attendance by date"});
    }
});

//Posts the attendance records into the DB
export const postAttendance = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const students = req.body.finalStudentArray; // Expecting an array of { studentId, attendanceType, status }

    const courseRefID = new mongoose.Types.ObjectId(courseId);

    // Get today's date without time for consistency
    const today = new Date();
    const formattedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Prepare the attendance data for the new entry
    const attendanceData = {
        date: formattedDate,
        attendanceType: req.body.attendanceType,
        attendanceRecords: students.map(student => ({
            studentID: student.studentID,
            status: student.status
        }))
    };

    // Find the attendance document by courseId
    const attendance = await Attendance.findOne({ courseRefID });

    if (attendance) {
        // If today's date entry does not exist, push a new date entry into the data array
        await Attendance.updateOne(
            { courseRefID },
            { $push: { dates: attendanceData } }
        );
    }
    else {
        // If the document does not exist, create a new one with the attendance data
        const newAttendance = new Attendance({
            courseRefID,
            dates: [attendanceData] // Initialize data as an array with the new entry
        });
        await newAttendance.save();
    }

    res.status(200).json({
        success: true,
        message: "Attendance recorded successfully."
    });
});

//Get all the questions 
export const getQuestions = asyncHandler(async (req, res) => {
    try{
        const { courseId } = req.params;

        if(!courseId) {
            res.status(400).json({error: "Course ID is required"});
        }

        const questions = await QuestionBank.findOne({courseId});

        if(!questions){
            res.status(404).json({error: "No Question Bank for this course ID"});
        }
        res.status(200).json({message: "Questions Retrieved Successfully. ", questions: questions.Bank});
    }catch(error){
        console.error("Error getting questions", error);
        res.status(500).json({ error: "An error occurred while getting the question." }); 
    }
});

//Add the question 
export const addQuestions = asyncHandler(async (req, res) => {
    try{
        const { courseId } = req.params;
        const { questionText, options, marks, tag, year, createdBy } = req.body;

        //validate required fields
        if ( !courseId || !questionText || !options || !marks || !tag || !year || !createdBy){
            res.status(400).json({error: "All fields are required."});
        }

        //Generate the unique question ID
        const questionId = uuidv4();

        const newQuestion = {
            questionId,
            questionText,
            options,
            marks,
            tag,
            year,
            createdBy
        };

        //Check if questionBank exists for the given courseID
        let questionBank = await QuestionBank.findOne({courseId});
        
        if(!questionBank){
            questionBank = new QuestionBank({
                courseId,
                Bank: [newQuestion]
            });
        }
        else{
            questionBank.Bank.push(newQuestion);
        }

        await questionBank.save();

        res.status(201).json({ message: "Question added successfully", question: newQuestion });
    }catch(error){
        console.error("Error adding question:", error);
        res.status(500).json({ error: "An error occurred while adding the question." });
    }
});

//Delete the question
export const deleteQuestion = asyncHandler(async (req, res) => {
    try {
        const { courseId, questionId } = req.params;
        
        if (!courseId || !questionId){
            res.status(400).json({error:"All fields are mandatory."});
        }

        //Using $pull for directly removing the question from Bank
        const result = await QuestionBank.updateOne({courseId}, {$pull: {Bank: {questionId : questionId}}});

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: "Question not found or already deleted." });
        }

        res.status(200).json({
            message: "Question deleted successfully",
            questionId: questionId
        });
    } catch (error) {
        console.error("Error Deleting question:", error);
        res.status(500).json({ error: "An error occurred while deleting the question." }); 
    }
});

//Edit the question
export const editQuestion = asyncHandler(async (req, res) => {
    try {
        const { courseId, questionId } = req.params;
        const { questionText, options, marks, tag, year, createdBy } = req.body;

        // Validate required fields
        if (!courseId || !questionId) {
            return res.status(400).json({ error: "Both courseId and questionId are required." });
        }

        // Find the question bank by courseId
        const questionBankDoc = await QuestionBank.findOne({ courseId });
        if (!questionBankDoc) {
            return res.status(404).json({ error: "Question bank not found." });
        }

        // Find the question to edit
        const question = questionBankDoc.Bank.find(q => q.questionId === questionId);
        if (!question) {
            return res.status(404).json({ error: "Question not found." });
        }

        if (questionText) question.questionText = questionText;
        if (options) question.options = options;
        if (marks) question.marks = marks;
        if (tag) question.tag = tag;
        if (year) question.year = year;
        if (createdBy) question.createdBy = createdBy;

        questionBankDoc.markModified('Bank');
        await questionBankDoc.save();
        
        res.status(200).json({
            message: "Question updated successfully",
            updatedQuestion: question
        });
    } catch (error) {
        console.error("Error updating question:", error);
        res.status(500).json({ error: "An error occurred while updating the question." });
    }
});

//Create Exams
export const createExam = asyncHandler(async (req,res) => {
    try {
        const { courseId } = req.params;
        const { examName, totalMarks, duration, createdBy, examGuidelines, questions, date, isPublished } = req.body;

        if (!courseId || !examName || !totalMarks || !duration || !createdBy || !examGuidelines || !questions || !date){
            res.status(400).json({error: "All fields are mandatory !"});
        }

        let newExam = {
            examId: uuidv4(),
            examName: examName,
            totalMarks: totalMarks,
            duration: duration,
            createdBy: createdBy,
            examGuidelines: examGuidelines,
            questions: questions,
            date: date,
            isPublished: isPublished !== undefined ? isPublished : false
        }

        let courseExam = await CourseExam.findOne({courseId});
        
        //Prevents insertion of same exam name entries
        if(courseExam && courseExam.exam.some(q => q.examName === examName)){
            res.status(409).json({ error: "An exam with this name already exists in the course." });
        }

        if(!courseExam){
            courseExam = new CourseExam({
                courseId: courseId,
                exam : [newExam]
            });
        }else{
            courseExam.exam.push(newExam);
        }

        await courseExam.save();

        res.status(200).json({message: "Exam added Successfully", newExam});
    } catch (error) {
        console.error("Error adding exam", error);
        res.status(500).json({ error: "An error occurred while adding the exam." });
    }
});

//Get all Exams
export const getExams = asyncHandler(async (req,res) => {
    try {
        const { courseId } = req.params;

        if (!courseId){
            res.status(400).json({error: "CourseId is required !"});
        }

        const pariksha = await CourseExam.findOne({courseId});

        if(!pariksha){
            res.status(404).json({error: "This Course's Exam's doesn't exists."});
        }

        res.status(200).json({message: "Exams Fetched Successfully",pariksha:{exams :pariksha.exam}});
        
    } catch (error) {
        console.error("Error getting exams", error);
        res.status(500).json({ error: "An error occurred while fetching the exam." });
    }
});

//Edit Exam by examId
export const editExam = asyncHandler(async (req,res) => {
    try {
        const { courseId, examId } = req.params;
        const { examName, totalMarks, duration, createdBy, examGuidelines, questions, date, isPublished } = req.body;

        if (!courseId || !examId || !examName || !totalMarks || !duration || !createdBy || !examGuidelines || !questions || !date){
            return res.status(400).json({error: "All fields are mandatory !"});
        }

        const crsExamExists = await CourseExam.findOne({courseId});
        if(!crsExamExists){
            return res.status(404).json({message: "No such course exists. Please check courseId."});
        }

        const pariksha = crsExamExists.exam.find(q => q.examId === examId);

        if (!pariksha) {
            return res.status(404).json({ error: "Exam not found. Please check ExamId" });
        }

        if (examName) pariksha.examName = examName;
        if (totalMarks) pariksha.totalMarks = totalMarks;
        if (duration) pariksha.duration = duration;
        if (createdBy) pariksha.createdBy = createdBy;
        if (examGuidelines) pariksha.examGuidelines = examGuidelines;
        if (questions) pariksha.questions = questions;
        if (date) pariksha.date = date;
        pariksha.isPublished = isPublished !== undefined ? isPublished : pariksha.isPublished;


        crsExamExists.markModified('exam');
        await crsExamExists.save();

        res.status(200).json({
            message: "Exam updated successfully",
            updatedExam: pariksha
        });
    } catch (error) {
        console.error("Error updating exam:", error);
        res.status(500).json({ error: "An error occurred while updating the exam." });
    }
});

//Delete Exam by examId
export const deleteExam = asyncHandler(async (req,res) => {
    try {
        const {courseId, examId } = req.params;

        if(!courseId || !examId){
            return res.status(400).json({error: "All fields are mandatory!"});
        }

        const crsExamExists = await CourseExam.findOne({courseId});
        if(!crsExamExists){
            return res.status(404).json({message: "No such course exists. Please check courseId."});
        }

        const pariksha = crsExamExists.exam.find(q => q.examId === examId);

        if (!pariksha) {
            return res.status(404).json({ error: "Exam not found. Please check ExamId" });
        }

        const result = await CourseExam.updateOne({courseId}, {$pull: {exam: {examId: examId}}});

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: "Exam not found or already deleted." });
        }

        res.status(200).json({
            message: "Exam deleted successfully",
            examId: examId
        });        
    } catch (error) {
        console.error("Error deleting exam:", error);
        res.status(500).json({ error: "An error occurred while deleting the exam." });
    }
});

//Get Results for all exams for main result page
export const getExamsResult = asyncHandler(async (req, res) => {
    try {
        const { courseId } = req.params;

        if(!courseId){
            return res.status(400).json({message: "Course ID is missing."});
        }

        const parinam = await Result.findOne({courseId});

        if(!parinam) {
            return res.status(404).json({message: "Exam not found."});
        }

        res.status(200).json({message: "Results fetched successfully.", parinam});
    } catch (error) {
        console.error("Error deleting exam:", error);
        res.status(500).json({ error: "An error occurred while deleting the exam." });
    }
});

//Get Assignments 
export const getAssignments = asyncHandler(async (req,res) => {
    try {
        const { courseId } = req.params;

        if(!courseId){
            return res.status(400).json({error: "Course ID is required"});
        }

        const assignment = await Assignment.findOne({courseId});

        if (!assignment) {
            return res.status(404).json({error: "No assignments for this course ID"});
        }

        res.status(200).json({message: "Successful", data:assignment.assignments});
    } catch (error) {
        console.error("Error fetching assignements", error);
        res.status(500).json({ error: "An error occurred while fetching assignements." });
    }
});

//Post Assignments
export const postAssignments = asyncHandler(async (req,res) => {
    try {
        const { courseId } = req.params;
        const { 
            title, 
            description, 
            dueDate, 
            createdAt, 
            updatedAt, 
            facultyId, 
            attachmentUrlFaculty, //Check if it required or not
            maxScore } = req.body;

        if (!courseId || !title || !description || !dueDate || !facultyId || !attachmentUrlFaculty|| !maxScore)
        {
            return res.status(400).json({error: "All fields are mandatory"});
        }

        if (!req.file){
            return res.status(400).json({error: "No file is provided !!!"});
        }

        const upload = await uploadFile(req.file.path);

        const newAssignment = {
            title, 
            description, 
            dueDate,  
            facultyId, 
            attachmentUrlFaculty: upload.secure_url, 
            maxScore
        }
        
        let assignmentDoc = await Assignment.findOne({courseId});

        if(!assignmentDoc){
            assignmentDoc = new Assignment({
                courseId, 
                assignments: [newAssignment]
            })}
        else{
            assignmentDoc.assignments.push(newAssignment);
        }

        await assignmentDoc.save();

        res.status(200).json({ message: 'Assignment added successfully', assignment: newAssignment });
    } catch (error) {
        console.error('Error adding assignment:', error);
        res.status(500).json({ message: 'Failed to add assignment', error });
    }
});

//Posts the marks for assignment of students 
export const assignmentMarks = asyncHandler(async(req, res) => {
    try {
        const { courseId, title, studentId } = req.params;
        const { marks } = req.body;

        if (!courseId || !studentId){
            return res.status(400).json({error: 'Course and student ID are required'});
        }

        if (!marks){
            return res.status(400).json({error: 'marks are required'});
        }

        const assignment = await Assignment.findOne({
            courseId, 
            'assignments.title': title,
            'assignments.submissions.studentId': studentId
        })

        if(!assignment){
            return res.status(404).json({error: 'No such assignement or submission found'});
        }

        // Find the specific assignment within the assignments array by title
        const specificAssignment = assignment.assignments.find(assign => assign.title === title);

        if (!specificAssignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Find the specific submission within the submissions array
        const submission = specificAssignment.submissions.find(sub => sub.studentId === parseInt(studentId));

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Update the score
        submission.score = score;
        submission.updatedAt = new Date();

        // Save the changes to the database
        await assignment.save();

        res.status(200).json({ message: 'Submission updated successfully', submission });

    } catch (error) {
        console.log('Error adding marks:', error);
        res.status(500).json({message: 'Failed to add marks', error});
    }
})

//Fetch all the requests for course approvals
export const getMessages = asyncHandler(async(req,res) => {
    try {
        const { facultyId } = req.params;

        if(!facultyId){
            return res.status(400).json({message: "Faculty ID is required"});
        }

        //const messages = await Approvals.findOne({facultyId});
        const messages = await Approvals.find({facultyId : Number(facultyId)});

        if(!messages){
            return res.status(404).json({message: "No messages for this faculty ID"});
        }

        res.status(200).json({messages});
    } catch (error) {
        console.error('Error fetching approvals:', error);
        res.status(500).json({ message: 'Failed to get approvals', error });
    }
});

//Accept the request, make changes in the enroll_req_accepted in "Attendance" and then delete that approval document
export const acceptRequest = asyncHandler(async(req,res) => {
    try {
        // const { courseId } = req.params;

        const { courseId, courseRefID, student_id } = req.body;

        //console.log(req.body);
        console.log(courseId, courseRefID, student_id);

        if (!courseId) {
            return res.status(400).json({message: "course Id is required."});
        }

        const courseRefId = new mongoose.Types.ObjectId(courseRefID);

        await Attendance.updateOne(
            {
                courseRefId,
                'enrolledStudents.student_id': student_id,
            },
            { $set: {'enrolledStudents.$.enroll_req_accepted':true}},
            { new: true }
        );

        const deleteApproval = await Approvals.findOneAndDelete(
            {
                course_id: courseId,
                student_id : student_id
            }
        )

        if (!deleteApproval) {
            return res.status(404).json({ message: "Approval document not found." });
        }

        return res.status(200).json({
            message: "Enrollment request accepted, and approval document deleted."});
    } catch (error) {
        console.error('Error deleting approvals:', error);
        res.status(500).json({ message: 'Failed to delete approvals', error });
    }
});