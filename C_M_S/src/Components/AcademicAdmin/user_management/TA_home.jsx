import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from "../../../lib/api-client";
import { GETTAS_ROUTE, DELETETA_ROUTE, SEARCHTAS_ROUTE } from "../../../utils/constants";

const TA_home = () => {
  const navigate = useNavigate();
  const [tas, setTAs] = useState([]); // Original TA list
  const [filteredTAs, setFilteredTAs] = useState([]); // Filtered TA list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [screenSize, setScreenSize] = useState(window.innerWidth); // Track screen size

  // Track window resize to update screen size state
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

        setTAs(taList); // Set original TA list
        setFilteredTAs(taList); // Initialize filtered list with the full TA list
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

  // Client-side search function
  const handleSearchInput = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter TAs based on the search query across multiple fields
    const filtered = tas.filter(ta =>
      ta.enrollment.toString().toLowerCase().includes(query) ||
      ta.facultyId.toString().toLowerCase().includes(query) ||
      ta.teachingSemester.toString().toLowerCase().includes(query) ||
      ta.teachingCourses.toLowerCase().includes(query) ||
      ta.studentName.toLowerCase().includes(query) ||
      ta.studentEmail.toLowerCase().includes(query) ||
      ta.contactNumber.toString().includes(query) || // Ensure contact number is converted to string
      ta.semester.toString().includes(query) // Convert semester to string for search
    );
    setFilteredTAs(filtered);
  };

  const handleEditClick = (enrollment) => {
    navigate(`/academic-admin/user_management/ta_form/${enrollment}`);
  };

  return (
    <div className="Home">
      <h2 className='responsive'>Teaching Assistant Management</h2>
      <div className="search_add">
        <input
          type="text"
          placeholder="Search TAs"
          className="search_input"
          value={searchQuery}
          onChange={handleSearchInput} // Update search input and filter list
        />
        <button className="user_btn" onClick={() => navigate('/academic-admin/user_management/ta_form')}>Add TA</button>
      </div>

      {/* {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Student ID</th>
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
              {filteredTAs.length > 0 ? (
                filteredTAs.map((ta, index) => (
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
                      <button className="edit-btn" onClick={() => handleEditClick(ta.enrollment)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(ta.enrollment)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9">No TAs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )} */}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="table-container">
          {filteredTAs.length > 0 ? (
            screenSize < 768 ? (
              // Mobile/Tablet view: Render a simple list or cards
              <div className="user-table">
                {filteredTAs.map((ta, index) => (
                  <div key={index} className="ta-card" style={{ border: "2px solid black", marginTop: "10px", padding: "10px" }}>
                    <p><strong>Student ID:</strong> {ta.enrollment}</p>
                    <p><strong>Name:</strong> {ta.studentName}</p>
                    <p><strong>Email:</strong> {ta.studentEmail}</p>
                    <p><strong>Contact Number:</strong> {ta.contactNumber}</p>
                    <p><strong>Faculty ID:</strong> {ta.facultyId}</p>
                    <p><strong>Teaching Semester:</strong> {ta.teachingSemester}</p>
                    <p><strong>Teaching Courses:</strong> {ta.teachingCourses}</p>
                    <p><strong>Semester:</strong> {ta.semester}</p>
                    <div className="actions">
                      <button className="edit-btn" onClick={() => handleEditClick(ta.enrollment)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(ta.enrollment)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop view: Render a table
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
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
                  {filteredTAs.map((ta, index) => (
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
                        <button className="edit-btn" onClick={() => handleEditClick(ta.enrollment)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(ta.enrollment)}>Delete</button>
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

    </div>
  );
};

export default TA_home;
