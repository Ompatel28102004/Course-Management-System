import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from "../../../lib/api-client";
import { GETFACULTYS_ROUTE, DELETEFACULTY_ROUTE } from "../../../utils/constants";
import LoadingAnimation from "../../Loading/LoadingAnimation";
import { MdEdit, MdDelete, MdAddCircle } from "react-icons/md";

const FacultyHome = () => {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleEditClick = (facultyId) => {
    navigate(`/academic-admin/user_management/faculty_form/${facultyId}`);
  };

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(GETFACULTYS_ROUTE, { withCredentials: true });
      const sortedFaculty = response.data.faculty.sort((a, b) => a.facultyId - b.facultyId);
      setFaculty(sortedFaculty);
      setFilteredFaculty(sortedFaculty);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while fetching faculty.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (facultyId) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await apiClient.delete(DELETEFACULTY_ROUTE(facultyId), { withCredentials: true });
        const updatedFaculty = faculty.filter(member => member.facultyId !== facultyId);
        setFaculty(updatedFaculty);
        setFilteredFaculty(updatedFaculty);
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred while deleting the faculty member.");
      }
    }
  };

  const handleSearchInput = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = faculty.filter(member =>
      member.facultyId.toString().toLowerCase().includes(query) ||
      member.FirstName.toLowerCase().includes(query) ||
      member.LastName.toLowerCase().includes(query) ||
      member.department.toLowerCase().includes(query) ||
      member.CollegeEmail.toLowerCase().includes(query) ||
      member.contactNumber.toString().includes(query)
    );
    setFilteredFaculty(filtered);
    setCurrentPage(1); // Reset to first page on new search
  };

  const totalPages = Math.ceil(filteredFaculty.length / recordsPerPage);

  const paginate = (records) => {
    const start = (currentPage - 1) * recordsPerPage;
    return records.slice(start, start + recordsPerPage);
  };
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  return (
    <div className="Home">
      <h2 className='responsive'>Faculty Management</h2>
      <div className="search_add">
        <input
          type="text"
          placeholder="Search Faculty"
          className="search_input"
          value={searchQuery}
          onChange={handleSearchInput}
        />
        <button className="user_btn add" onClick={() => navigate('/academic-admin/user_management/faculty_form')}>
          <MdAddCircle className='icon' />Add Faculty
        </button>
      </div>

      {loading ? (
        <LoadingAnimation />
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="table-container">
          {filteredFaculty.length > 0 ? (
            screenSize < 768 ? (
              <div className="user-table">
                {paginate(filteredFaculty).map((member, index) => (
                  <div key={index} className="faculty-card" style={{ border: "2px solid black", marginTop: "10px", padding: "10px" }}>
                    <p><strong>Faculty ID:</strong> {member.facultyId}</p>
                    <p><strong>First Name:</strong> {member.FirstName}</p>
                    <p><strong>Last Name:</strong> {member.LastName}</p>
                    <p><strong>Department:</strong> {member.department}</p>
                    <p><strong>Email:</strong> {member.CollegeEmail}</p>
                    <p><strong>Contact Number:</strong> {member.contactNumber}</p>
                    <div className="action-buttons  flex gap-10 justify-center align-middle">
                      <button className="edit-btn" onClick={() => handleEditClick(member.facultyId)}>
                        <MdEdit />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(member.facultyId)}>
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
                    <th>Faculty ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Department</th>
                    <th>College Email</th>
                    <th>Contact Number</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(filteredFaculty).map((member, index) => (
                    <tr key={index}>
                      <td>{member.facultyId}</td>
                      <td>{member.FirstName}</td>
                      <td>{member.LastName}</td>
                      <td>{member.department}</td>
                      <td>{member.CollegeEmail}</td>
                      <td>{member.contactNumber}</td>
                      <td className="actions">
                        <div className="action-buttons">
                          <button className="edit-btn" onClick={() => handleEditClick(member.facultyId)}>
                            <MdEdit />
                          </button>
                          <button className="delete-btn" onClick={() => handleDelete(member.facultyId)}>
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
            <p>No faculty members found.</p>
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
      )}
    </div>
  );
};

export default FacultyHome;
