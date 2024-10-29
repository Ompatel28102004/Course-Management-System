import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from "../../../lib/api-client";
import { GETFACULTYS_ROUTE, DELETEFACULTY_ROUTE, SEARCHFACULTYS_ROUTE } from "../../../utils/constants";

const FacultyHome = () => {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState([]); // Original full faculty list
  const [filteredFaculty, setFilteredFaculty] = useState([]); // Filtered list based on search
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
    fetchFaculty(); // Fetch faculty on mount
  }, []);

  const handleEditClick = (facultyId) => {
    navigate(`/academic-admin/user_management/faculty_form/${facultyId}`);
  };

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(GETFACULTYS_ROUTE, { withCredentials: true });
      setFaculty(response.data.faculty);
      setFilteredFaculty(response.data.faculty); // Initialize filtered list with full data
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while fetching faculty.");
    } finally {
      setLoading(false);
    }
  };

  // Delete faculty function
  const handleDelete = async (facultyId) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await apiClient.delete(DELETEFACULTY_ROUTE(facultyId), { withCredentials: true });
        const updatedFaculty = faculty.filter(member => member.facultyId !== facultyId);
        setFaculty(updatedFaculty);
        setFilteredFaculty(updatedFaculty); // Update filtered list as well
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred while deleting the faculty member.");
      }
    }
  };

  // Search faculty based on input (client-side filtering)
  const handleSearchInput = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter faculty based on the search query across multiple fields
    const filtered = faculty.filter(member =>
      member.facultyId.toString().toLowerCase().includes(query) || // Convert facultyId to string
      member.FirstName.toLowerCase().includes(query) ||
      member.LastName.toLowerCase().includes(query) ||
      member.department.toLowerCase().includes(query) ||
      member.CollegeEmail.toLowerCase().includes(query) ||
      member.contactNumber.toString().includes(query) // Convert contactNumber to string
    );
    console.log(filtered)
    setFilteredFaculty(filtered);
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
          onChange={handleSearchInput} // Update search input and filter list
        />
        {/* <button className="user_btn" onClick={handleSearchInput}>Search</button> */}
        <button className="user_btn" onClick={() => navigate('/academic-admin/user_management/faculty_form')}>Add Faculty</button>
      </div>

      {loading ? (
  <p>Loading...</p>
) : error ? (
  <p>{error}</p>
) : (
  <div className="table-container">
    {filteredFaculty.length > 0 ? (
      screenSize < 768 ? (
        // Mobile/Tablet view: Render a simple list or cards
        <div className="user-table">
          {filteredFaculty.map((member, index) => (
            <div key={index} className="faculty-card" style={{border:"2px solid black", marginTop:"10px", padding:"10px"}}>
              <p><strong>Faculty ID:</strong> {member.facultyId}</p>
              <p><strong>First Name:</strong> {member.FirstName}</p>
              <p><strong>Last Name:</strong> {member.LastName}</p>
              <p><strong>Department:</strong> {member.department}</p>
              <p><strong>Email:</strong> {member.CollegeEmail}</p>
              <p><strong>Contact Number:</strong> {member.contactNumber}</p>
              <div className="actions">
                <button className="edit-btn" onClick={() => handleEditClick(member.facultyId)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(member.facultyId)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop view: Render a table
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
            {filteredFaculty.map((member, index) => (
              <tr key={index}>
                <td>{member.facultyId}</td>
                <td>{member.FirstName}</td>
                <td>{member.LastName}</td>
                <td>{member.department}</td>
                <td>{member.CollegeEmail}</td>
                <td>{member.contactNumber}</td>
                <td className="actions">
                  <button className="edit-btn" onClick={() => handleEditClick(member.facultyId)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(member.facultyId)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    ) : (
      <p>No faculty members found.</p>
    )}
  </div>
)}

    </div>
  );
};

export default FacultyHome;
