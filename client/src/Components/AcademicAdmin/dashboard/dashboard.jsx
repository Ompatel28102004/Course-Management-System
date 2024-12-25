import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Overview from './Overview.jsx'
import ChatRoom from '../../Community/ChatRoom.jsx'
import Download from './Download.jsx';
function dashboard() {
    return (
    <div className='user_management h-100 bg-red'>
      <Routes>
        <Route path="*" element={<Overview/>} /> 
        <Route path="/" element={<Overview/>} />
        <Route path="/Community" element={<ChatRoom />} />
        <Route path="/download" element={<Download />} />
      </Routes>
    </div>
  )
}

export default dashboard;