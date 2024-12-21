import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../AcademicAdmin/dashboard/dashboard';
import UserManagement from '../AcademicAdmin/user_management/user_management';
import Feedback from '../AcademicAdmin/feedback/Feedback';
import CourseManagement from '../AcademicAdmin/course_management/course_management';
import Notification from '../AcademicAdmin/Notification';
import Setting from '../AcademicAdmin/Setting';
import Profile from '../AcademicAdmin/Profile';

import "./AcademicAdmin.css"
const AcademicAdmin = () => {
  return (
      <div className='App'>
        <Routes>
          {/* <Route path="/*" element={<Dashboard />} /> */}
          <Route path="*" element={<Dashboard />} />
          <Route path="/user_management/*" element={<UserManagement />} />
          <Route path="/course_management/*" element={<CourseManagement />} />
          <Route path="/feedback/*" element={<Feedback />} />
          <Route path="/settings" element={<Setting />} />
          <Route path="/notifications" element={<Notification />} />
          <Route path="/profile" element={<Profile />} />
          
        </Routes>
      </div>
  );
};

export default AcademicAdmin;
