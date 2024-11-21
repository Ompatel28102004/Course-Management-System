import React, { useEffect, useState } from 'react';
import { HOST } from '../../utils/constants';
import { apiClient } from "../../lib/api-client";
import avatar2 from "../../assets/avatar_2.png"; // Corrected image import
import LoadingAnimation from "../Loading/LoadingAnimation";

const Profile = () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);

  const facultyId = localStorage.getItem('userId');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`${HOST}/api/faculty/facultyProfile/${facultyId}`, { withCredentials: true });
      const userData = response.data || {};
      console.log(response);
      setUser(userData);
    } catch (error) {
      console.error('Error fetching academic admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className='responsive'>Profile</h2>
      {loading ? (
        <LoadingAnimation />
      ) : (
        <div className="profile-content">
          <div className="profile-image">
            <img src={avatar2} alt="Profile" />
          </div>
          <div className="profile-details">
            <p><strong>Faculty ID:</strong> {user.facultyId}</p>
            <p><strong>First Name:</strong> {user.FirstName}</p>
            <p><strong>Last Name:</strong> {user.LastName}</p>
            <p><strong>College Email:</strong> {user.CollegeEmail}</p>
            <p><strong>Designation:</strong> {user.designation}</p>
            <p><strong>Department:</strong> {user.department}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
