import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Overview from './Overview.jsx'
import Community from './Community.jsx'
import Download from './Download.jsx';
function dashboard() {
    return (
    <div className='user_management'>
      <Routes>
        <Route path="*" element={<Overview/>} /> 
        <Route path="/" element={<Overview/>} />
        <Route path="/Community" element={<Community />} />
        <Route path="/download" element={<Download />} />
      </Routes>
    </div>
  )
}

export default dashboard;