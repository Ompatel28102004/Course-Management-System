import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from "../../../lib/api-client";
import { ADDFACULTY_ROUTE, EDITFACULTY_ROUTE, SEARCHFACULTYS_ROUTE, HOST } from "../../../utils/constants";
import LoadingAnimation from "../../Loading/LoadingAnimation";

const FacultyForm = () => {
  const { facultyId } = useParams(); // Get faculty facultyId from URL params
  const navigate = useNavigate(); // For navigation
  const [faculty, setFaculty] = useState({
    image_url: '',
    FirstName: '',
    LastName: '',
    facultyId: '',
    CollegeEmail: '',
    Email: '',
    Gender: '',
    AadharNumber: '',
    Address: {
      Addr: '',
      City: '',
      State: '',
      Country: '',
      PinCode: '',
    },
    department: '',
    designation: '',
    salary: '',
    contactNumber: '',
    tempPassword: ''
  });
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false); // Track loading state
  const [toastMessage, setToastMessage] = useState(''); // Toast message state
  const [showToast, setShowToast] = useState(false); // Show/hide toast

  useEffect(() => {
    if (facultyId) {
      fetchFacultyData(facultyId); // Fetch data if editing
    }
  }, [facultyId]);

  const fetchFacultyData = async (id) => {
    setLoading(true);
    try {
      const response = await apiClient.get(SEARCHFACULTYS_ROUTE(id), { withCredentials: true });
      const data = response.data || {};
      const facultyData = data.faculty[0] || {}; // Handle response
      setFaculty({
        image_url: '',
        FirstName: facultyData.FirstName || '',
        LastName: facultyData.LastName || '',
        facultyId: facultyData.facultyId || '',
        CollegeEmail: facultyData.CollegeEmail || '',
        Email: facultyData.Email || '',
        Gender: facultyData.Gender || '',
        AadharNumber: facultyData.AadharNumber || '',
        Address: {
          Addr: facultyData.Address?.Addr || '',
          City: facultyData.Address?.City || '',
          State: facultyData.Address?.State || '',
          Country: facultyData.Address?.Country || '',
          PinCode: facultyData.Address?.PinCode || '',
        },
        department: facultyData.department || '',
        designation: facultyData.designation || '',
        salary: facultyData.salary || '',
        contactNumber: facultyData.contactNumber || '',
        tempPassword: facultyData.tempPassword || '',
      });
    } catch (error) {
      console.error('Error fetching faculty data:', error);
      setToastMessage('Error fetching faculty data. Please try again.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFaculty((prevFaculty) => ({
      ...prevFaculty,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFaculty((prevFaculty) => ({
      ...prevFaculty,
      Address: { ...prevFaculty.Address, [name]: value }
    }));
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFaculty((prevFaculty) => ({ ...prevFaculty, image_url: file }));
  };
  const resetForm = () => {
    setFaculty({
      image_url: '',
      FirstName: '',
      LastName: '',
      facultyId: '',
      CollegeEmail: '',
      Email: '',
      Gender: '',
      AadharNumber: '',
      Address: {
        Addr: '',
        City: '',
        State: '',
        Country: '',
        PinCode: '',
      },
      department: '',
      designation: '',
      salary: '',
      contactNumber: '',
      tempPassword: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToastMessage('');
    setShowToast(false);

    if (!e.target.checkValidity()) {
      setToastMessage('Please fill out all required fields.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }

    try {
      let imageUrl = ''; // Initialize imageUrl for uploaded image

      // Upload image file if it exists
      if (faculty.image_url) { // Assuming 'image_url' is the field for the image in faculty data
        setUploading(true);

        const formData = new FormData();
        formData.append('file', faculty.image_url); // Append image file to form data

        const uploadResponse = await apiClient.post(`${HOST}/api/file/upload-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        imageUrl = uploadResponse.data.data.file_url; // Get file URL from response
      }

      // Create faculty data object with updated `imageUrl`
      const facultyData = {
        ...faculty,
        image_url: imageUrl, // Update `image_url` with `imageUrl` directly here
      };

      const url = facultyId ? EDITFACULTY_ROUTE(facultyId) : ADDFACULTY_ROUTE;
      const method = facultyId ? 'put' : 'post';

      const response = await apiClient[method](url, facultyData, { withCredentials: true });

      if (response.status === 200 || response.status === 201) {
        setToastMessage(response.data.message || 'Success!');
        setShowToast(true);
        if (!facultyId) resetForm();

        // Navigate back on success
        setTimeout(() => {
          setShowToast(false);
          navigate(-1); // Go back to the previous page
        }, 3000);
      }
    } catch (error) {
      setToastMessage(
        error.response?.data?.message || 'An error occurred while processing the faculty data.'
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } finally {
      setUploading(false); // Ensure uploading state is reset
    }
  };


  if (uploading) {
    return <LoadingAnimation />;
  }
  if (loading) {
    return <LoadingAnimation />; // Show loading message
  }

  return (
    <div className="StudentForm">
      <div className="head">
        <h2 className='responsive'>
          {facultyId ? 'Edit Faculty Details' : 'Add Faculty Detail:'}
        </h2>
        <button onClick={() => navigate(-1)} className="user_btn back" >
          Back
        </button>
      </div>
      <form className="student-form" onSubmit={handleSubmit} noValidate>
        <label>Image Url:</label>
        <input
          type="file"
          name="image_url"
          onChange={handleFileChange}
          required={!facultyId}
        />
        <label>First Name:</label>
        <input
          type="text"
          name="FirstName"
          value={faculty.FirstName}
          onChange={handleChange}
          required
        />

        <label>Last Name:</label>
        <input
          type="text"
          name="LastName"
          value={faculty.LastName}
          onChange={handleChange}
          required
        />

        <label>Email:</label>
        <input
          type="email"
          name="Email"
          value={faculty.Email}
          onChange={handleChange}
          required
        />

        <label>Gender:</label>
        <select
          name="Gender"
          value={faculty.Gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <label>department:</label>
        <select
          name="department"
          value={faculty.department}
          onChange={handleChange}
          required
        >
          <option value="">Select department</option>
          <option value="Computer department">Computer department</option>
          <option value="Mechanical department">Mechanical department</option>
          <option value="Electrical department">Electrical department</option>
          <option value="Civil department">Civil department</option>
          <option value="Physics department">Physics department</option>
          <option value="Maths department">Maths department</option>
          <option value="Chemistry department">Chemistry department</option>
          <option value="Humanities and Social Sciences department">Humanities and Social Sciences department</option>
        </select>
        <label>Aadhar Number:</label>
        <input
          type="number"
          name="AadharNumber"
          value={faculty.AadharNumber}
          onChange={handleChange}
          required
          onWheel={(e) => e.target.blur()}
        />

        <label>Address:</label>
        <input
          type="text"
          name="Addr"
          placeholder="Street Address"
          value={faculty.Address.Addr}
          onChange={handleAddressChange}
          required
        />
        <label></label>
        <input
          type="text"
          name="City"
          placeholder="City"
          value={faculty.Address.City}
          onChange={handleAddressChange}
          required
        />
        <label></label>
        <input
          type="text"
          name="State"
          placeholder="State"
          value={faculty.Address.State}
          onChange={handleAddressChange}
          required
        />
        <label></label>
        <input
          type="text"
          name="Country"
          placeholder="Country"
          value={faculty.Address.Country}
          onChange={handleAddressChange}
          required
        />
        <label></label>
        <input
          type="number"
          name="PinCode"
          placeholder="Pin Code"
          value={faculty.Address.PinCode}
          onChange={handleAddressChange}
          required
          onWheel={(e) => e.target.blur()}
        />

        <label>Designation:</label>
        <select
          name="designation"
          value={faculty.designation}
          onChange={handleChange}
          required
        >
          <option value="">Select Designation</option>
          <option value="Professor">Professor</option>
          <option value="Associate Professor">Associate Professor</option>
          <option value="Assistant Professor">Assistant Professor</option>
          <option value="Lecturer">Lecturer</option>
          <option value="Senior Lecturer">Senior Lecturer</option>
          <option value="Research Fellow">Research Fellow</option>
        </select>

        <label>Salary:</label>
        <input
          type="text"
          name="salary"
          value={faculty.salary}
          onChange={handleChange}
          required
        />

        <label>Contact Number:</label>
        <input
          type="tel"
          name="contactNumber"
          value={faculty.contactNumber}
          onChange={handleChange}
          required
        />

        <label>Temporary Password:</label>
        <input
          type="password"
          name="tempPassword"
          value={faculty.tempPassword}
          onChange={handleChange}
          required={!facultyId}
        />

        <button type="submit" className="submit-btn" style={{ gridColumn: -2 }}>
          {facultyId ? 'Update' : 'Submit'}
        </button>
      </form>
      {showToast && <div className="toast-notification">{toastMessage}</div>}
    </div>
  );
};

export default FacultyForm;
