import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Profile from '../Student/Profile.jsx';
import Overview from '../Student/Dashboard/Overview';
import EnrolledCourses from '../Student/Courses/Enrolled_Courses';
import Attendance from '../Student/Courses/Attendance.jsx';
import FeesSection from '../Student/Dashboard/Fees.jsx';
import Result from '../Student/Courses/Results.jsx';
import Notification from '../Student/Dashboard/Inbox.jsx';
import Setting from '../AcademicAdmin/Setting';
import Assignments from '../Student/Courses/Assignments.jsx';
import Feedback from "../Student/Dashboard/Feedback.jsx"
import Quiz from '../Student/Courses/Quiz.jsx';
import CourseForum from '../Student/Courses/CourseForum.jsx';
import ChatRoom from '../Community/ChatRoom.jsx';
const Student = () => {
  return (
      <div>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="*" element={<Overview />} />
          <Route path="/settings" element={<Setting />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard/overview" element={<Overview />} />
          <Route path="/dashboard/notifications" element={<Notification />} />
          <Route path="/dashboard/fees" element={<FeesSection />} />
          <Route path="/dashboard/feedback" element={<Feedback />} />
          <Route path="/courses/enrolled-courses" element={<EnrolledCourses />} />
          <Route path="/courses/attendance" element={<Attendance />} />
          <Route path="/courses/assignments" element={<Assignments />} />
          <Route path="/courses/quiz" element={<Quiz />} />
          <Route path="/courses/results" element={<Result />} />
          <Route path="/courses/:courseId/forum" element={<CourseForum />} />
          <Route path="/Community" element={<ChatRoom />} />
        </Routes>
      </div>
  );
};

export default Student;