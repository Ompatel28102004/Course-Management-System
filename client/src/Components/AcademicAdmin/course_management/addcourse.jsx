import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from "../../../lib/api-client";
import { ADDCOURSE_ROUTE, EDITCOURSE_ROUTE, SEARCHCOURSE_ROUTE, HOST } from "../../../utils/constants";
import LoadingAnimation from "../../Loading/LoadingAnimation";
const AddCourse = () => {
  const { courseID } = useParams(); // Get courseID from URL for editing
  const navigate = useNavigate(); // Initialize navigate
  const [course, setCourse] = useState({
    courseID: '',
    courseName: '',
    department: '',
    branch: '',
    courseStartDate: '',
    semester: '',
    courseInstructorID: '',
    courseCredit: '',
    courseFile: '' // Added to track file
  });
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false); // Track loading state
  const [toastMessage, setToastMessage] = useState(""); // Toast message state
  const [showToast, setShowToast] = useState(false); // Show toast

  // Fetch course data if courseID is available (Edit mode)
  useEffect(() => {
    if (courseID) {
      fetchCourseData(courseID);
    }
  }, [courseID]);

  function formatDate(isoString) {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const fetchCourseData = async (courseID) => {
    setLoading(true); // Start loading
    try {
      const response = await apiClient.get(SEARCHCOURSE_ROUTE(courseID), {
        withCredentials: true,
      });
      const data = response.data.courses[0] || {}; // Fetch the course data

      setCourse({
        courseID: data.courseID || '',
        courseName: data.courseName || '',
        department: data.department || '',
        branch: data.branch || '',
        courseStartDate: formatDate(data.courseStartDate) || '',
        semester: data.semester || '',
        courseInstructorID: data.courseInstructorID || '',
        courseCredit: data.courseCredit || '',
        courseFile: '' // Reset the file input
      });
    } catch (error) {
      console.error("Error fetching course data:", error);
      setToastMessage("Error fetching course data. Please try again.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCourse((prevTA) => ({
      ...prevTA,
      [name]: name === 'semester' ? parseInt(value, 10) : value, // Convert to number if it's 'teachingSemester'
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCourse((prevCourse) => ({ ...prevCourse, courseFile: file }));
  };

  const resetForm = () => {
    setCourse({
      courseID: '',
      courseName: '',
      department: '',
      branch: '',
      courseStartDate: '',
      semester: '',
      courseInstructorID: '',
      courseCredit: '',
      courseFile: ''
    });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setToastMessage("");
    setShowToast(false);

    if (!e.target.checkValidity()) {
      setToastMessage("Please fill out all required fields.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }

    try {
      let pdfUrl = '';
      // Upload file if exists
      if (course.courseFile) {
        setUploading(true);

        const formData = new FormData();
        formData.append('file', course.courseFile);

        const uploadResponse = await apiClient.post(`${HOST}/api/file/upload-file`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });

        pdfUrl = uploadResponse.data.data.file_url; // Get file URL from response
      }

      // Create course data object with updated `pdfUrl`
      const courseData = {
        ...course,
        courseFile: pdfUrl, // Update `courseFile` with `pdfUrl` directly here
      };

      const url = courseID ? EDITCOURSE_ROUTE(courseID) : ADDCOURSE_ROUTE;
      const method = courseID ? 'put' : 'post';

      const response = await apiClient[method](url, courseData, { withCredentials: true });

      if (response.status === 200 || response.status === 201) {
        setToastMessage(response.data.message || "Success!");
        setShowToast(true);
        if (!courseID) resetForm();

        setTimeout(() => {
          setShowToast(false);
          navigate(-1);
        }, 3000);
      }
    } catch (error) {
      setToastMessage(
        error.response?.data?.message || "An error occurred while processing the course data."
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } finally {
      setUploading(false);
    }
  };

  if (uploading) {
    return <LoadingAnimation />;
  }
  if (loading) {
    return <LoadingAnimation />; // Display loading message when fetching data
  }

  return (
    <div className="StudentForm">
      <div className='head'>
        <h2 className='responsive'>
          {courseID ? "Edit Course Details" : "Add Course Detail:"}
        </h2>
        <button onClick={() => navigate(-1)} className='user_btn back' >Back</button>
      </div>
      <form className="student-form" onSubmit={handleSubmit} noValidate>
        {/* <label>Course ID:</label>
        <input
          type="text"
          name="courseID"
          value={course.courseID}
          onChange={handleChange}
          required={!courseID}
          disabled={!!courseID} // Disable in edit mode
        /> */}

        <label>Course Name:</label>
        <input
          type="text"
          name="courseName"
          value={course.courseName}
          onChange={handleChange}
          required
        />

        <label>Department Name/ID:</label>
        <select
          name="department"
          value={course.department}
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
        <label>Course Branch:</label>
        <select
          name="branch"
          value={course.branch}
          onChange={handleChange}
          required
        >
          <option value="">Select Branch</option>
          <option value="Computer Engineering">Computer Engineering</option>
          <option value="Electrical Engineering">Electrical Engineering</option>
          <option value="Mechanical Engineering">Mechanical Engineering</option>
          <option value="Civil Engineering">Civil Engineering</option>
        </select>

        <label>Course Offering Semester:</label>
        <select
          name="semester"
          value={course.semester}
          onChange={(e) => handleChange(e)}
          required
        >
          <option value={0}>Select Semester</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
          <option value={6}>6</option>
          <option value={7}>7</option>
          <option value={8}>8</option>
        </select>
        <label>Course Instructor ID:</label>
        <input
          type="text"
          name="courseInstructorID"
          value={course.courseInstructorID}
          onChange={handleChange}
          required
        />

        <label>Course Credit:</label>
        <input
          type="number"
          name="courseCredit"
          value={course.courseCredit}
          onChange={handleChange}
          required
          onWheel={(e) => e.target.blur()}
        />

        <label>Course Start Date:</label>
        <input
          type="date"
          name="courseStartDate"
          value={course.courseStartDate}
          onChange={handleChange}
          required
        />
        <label>Course File:</label>
        <input
          type="file"
          name="courseFile"
          onChange={handleFileChange}
        />

        <button type="submit" className='submit-btn' style={{ gridColumn: -2 }}>
          {courseID ? "Update" : "Submit"}
        </button>
      </form>
      {showToast && <div className="toast-notification">{toastMessage}</div>}
    </div>
  );
};

export default AddCourse;
