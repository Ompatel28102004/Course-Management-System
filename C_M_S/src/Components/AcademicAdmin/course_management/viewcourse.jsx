import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from "../../../lib/api-client";
import { GETCOURSES_ROUTE, DELETECOURSE_ROUTE } from "../../../utils/constants";
import LoadingAnimation from "../../Loading/LoadingAnimation";
import { MdEdit, MdDelete, MdAddCircle } from "react-icons/md";
import { FaFileDownload } from "react-icons/fa";

const ViewCourse = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]); // Original course list
  const [filteredCourses, setFilteredCourses] = useState([]); // Filtered course list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [screenSize, setScreenSize] = useState(window.innerWidth); // Track screen size
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 5;

  // Track window resize to update screen size state
  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchCourses(); // Fetch courses on mount
  }, []);

  const handleEditClick = (courseID) => {
    navigate(`/academic-admin/course_management/addcourse/${courseID}`);
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(GETCOURSES_ROUTE, { withCredentials: true });
  
      // Sort courses by courseID lexicographically (alphanumeric sorting)
      const sortedCourses = response.data.courses.sort((a, b) => a.courseID.localeCompare(b.courseID));
  
      setCourses(sortedCourses); // Set original course list
      setFilteredCourses(sortedCourses); // Initialize filtered list with full course list
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while fetching courses.");
    } finally {
      setLoading(false);
    }
  };
  
  // Delete course function
  const handleDelete = async (courseID) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await apiClient.delete(DELETECOURSE_ROUTE(courseID), { withCredentials: true });
        const updatedCourses = courses.filter(course => course.courseID !== courseID);
        setCourses(updatedCourses); // Update original list
        setFilteredCourses(updatedCourses); // Update filtered list as well
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred while deleting the course.");
      }
    }
  };

  // Client-side search function
  const handleSearchInput = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter courses based on the search query across multiple fields
    const filtered = courses.filter(course =>
      course.courseID.toLowerCase().includes(query) ||
      course.courseName.toLowerCase().includes(query) ||
      course.department.toLowerCase().includes(query) ||
      course.branch.toLowerCase().includes(query) ||
      course.semester.toString().includes(query) || // Convert semester to string for search
      course.courseInstructorID.toString().toLowerCase().includes(query) ||
      course.courseInstructorName.toLowerCase().includes(query) ||
      course.courseCredit.toString().includes(query) // Convert courseCredit to string for search
    );
    setFilteredCourses(filtered); // Update filtered course list
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

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="Home">
      <h2 className='responsive'>Course Management</h2>
      <div className="search_add">
        <input
          type="text"
          placeholder="Search courses"
          className="search_input"
          value={searchQuery}
          onChange={handleSearchInput} // Update search input and filter list
        />
      </div>

      {loading ? (
        <LoadingAnimation />
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="table-container">
          {filteredCourses.length > 0 ? (
            screenSize < 768 ? (
              // Mobile/Tablet view: Render a simple list or cards
              <div className="user-table">
                {currentCourses.map((course, index) => (
                  <div key={index} className="course-card" style={{ border: "2px solid black", marginTop: "10px", padding: "10px" }}>
                    <p><strong>Course ID:</strong> {course.courseID}</p>
                    <p><strong>Name:</strong> {course.courseName}</p>
                    <p><strong>Department:</strong> {course.department}</p>
                    <p><strong>Branch:</strong> {course.branch}</p>
                    <p><strong>Semester:</strong> {course.semester}</p>
                    <p><strong>Instructor ID:</strong> {course.courseInstructorID}</p>
                    <p><strong>Instructor Name:</strong> {course.courseInstructorName}</p>
                    <p><strong>Credit:</strong> {course.courseCredit}</p>
                    <p className='flex'>
                      <strong>Course Files:</strong>
                      {course.pdfUrl ? (
                        <button className="download w-[35%]" onClick={() => handleDownload(course.courseID, course.pdfUrl)}>
                          <FaFileDownload className='icon' />
                        </button>
                      ) : (
                        <span>No File</span>
                      )}
                    </p>
                    <div className="action-buttons flex gap-10 justify-center align-middle">
                      <button className="edit-btn" onClick={() => handleEditClick(course.courseID)}>
                        <MdEdit />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(course.courseID)}>
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop view: Render a table
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Course ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Branch</th>
                    <th>Semester</th>
                    <th>Instructor ID</th>
                    <th>Instructor Name</th>
                    <th>Credit</th>
                    <th>Course Files</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCourses.map((course, index) => (
                    <tr key={index}>
                      <td>{course.courseID}</td>
                      <td>{course.courseName}</td>
                      <td>{course.department}</td>
                      <td>{course.branch}</td>
                      <td>{course.semester}</td>
                      <td>{course.courseInstructorID}</td>
                      <td>{course.courseInstructorName}</td>
                      <td>{course.courseCredit}</td>
                      <td>
                        {course.pdfUrl ? (
                          <button className="download" onClick={() => handleDownload(course.courseID, course.pdfUrl)}>
                            <FaFileDownload className='icon' />
                          </button>
                        ) : (
                          <span>No File</span>
                        )}
                      </td>
                      <td className="actions">
                        <div className="action-buttons">
                          <button className="edit-btn" onClick={() => handleEditClick(course.courseID)}>
                            <MdEdit />
                          </button>
                          <button className="delete-btn" onClick={() => handleDelete(course.courseID)}>
                            <MdDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            <p>No courses found.</p>
          )}
        </div>
      )}

          {/* Pagination Controls */}
          <div className="pagination-container">
            {/* Previous Button */}
            <button
              className={`pagination-button ${currentPage === 1 ? 'disabled-button' : ''}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {/* Page Numbers (Centered) */}
            <div className="page-numbers">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={`page-number ${index + 1 === currentPage ? 'active-page' : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              className={`pagination-button ${currentPage === totalPages ? 'disabled-button' : ''}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
    </div>
  );
};

export default ViewCourse;
