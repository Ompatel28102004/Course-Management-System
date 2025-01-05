import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from "../../../lib/api-client";
import { HOST } from '../../../utils/constants';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../../Components/ui/card";
import { Input } from "../../../Components/ui/input";
import { Button } from "../../../Components/ui/button";
import { Alert, AlertDescription } from "../../../Components/ui/alert";
import { ArrowLeft, Check, X, KeyRound } from "lucide-react";
import Toast from '@/Components/Toast/Toast';

const Setting = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(null);

  const navigate = useNavigate();

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsCurrentPasswordValid(null);
  };

  const verifyCurrentPassword = async () => {
    const user_id = localStorage.getItem('userId');
    try {
      const response = await apiClient.post(`${HOST}/api/auth/login`, {
        user_id,
        password: currentPassword,
      });
      if (response.status === 200 || response.status === 201) {
        setIsCurrentPasswordValid(true);
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
        { withCredentials: true }
      );
      if (response.status === 200 || response.status === 201) {
        setToastMessage("Password changed successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          navigate('/');
        }, 2000);
        resetForm();
      }
    } catch (error) {
      console.error("Password change failed:", error.response?.data);
      setToastMessage("Failed to change password. Please try again.");
      setShowToast(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <KeyRound className="h-6 w-6" />
              Change Password
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePasswordSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Current Password</div>
              <div className="relative">
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  onBlur={verifyCurrentPassword}
                  className="pr-10"
                  required
                />
                {isCurrentPasswordValid !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isCurrentPasswordValid ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">New Password</div>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Confirm New Password</div>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {showToast && (
              <Alert variant={toastMessage.includes("success") ? "default" : "destructive"}>
                <AlertDescription>{toastMessage}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            onClick={handleChangePasswordSubmit}
          >
            Change Password
          </Button>
        </CardFooter>
      </Card>
      {/* Toast Notification */}
      {showToast && <Toast message={toastMessage} />}
    </div>
  );
};

export default Setting;