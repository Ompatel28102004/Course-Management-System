import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from "../../../lib/api-client";
import { GETTAS_ROUTE, DELETETA_ROUTE, SEARCHTAS_ROUTE } from "../../../utils/constants";
import LoadingAnimation from "../../Loading/LoadingAnimation";
import { MdEdit, MdDelete, MdAddCircle, MdCancel } from "react-icons/md";

const TA_home = () => {
  const navigate = useNavigate();
  const [tas, setTAs] = useState([]);
  const [filteredTAs, setFilteredTAs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 5;

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchTAs(); // Fetch TAs on mount
  }, []);

  const fetchTAs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(GETTAS_ROUTE, { withCredentials: true });
      const taData = response.data?.tas; // Access the TA array
      if (taData) {
        const taList = taData.map(ta => ({
          enrollment: ta.enrollment || '', // Reference to student enrollment
          facultyId: ta.facultyId || '',  // Reference to faculty
          teachingSemester: ta.teachingSemester || '',
          teachingCourses: ta.teachingCourses || '',
          studentName: ta.studentName || '',
          studentEmail: ta.studentEmail || '',
          contactNumber: ta.contactNumber || '',
          semester: ta.semester || '' // Add semester field here
        }));
        const sortedTa = taList.sort((a, b) => a.enrollment - b.enrollment);

        setTAs(sortedTa); // Set original TA list
        setFilteredTAs(sortedTa); // Initialize filtered list with the full TA list
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while fetching TAs.");
    } finally {
      setLoading(false);
    }
  };

  // Delete TA function
  const handleDelete = async (enrollment) => {
    if (window.confirm('Are you sure you want to delete this TA?')) {
      try {
        await apiClient.delete(DELETETA_ROUTE(enrollment), { withCredentials: true });
        const updatedTAs = tas.filter(ta => ta.enrollment !== enrollment);
        setTAs(updatedTAs); // Update original list
        setFilteredTAs(updatedTAs); // Update filtered list as well
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred while deleting the TA.");
      }
    }
  };

  const handleSearchInput = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = tas.filter(ta =>
      ta.enrollment.toLowerCase().includes(query) ||
      ta.facultyId.toLowerCase().includes(query) ||
      ta.teachingSemester.toLowerCase().includes(query) ||
      ta.teachingCourses.toLowerCase().includes(query) ||
      ta.studentName.toLowerCase().includes(query) ||
      ta.studentEmail.toLowerCase().includes(query) ||
      ta.contactNumber.toString().includes(query) ||
      ta.semester.toString().includes(query)
    );
    setFilteredTAs(filtered);
  };

  const handleEditClick = (enrollment) => {
    navigate(`/academic-admin/user_management/ta_form/${enrollment}`);
  };

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredTAs.slice(indexOfFirstStudent, indexOfLastStudent);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(filteredTAs.length / studentsPerPage);

  return (
    <div className="Home">
      <h2 className='responsive'>Teaching Assistant Management</h2>
      <div className="search_add">
        <input
          type="text"
          placeholder="Search TAs"
          className="search_input"
          value={searchQuery}
          onChange={handleSearchInput}
        />
        <button className="user_btn add" onClick={() => navigate('/academic-admin/user_management/ta_form')}><MdAddCircle className="icon" /> Add TA</button>
      </div>
      {loading ? (
        <LoadingAnimation />
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="table-container">
          {filteredTAs.length > 0 ? (
            screenSize < 768 ? (
              <div className="user-table">
                {currentStudents.map((ta, index) => (
                  <div key={index} className="ta-card" style={{ border: "2px solid black", marginTop: "10px", padding: "10px" }}>
                    <p><strong>Enrollment No:</strong> {ta.enrollment}</p>
                    <p><strong>Name:</strong> {ta.studentName}</p>
                    <p><strong>Email:</strong> {ta.studentEmail}</p>
                    <p><strong>Contact Number:</strong> {ta.contactNumber}</p>
                    <p><strong>Faculty ID:</strong> {ta.facultyId}</p>
                    <p><strong>Teaching Semester:</strong> {ta.teachingSemester}</p>
                    <p><strong>Teaching Courses:</strong> {ta.teachingCourses}</p>
                    <p><strong>Semester:</strong> {ta.semester}</p>
                    <div className="action-buttons flex gap-10 justify-center align-middle">
                      <button className="edit-btn" onClick={() => handleEditClick(ta.enrollment)}>
                        <MdEdit />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(ta.enrollment)}>
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Enrollment No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Contact Number</th>
                    <th>Faculty ID</th>
                    <th>Teaching Semester</th>
                    <th>Teaching Courses</th>
                    <th>Semester</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map((ta, index) => (
                    <tr key={index}>
                      <td>{ta.enrollment}</td>
                      <td>{ta.studentName}</td>
                      <td>{ta.studentEmail}</td>
                      <td>{ta.contactNumber}</td>
                      <td>{ta.facultyId}</td>
                      <td>{ta.teachingSemester}</td>
                      <td>{ta.teachingCourses}</td>
                      <td>{ta.semester}</td>
                      <td className="actions">
                        <div className="action-buttons">
                          <button className="edit-btn" onClick={() => handleEditClick(ta.enrollment)}>
                            <MdEdit />
                          </button>
                          <button className="delete-btn" onClick={() => handleDelete(ta.enrollment)}>
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
            <p>No TAs found.</p>
          )}
        </div>
      )}
      <div className="pagination-container">
        <button
          className={`pagination-button ${currentPage === 1 ? 'disabled-button' : ''}`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
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

export default TA_home;
