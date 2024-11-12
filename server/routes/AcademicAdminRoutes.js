import { Router } from "express";

import { 
    addStudent, getAllStudents, deleteStudent ,searchStudents, editStudent, 
    addCourse, getAllCourses, deleteCourse, searchCourses, editCourse, 
    addFaculty, getAllFaculty, 
    deleteFaculty, searchFaculty, editFaculty, 
    createFeedback, getActiveFeedback, getInactiveFeedback, deleteFeedback, searchFeedback, editFeedback, getFeedbackResponses, 
    Overview, UserDetails, Report,
    createQuestion, getActiveQuestions, getInactiveQuestions, editQuestion, deleteQuestion,
    addTA, getAllTAs, deleteTA, searchTAs, editTA,createExam,getExam,editExam,deleteExam
} from '../controller/AcademicAdminController.js';

import { verifyToken } from '../middlewares/AuthMiddleware.js';

const AcademicAdminRoutes = Router();
// Optionally, route to get all students
AcademicAdminRoutes.get('/report',verifyToken, Report);
// Route to add a new student
AcademicAdminRoutes.post('/addstudent',verifyToken, addStudent);

//route to get all students
AcademicAdminRoutes.get('/getstudent',verifyToken, getAllStudents);

// Route to delete a student
AcademicAdminRoutes.delete('/deletestudent/:enrollmentNo',verifyToken, deleteStudent);

// Route to search for students
AcademicAdminRoutes.get('/searchstudents',verifyToken, searchStudents);

// Route to edit student details
AcademicAdminRoutes.put('/editstudent/:enrollmentNo',verifyToken, editStudent);

// Route to add a new course
AcademicAdminRoutes.post('/addcourse',verifyToken, addCourse);

// Route to get all courses
AcademicAdminRoutes.get('/getcourses',verifyToken, getAllCourses);

// Route to delete a course by ID
AcademicAdminRoutes.delete('/deletecourse/:courseID',verifyToken, deleteCourse);

// Route to search for courses
AcademicAdminRoutes.get('/searchcourses',verifyToken, searchCourses);

// Route to edit course details by ID
AcademicAdminRoutes.put('/editcourse/:courseID',verifyToken, editCourse);

// Route to add a new faculty
AcademicAdminRoutes.post('/addfaculty',verifyToken, addFaculty);

// Optionally, route to get all facultys
AcademicAdminRoutes.get('/getfaculty',verifyToken, getAllFaculty);

// Route to delete a faculty
AcademicAdminRoutes.delete('/deletefaculty/:facultyId',verifyToken, deleteFaculty);

// Route to search for facultys
AcademicAdminRoutes.get('/searchfacultys',verifyToken, searchFaculty);

// Route to edit faculty details
AcademicAdminRoutes.put('/editfaculty/:facultyId',verifyToken, editFaculty);

// Route to create a new feedback form
AcademicAdminRoutes.post('/addfeedback',verifyToken, createFeedback);

// Route to get all active feedback forms
AcademicAdminRoutes.get('/getactivefeedback',verifyToken, getActiveFeedback);

AcademicAdminRoutes.get('/getresponses/:feedbackID',verifyToken, getFeedbackResponses);

// Route to get all inactive feedback forms
AcademicAdminRoutes.get('/getinactivefeedback',verifyToken, getInactiveFeedback);

// Route to delete a feedback form by ID
AcademicAdminRoutes.delete('/deletefeedback/:feedbackID',verifyToken, deleteFeedback);

// Route to search feedback forms (e.g., by course, faculty)
AcademicAdminRoutes.get('/searchfeedback',verifyToken, searchFeedback);

// Route to edit feedback form details by ID
AcademicAdminRoutes.put('/editfeedback/:feedbackID',verifyToken, editFeedback);

AcademicAdminRoutes.get("/overview",verifyToken,Overview);

AcademicAdminRoutes.get("/profile",UserDetails);

// Route to create a new question
AcademicAdminRoutes.post('/addquestion',verifyToken, createQuestion);

// Route to get all active questions
AcademicAdminRoutes.get('/getactivequestions',verifyToken, getActiveQuestions);

// Route to get all inactive questions
AcademicAdminRoutes.get('/getinactivequestions',verifyToken, getInactiveQuestions);

// Route to edit a question by ID
AcademicAdminRoutes.put('/editquestion/:questionID',verifyToken, editQuestion);

// Route to delete a question by ID
AcademicAdminRoutes.delete('/deletequestion/:questionID',verifyToken, deleteQuestion);

// Route to add a new TA
AcademicAdminRoutes.post('/addta',verifyToken, addTA);

// Route to add a new TA
AcademicAdminRoutes.put('/editta/:enrollmentNo',verifyToken, editTA);

// Route to get all TAs
AcademicAdminRoutes.get('/getta',verifyToken, getAllTAs);

// Route to search for TAs
AcademicAdminRoutes.get('/searchtas',verifyToken, searchTAs);

// Route to delete a TA
AcademicAdminRoutes.delete('/deleteta/:enrollment',verifyToken, deleteTA);

AcademicAdminRoutes.post('/addexam',verifyToken, createExam);
AcademicAdminRoutes.get('/getexams',verifyToken, getExam);
AcademicAdminRoutes.put('/editexam/:examID',verifyToken, editExam);
AcademicAdminRoutes.delete('/deleteexam/:examID',verifyToken, deleteExam);

export default AcademicAdminRoutes;