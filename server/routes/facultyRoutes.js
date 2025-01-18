import express from "express";
import { Router } from "express";
import { getCoursesAssigned, getCourseInfo, getFacultyProfile, 
    getRegStudents, getAttenByDate,postAttendance,
    getQuestions, addQuestions, deleteQuestion, editQuestion,
    createExam, getExams, editExam, deleteExam,
    getExamsResult, getAssignments, postAssignments, assignmentMarks,
    getMessages, 
    acceptRequest} from "../controller/FacultyController.js";

import {verifyToken} from "../middlewares/AuthMiddleware.js";

const Routes = Router();

Routes.get("/coursesAssigned/:courseInstructorId",verifyToken,getCoursesAssigned);
Routes.get("/CourseInfo/:courseId",verifyToken,getCourseInfo);
Routes.get("/facultyProfile/:facultyId",verifyToken,getFacultyProfile);
Routes.get("/attendance/:courseId",verifyToken,getRegStudents);
Routes.get("/attendance/:courseId/:date", verifyToken,getAttenByDate);
Routes.post("/attendance/:courseId",verifyToken, postAttendance);
Routes.get("/examConduction/questionBank/:courseId",verifyToken, getQuestions);
Routes.post("/examConduction/questionBank/:courseId", verifyToken,addQuestions);
Routes.delete("/examConduction/questionBank/:courseId/:questionId", verifyToken,deleteQuestion);
Routes.put("/examConduction/questionBank/:courseId/:questionId",verifyToken, editQuestion);
Routes.post("/examConduction/createExam/:courseId",verifyToken, createExam);
Routes.get("/examConduction/createExam/:courseId", verifyToken,getExams);
Routes.put("/examConduction/createExam/:courseId/:examId", verifyToken,editExam);
Routes.delete("/examConduction/createExam/:courseId/:examId", verifyToken,deleteExam);
Routes.get("/result/:courseId",verifyToken,getExamsResult);
Routes.get("/assignment/:courseId",verifyToken, getAssignments);
Routes.post("/assignment/:courseId",verifyToken, postAssignments);
Routes.post("/assignment/:courseId/:title/:studentId",verifyToken, assignmentMarks);
Routes.get("/inbox/:facultyId",verifyToken,getMessages);
Routes.put("/inbox",verifyToken,acceptRequest);


export default Routes;
