import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from "../../../lib/api-client";
import { GETSTUDENTS_ROUTE, DELETESTUDENT_ROUTE, SEARCHSTUDENTS_ROUTE } from "../../../utils/constants";
import LoadingAnimation from "../../Loading/LoadingAnimation";
import { MdEdit, MdDelete, MdAddCircle } from "react-icons/md";

const StudentHome = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
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
    fetchStudents();
  }, []);

  const handleEditClick = (enrollment) => {
    navigate(`/academic-admin/user_management/student_form/${enrollment}`);
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(GETSTUDENTS_ROUTE, { withCredentials: true });
      const sortedStudents = response.data.students.sort((a, b) => a.enrollmentNo - b.enrollmentNo);
      setStudents(sortedStudents);
      setFilteredStudents(sortedStudents);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while fetching students.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (enrollmentNo) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await apiClient.delete(DELETESTUDENT_ROUTE(enrollmentNo), { withCredentials: true });
        const updatedStudents = students.filter(student => student.enrollmentNo !== enrollmentNo);
        setStudents(updatedStudents);
        setFilteredStudents(updatedStudents);
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred while deleting the student.");
      }
    }
  };

  const handleSearchInput = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = students.filter(student =>
      student.enrollmentNo.toString().toLowerCase().includes(query) ||
      student.name.toLowerCase().includes(query) ||
      student.CollegeEmail.toLowerCase().includes(query) ||
      student.degree.toLowerCase().includes(query) ||
      student.branch.toLowerCase().includes(query) ||
      student.semester.toString().includes(query) ||
      student.contactNumber.toString().includes(query)
    );
    setFilteredStudents(filtered);
    setCurrentPage(1);
  };

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  return (
    <div className="Home">
      <h2 className='responsive'>Student Management</h2>
      <div className="search_add">
        <input
          type="text"
          placeholder="Search students"
          className="search_input"
          value={searchQuery}
          onChange={handleSearchInput}
        />
        <button className="user_btn add" onClick={() => navigate('/academic-admin/user_management/student_form')}>
          <MdAddCircle className='icon' /> Add Student
        </button>
      </div>

      {loading ? (
        <LoadingAnimation />
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="table-container">
          {currentStudents.length > 0 ? (
            screenSize < 768 ? (
              <div className="user-table">
                {currentStudents.map((student, index) => (
                  <div key={index} className="student-card" style={{ border: "2px solid black", marginTop: "10px", padding: "10px" }}>
                    <p><strong>Enrollment No:</strong> {student.enrollmentNo}</p>
                    <p><strong>Name:</strong> {student.name}</p>
                    <p><strong>Email:</strong> {student.CollegeEmail}</p>
                    <p><strong>Phone No:</strong> {student.contactNumber}</p>
                    <p><strong>Degree:</strong> {student.degree}</p>
                    <p><strong>Branch:</strong> {student.branch}</p>
                    <p><strong>Semester:</strong> {student.semester}</p>
                    <div className="action-buttons flex gap-10 justify-center align-middle">
                      <button className="edit-btn" onClick={() => handleEditClick(student.enrollmentNo)}>
                        <MdEdit />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(student.enrollmentNo)}>
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
                    <th>College Email Id</th>
                    <th>Degree</th>
                    <th>Branch</th>
                    <th>Semester</th>
                    <th>Phone No</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map((student, index) => (
                    <tr key={index}>
                      <td>{student.enrollmentNo}</td>
                      <td>{student.name}</td>
                      <td>{student.CollegeEmail}</td>
                      <td>{student.degree}</td>
                      <td>{student.branch}</td>
                      <td>{student.semester}</td>
                      <td>{student.contactNumber}</td>
                      <td className="actions">
                        <div className="action-buttons">
                          <button className="edit-btn" onClick={() => handleEditClick(student.enrollmentNo)}>
                            <MdEdit />
                          </button>
                          <button className="delete-btn" onClick={() => handleDelete(student.enrollmentNo)}>
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
            <p>No students found.</p>
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

export default StudentHome;
