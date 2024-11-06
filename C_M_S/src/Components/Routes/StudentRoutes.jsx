import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Profile from '../Student/Profile.jsx';
import Overview from '../Student/Dashboard/Overview';
import EnrolledCourses from '../Student/Courses/Enrolled_Courses';
import FeesSection from '../Student/Dashboard/Fees.jsx';
import Result from '../Student/Courses/Results.jsx';
import Notification from '../AcademicAdmin/Notification';
import Setting from '../AcademicAdmin/Setting';
import Assignments from '../Student/Courses/Assignments.jsx';
const Student = () => {
  return (
      <div>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="*" element={<Overview />} />
          <Route path="/settings" element={<Setting />} />
          <Route path="/notifications" element={<Notification />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard/overview" element={<Overview />} />
          <Route path="/dashboard/inbox" element={<Overview />} />
          <Route path="/dashboard/fees" element={<FeesSection />} />
          <Route path="/courses/enrolled-courses" element={<EnrolledCourses />} />
          <Route path="/courses/attendance" element={<EnrolledCourses />} />
          <Route path="/courses/course-forum" element={<EnrolledCourses />} />
          <Route path="/courses/assignments" element={<Assignments />} />
          <Route path="/courses/quiz" element={<EnrolledCourses />} />
          <Route path="/courses/results" element={<Result />} />
        </Routes>
      </div>
  );
};

export default Student;