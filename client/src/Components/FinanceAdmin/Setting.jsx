import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from "../../lib/api-client";
import { HOST } from '../../utils/constants';

const Setting = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(null); // Password validation state

  const navigate = useNavigate();

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsCurrentPasswordValid(null);
  };

  // Verify the current password
  const verifyCurrentPassword = async () => {
    const user_id = localStorage.getItem('userId');
    try {
      const response = await apiClient.post(`${HOST}/api/auth/login`, {
        user_id,
        password: currentPassword,
      });
      if (response.status === 200 || response.status === 201) {
        setIsCurrentPasswordValid(true); // Set validity based on response
      }
    } catch (error) {
      console.error("Password verification failed:", error.response);
      setIsCurrentPasswordValid(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setToastMessage("");
    setShowToast(false);

    if (isCurrentPasswordValid === false) {
      setToastMessage("Current password is incorrect.");
      setShowToast(true);
      return;
    }

    if (!e.target.checkValidity()) {
      setToastMessage("Please fill out all required fields.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setToastMessage("New Password and Confirm Password must be the same.");
      setShowToast(true);
      return;
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordPattern.test(newPassword)) {
      setToastMessage("Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number.");
      setShowToast(true);
      return;
    }

    const userId = localStorage.getItem('userId');

    try {
      const response = await apiClient.post(
        `${HOST}/api/auth/change-password`,
        { userId, newPassword },
        {
          withCredentials: true,
        }
      );
      if (response.status === 200 || response.status === 201) {
        setToastMessage("Password changed successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          navigate('/academic-admin'); // Go back to the previous page
        }, 3000);
        resetForm();
        
      }
    } catch (error) {
      console.error("Password change failed:", error.response.data);
    }
  };

  return (
    <div>
      <h2 className="text-3xl">Settings:</h2>
      <div className="ChangePasswordForm">
        <div className="head mt-5">
          <h2 className='responsive'>Change Password: </h2>
          <button onClick={() => navigate(-1)} className="user_btn back">Back</button>
        </div>
        <form className="student-form" onSubmit={handleChangePasswordSubmit} noValidate>
          <label>Current Password:</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="password"
              name="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              onBlur={verifyCurrentPassword} // Verify password on blur
              required
            />
            {isCurrentPasswordValid !== null && (
              <span style={{ marginLeft: '8px' }}>
                {isCurrentPasswordValid ? "✔️" : "❌"}
              </span>
            )}
          </div>

          <label>New Password:</label>
          <input
            type="password"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <label>Confirm New Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="submit-btn" style={{ gridColumn: -2 }}>
            Change Password
          </button>
        </form>
        {showToast && <div className="toast-notification">{toastMessage}</div>}
      </div>
    </div>
  );
};

export default Setting;
