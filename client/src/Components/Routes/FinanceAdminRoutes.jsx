import React from 'react'
import { Route , Routes } from 'react-router-dom';
import Profile from '../FinanceAdmin/Profile';
import Setting from '../FinanceAdmin/Setting';
import Notification from '../FinanceAdmin/Notification';
import TotalFeesCollected from '../FinanceAdmin/Overview/TotalFeesCollected';
import PendingStudentFees from '../FinanceAdmin/Overview/PendingStudentFees';
import UpcomingPaymentDeadlines from '../FinanceAdmin/Overview/UpcomingPaymentDeadlines';
import TotalFeesStatus from '../FinanceAdmin/StudentFees/TotalFeesStatus';
import DegreeWiseFeesStatus from '../FinanceAdmin/StudentFees/DegreeWiseFeesStatus';
import UpcomingDeadlines from '../FinanceAdmin/StudentFees/UpcomingDeadlines';
import InvoiceDeatils from '../FinanceAdmin/StudentFees/InvoiceDeatils';
import ChatRoom from '../Community/ChatRoom.jsx';

export default function FinanceAdmin() {
    return (
        <div className="App">
          <Routes>
            {/* Default Route */}
            <Route path="*" element={<TotalFeesCollected/>} />
          <Route path="/Community" element={<ChatRoom />} />
            
            {/* Overview Routes */}
            <Route path="/overview/totalFeesCollected" element={<TotalFeesCollected/>} />
            <Route path="/overview/pendingStudentFees" element={<PendingStudentFees />} />
            <Route path="/overview/upcomingPaymentDeadline" element={<UpcomingPaymentDeadlines />} />
            
            {/* Student Fees Routes */}
            <Route path="/studentFees/totalFeesStatus" element={<TotalFeesStatus/>} />
            <Route path="/studentFees/degreewiseFeesStatus" element={<DegreeWiseFeesStatus/>} />
            <Route path="/studentFees/upcomingDeadlines" element={<UpcomingDeadlines/>} />
            <Route path="/studentFees/invoiceDetails" element={<InvoiceDeatils/>} />
    
            {/* Profile Routes */}
            <Route path="/profile" element={<Profile/>} />

            {/* Settings Routes */}
            <Route path="/settings" element={<Setting />} />

            {/* Notifications Routes */}
            <Route path="/notifications" element={<Notification />} />
          </Routes>
        </div>
    );
}