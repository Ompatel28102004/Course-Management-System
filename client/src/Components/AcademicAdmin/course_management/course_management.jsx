import React from 'react'
import { Routes, Route } from 'react-router-dom';
// import "./course_management.css";
import Viewcourse from './viewcourse.jsx';
import AddCourse from './addcourse.jsx';
import Exam from './Exam.jsx'

const course_management = () => {
  return (
    <div className='user_management'>
      <Routes>
        <Route path="/" element={<Viewcourse />} />
        <Route path="*" element={<Viewcourse />} /> 
        <Route path="/addcourse" element={<AddCourse />} /> 
        <Route path="/viewcourse" element={<Viewcourse />} />
        <Route path="/addcourse/:courseID" element={<AddCourse />} />
        <Route path="/Exam" element={<Exam />} />
      </Routes>
    </div>
  )
}

export default course_management
