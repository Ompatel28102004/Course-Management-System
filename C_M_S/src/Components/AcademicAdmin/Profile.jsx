import React, { useEffect, useState } from 'react';
import { HOST } from '../../utils/constants';
import { apiClient } from "../../lib/api-client";
import avatar2 from "../../assets/avatar_2.png"; // Corrected image import
import LoadingAnimation from "../Loading/LoadingAnimation";

const Profile = () => {
  const [user, setUser] = useState({
    user_id: '',
    role: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`${HOST}/api/academic-admin/profile`, { withCredentials: true });
      const userData = response.data.user || {};
      setUser({
        user_id: userData.user_id || '',
        role: userData.role || '',
        email: userData.email || '',
      });
    } catch (error) {
      console.error('Error fetching academic admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className='responsive'>Profile:</h2>
      {loading ? (
        <LoadingAnimation />
      ) : (
        <div className="profile-content">
          <div className="profile-image">
            <img src={avatar2} alt="Profile" />
          </div>
          <div className="profile-details">
            <p><strong>User ID:</strong> {user.user_id}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
