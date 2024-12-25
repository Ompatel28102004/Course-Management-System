import React, { useEffect, useState } from 'react';
import { HOST } from '../../../utils/constants'
import axios from 'axios';
import LoadingAnimation from "../../Loading/LoadingAnimation"
import './Enrolled_Courses.css';
import { useNavigate } from 'react-router-dom';

function EnrolledCourses() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [CourseCompleted, setCompletedCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [sem, SetSem] = useState();
  const [loading, setLoading] = useState(true);
  const [enrolledIndex, setEnrolledIndex] = useState(0);
  const [completedIndex, setCompletedIndex] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1025);
  //Toast
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  useEffect(() => {
    const fetchStudentCourseData = async () => {
      try {
        const response = await axios.get(
          `${HOST}/api/student/get-course-data`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              userId: userId,
            },
          }
        );
        setEnrolledCourses(response.data.Courses);
        setCompletedCourses(response.data.CourseCompleted);
        setFirstName(response.data.firstName);
        setLastName(response.data.lastName);
        SetSem(response.data.Semester);
      } catch (error) {
        console.error('Fetch failed:', error);
        setToastMessage(`Fetch failed ${error}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentCourseData();
  }, [token, userId]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleEnrolledArrowClick = (direction) => {
    const increment = isSmallScreen ? 1 : 3;
    if (direction === 'left') {
      setEnrolledIndex((prevIndex) => (prevIndex === 0 ? enrolledCourses.length - increment : prevIndex - increment));
    } else {
      setEnrolledIndex((prevIndex) => (prevIndex === enrolledCourses.length - increment ? 0 : prevIndex + increment));
    }
  };

  const handleCompletedArrowClick = (direction) => {
    const increment = isSmallScreen ? 1 : 3;
    if (direction === 'left') {
      setCompletedIndex((prevIndex) => (prevIndex === 0 ? CourseCompleted.length - increment : prevIndex - increment));
    } else {
      setCompletedIndex((prevIndex) => (prevIndex === CourseCompleted.length - increment ? 0 : prevIndex + increment));
    }
  };

  const openModal = async () => {
    setIsModalOpen(true);
    setSelectedCourses([]);
    try {
      const response = await axios.get(`${HOST}/api/student/available-courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          semester: sem,
        },
      });
      const coursesWithSelection = response.data.map(course => ({
        ...course,
        selected: false
      }));
      setAvailableCourses(coursesWithSelection);
    } catch (error) {
      console.error('Failed to fetch available courses:', error);
      setToastMessage(`Error Fetching Courses ${error}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCourseSelect = (courseId) => {
    setAvailableCourses(availableCourses.map(course => (
      course._id === courseId ? { ...course, selected: !course.selected } : course
    )));
    setSelectedCourses(prev => {
      const selectedCourse = availableCourses.find(course => course._id === courseId);
      return prev.some(course => course._id === courseId)
        ? prev.filter(course => course._id !== courseId)
        : [...prev, selectedCourse];
    });
  };

  // Function to download the file
  const handleDownload = async (courseID, fileUrl) => {
    try {
      const response = await fetch(fileUrl); // Fetch the file
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob(); // Convert the response to a Blob
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob); // Create a URL for the Blob
      link.download = `${courseID}.pdf`; // Use courseID for the filename and add .pdf extension
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href); // Free up memory
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const submitCourses = () => {
    if (selectedCourses.length === 0) {
      setToastMessage("Please select a course.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else {
      openConfirmationModal();
    }
  };

  const openConfirmationModal = () => {
    setShowConfirmationModal(true);
  };

  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
  };

  const handleConfirmationSubmit = async () => {
    try {
      await axios.post(`${HOST}/api/student/enroll-selected-courses`, {
        userId,
        firstName,
        lastName,
        courses: selectedCourses,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      closeModal();
      window.location.reload(); // Refresh student data
    } catch (error) {
      console.error('Failed to enroll in courses:', error);
      setToastMessage(`Failed to enroll in courses: ${error.response.data.message}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const renderEnrolledCourseCard = (Courses) => {
    if (!Courses.enroll_req_accepted) {
      return (
        <div className="Courses-card-enrolled">
          <h3>{Courses.Course_Name}</h3>
          <p><strong>Course Code:</strong> {Courses.Course_Id}</p>
          <p><strong>Instructor:</strong> {Courses.faculty_Name}</p>
          <p className="warning">Enroll Request not accepted yet</p>
        </div>
      );
    }
    return (
      <div className="Courses-card-enrolled">
        <h3>{Courses.Course_Name}</h3>
        <p><strong>Course Code:</strong> {Courses.Course_Id}</p>
        <p><strong>Instructor:</strong> {Courses.faculty_Name}</p>

        <button
          className="forum-button"
          onClick={() => navigate(`/student/courses/${Courses.Course_Id}/forum`)}
        >
          Forum
        </button>

      </div>
    );
  };

  const renderNoCoursesCard = () => (
    <div className="no-courses-card">
      <h3>No Courses Enrolled</h3>
      <p>You have not enrolled in any courses for this semester.</p>
      <button className="button" onClick={openModal}>Enroll Now</button>
    </div>
  );

  const renderCompletedCourseCard = (Courses) => (
    <div className="Courses-card-completed">
      <h3>{Courses.Course_Name}</h3>
      <p><strong>Course Code:</strong> {Courses.Course_Id}</p>
      <p><strong>Instructor:</strong> {Courses.faculty_Name}</p>
    </div>
  );

  const renderCourseCards = (courses, renderFunction, index) => {
    const increment = isSmallScreen ? 1 : 3;
    const visibleCourses = courses.slice(index, index + increment);
    return visibleCourses.map((course, idx) => (
      <div key={idx} className="course-card-container">
        {renderFunction(course)}
      </div>
    ));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingAnimation /></div>;
  }

  return (
    <div className="enrolled-courses-container">
      <div className="section">
        <div className="section-content">
          <div className="section-info-enrolled">
            <h2>Enrolled Courses</h2>
            <p>This shows courses you have enrolled in this semester</p>
            <div className="arrows">
              <button className="arrow-button" onClick={() => handleEnrolledArrowClick('left')}>{"<"}</button>
              <button className="arrow-button" onClick={() => handleEnrolledArrowClick('right')}>{">"}</button>
            </div>
          </div>
          <div className="Courses-cards">
            {enrolledCourses.length === 0 ? renderNoCoursesCard() : renderCourseCards(enrolledCourses, renderEnrolledCourseCard, enrolledIndex)}
          </div>
        </div>
      </div>
      <div className="section">
        <div className="section-content">
          <div className="section-info-completed">
            <h2>Courses Completed</h2>
            <p>This shows Courses Completed in respective Curriculum</p>
            <div className="arrows">
              <button className="arrow-button" onClick={() => handleCompletedArrowClick('left')}>{"<"}</button>
              <button className="arrow-button" onClick={() => handleCompletedArrowClick('right')}>{">"}</button>
            </div>
          </div>
          <div className="Courses-cards">
            {CourseCompleted.length === 0 ? <p className="not-completed">No courses completed</p> : renderCourseCards(CourseCompleted, renderCompletedCourseCard, completedIndex)}
          </div>
        </div>
      </div>

      {/* Select Available Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              Available Courses
            </div>
            <ul>
              {availableCourses.map((course) => (
                <li key={course._id} className="course-item"> {/* Use course._id */}
                  <input
                    type="checkbox"
                    checked={course.selected || false}
                    onChange={() => handleCourseSelect(course._id)} /* Use course._id */
                  />
                  <span className="course-name">
                    {course.courseName} ({course.courseID})
                  </span>
                  <a onClick={() => handleDownload(course.courseID, course.pdfUrl)} target="_blank" rel="noopener noreferrer" className="pdf-link">View PDF</a>
                </li>
              ))}
            </ul>
            <div className="modal-footer">
              <button className="button" onClick={submitCourses}>Add Selected Courses</button>
              <button className="button" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              Confirm Selected Courses
            </div>
            <div className="modal-body">
              <p className="disclaimer">Please review your selected courses. Once submitted, you cannot modify them.</p>
              <ul>
                {selectedCourses.map((course) => (
                  <li key={course._id}>
                    {course.courseName} ({course.courseID})
                  </li>
                ))}
              </ul>
            </div>
            <div className="modal-footer">
              <button className="button" onClick={handleConfirmationSubmit}>Confirm and Submit</button>
              <button className="button" onClick={closeConfirmationModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default EnrolledCourses;

// Update course model for all.