import React, { useState, useEffect } from 'react';
import { HOST } from "../../utils/constants"
import axios from 'axios';
import { PencilIcon, CheckIcon } from 'lucide-react';
import LoadingAnimation from '../Loading/loadingAnimation';

export default function ProfilePage() {
  const [data, setData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await axios.get(
          `${HOST}/api/student/get-data`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              userId: userId,
            },
          }
        );
        setData(response.data);
        setEditedData(response.data);
      } catch (error) {
        console.error('Fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [token, userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditedData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setEditedData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${HOST}/api/student/update-data`,
        editedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            userId: userId,
          },
        }
      );
      setData(response.data);
      setEditedData(response.data);
      setIsEditing(false);
      console.log("Student data updated successfully");
    } catch (error) {
      console.error("Error updating student data:", error);
      setIsEditing(false);
    }
  };

  const handleEditClick = () => {
    if (isEditing) {
      // If editing, submit the form
      document.getElementById("profile-form").dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    } else {
      // Toggle editing mode
      setIsEditing(true);
    }
  };

  if (loading) {
    return <div><LoadingAnimation/></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-[98%] mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row justify-between items-center bg-gray-50">
          <div className="flex items-center mb-4 sm:mb-0">
            <img
              src={data.image_url}
              alt="Student"
              className="w-20 h-20 rounded-full mr-4 object-cover"
            />
            <h1 className="text-2xl font-semibold text-gray-900">Student Profile</h1>
          </div>
          <button
            onClick={handleEditClick}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {isEditing ? (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                Save
              </>
            ) : (
              <>
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </>
            )}
          </button>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <form id="profile-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
              <ProfileField
                label="Enrollment Number"
                name="EnrollmentNumber"
                value={data.enrollment}
                readOnly
              />
              <ProfileField
                label="First Name"
                name="FirstName"
                value={data.FirstName}
                readOnly
              />
              <ProfileField
                label="Last Name"
                name="LastName"
                value={data.LastName}
                readOnly
              />
              <ProfileField
                label="Degree"
                name="Degree"
                value={data.Academic_info.Degree}
                readOnly
              />
              <ProfileField
                label="Branch"
                name="Branch"
                value={data.Academic_info.Branch}
                readOnly
              />
              <ProfileField
                label="Personal Email"
                name="Email"
                value={editedData.Email}
                onChange={handleInputChange}
                isEditing={isEditing}
                type="email"
              />
              <ProfileField
                label="College Email"
                name="CollegeEmail"
                value={data.CollegeEmail}
                readOnly
              />
              <ProfileField
                label="Contact"
                name="Contact"
                value={editedData.Contact}
                onChange={handleInputChange}
                isEditing={isEditing}
                type="tel"
              />
              <ProfileField
                label="Gender"
                name="Gender"
                value={data.Gender}
                readOnly
              />
              <ProfileField
                label="Aadhar Number"
                name="AadharNumber"
                value={editedData.AadharNumber}
                onChange={handleInputChange}
                isEditing={isEditing}
              />
              <ProfileField
                label="Guardian Number"
                name="GuardianNumber"
                value={editedData.GuardianNumber}
                onChange={handleInputChange}
                isEditing={isEditing}
                type="tel"
              />
              <ProfileField
                label="Guardian Email"
                name="GuardianEmail"
                value={editedData.GuardianEmail}
                onChange={handleInputChange}
                isEditing={isEditing}
                type="email"
              />
              <ProfileField
                label="Address"
                name="Address.Addr"
                value={editedData.Address.Addr}
                onChange={handleInputChange}
                isEditing={isEditing}
              />
              <ProfileField
                label="City"
                name="Address.City"
                value={editedData.Address.City}
                onChange={handleInputChange}
                isEditing={isEditing}
              />
              <ProfileField
                label="State"
                name="Address.State"
                value={editedData.Address.State}
                onChange={handleInputChange}
                isEditing={isEditing}
              />
              <ProfileField
                label="Country"
                name="Address.Country"
                value={editedData.Address.Country}
                onChange={handleInputChange}
                isEditing={isEditing}
              />
              <ProfileField
                label="Pin Code"
                name="Address.PinCode"
                value={editedData.Address.PinCode}
                onChange={handleInputChange}
                isEditing={isEditing}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, name, value, onChange, isEditing, type = "text", readOnly = false }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        {isEditing && !readOnly ? (
          <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        ) : (
          <p className="text-sm text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
}
