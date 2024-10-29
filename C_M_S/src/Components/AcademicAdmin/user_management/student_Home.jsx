import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from "../../../lib/api-client";
import { GETSTUDENTS_ROUTE, DELETESTUDENT_ROUTE, SEARCHSTUDENTS_ROUTE } from "../../../utils/constants";


const StudentHome = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]); // Original student list
  const [filteredStudents, setFilteredStudents] = useState([]); // Filtered list
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
    fetchStudents(); // Fetch students on mount
  }, []);

  const handleEditClick = (enrollment) => {
    navigate(`/academic-admin/user_management/student_form/${enrollment}`);
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(GETSTUDENTS_ROUTE, { withCredentials: true });
      setStudents(response.data.students);
      setFilteredStudents(response.data.students); // Set initial filtered list
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while fetching students.");
    } finally {
      setLoading(false);
    }
  };

  // Delete student function
  const handleDelete = async (enrollmentNo) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await apiClient.delete(DELETESTUDENT_ROUTE(enrollmentNo), { withCredentials: true });
        const updatedStudents = students.filter(student => student.enrollmentNo !== enrollmentNo);
        setStudents(updatedStudents); // Update original state
        setFilteredStudents(updatedStudents); // Update filtered state as well
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred while deleting the student.");
      }
    }
  };

  // Client-side search function
  const handleSearchInput = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter students based on the search query across multiple fields
    const filtered = students.filter(student => 
      student.enrollmentNo.toString().toLowerCase().includes(query) || // Convert enrollmentNo to string
      student.name.toLowerCase().includes(query) ||
      student.CollegeEmail.toLowerCase().includes(query) ||
      student.degree.toLowerCase().includes(query) ||
      student.branch.toLowerCase().includes(query) ||
      student.semester.toString().includes(query) || // Convert semester to string
      student.contactNumber.toString().includes(query) // Convert contactNumber to string
    );

    setFilteredStudents(filtered);
  };

  // Render a mobile/tablet view or desktop view based on screen size
  return (
    <div className="Home">
      <h2 className='responsive'>Student Management</h2>
      <div className="search_add">
        <input
          type="text"
          placeholder="Search students"
          className="search_input"
          value={searchQuery}
          onChange={handleSearchInput} // Update search input and filter list
        />
        <button className="user_btn" onClick={() => navigate('/academic-admin/user_management/student_form')}>Add User</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="table-container">
          {filteredStudents.length > 0 ? (
            screenSize < 768 ? (
              // Mobile/Tablet view: Render a simple list or cards
              <div className="user-table">
                {filteredStudents.map((student, index) => (
                  <div key={index} className="student-card" style={{border:"2px solid black", marginTop:"10px", padding:"10px"}}>
                    <p><strong>Enrollment No:</strong> {student.enrollmentNo}</p>
                    <p><strong>Name:</strong> {student.name}</p>
                    <p><strong>Email:</strong> {student.CollegeEmail}</p>
                    <p><strong>Phone No:</strong> {student.contactNumber}</p>
                    <p><strong>Degree:</strong> {student.degree}</p>
                    <p><strong>Branch:</strong> {student.branch}</p>
                    <p><strong>Semester:</strong> {student.semester}</p>
                    <div className="actions">
                      <button className="edit-btn" onClick={() => handleEditClick(student.enrollmentNo)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(student.enrollmentNo)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop view: Render a table
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
                  {filteredStudents.map((student, index) => (
                    <tr key={index}>
                      <td>{student.enrollmentNo}</td>
                      <td>{student.name}</td>
                      <td>{student.CollegeEmail}</td>
                      <td>{student.degree}</td>
                      <td>{student.branch}</td>
                      <td>{student.semester}</td>
                      <td>{student.contactNumber}</td>
                      <td className="actions">
                        <button className="edit-btn" onClick={() => handleEditClick(student.enrollmentNo)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(student.enrollmentNo)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            <p>No students found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentHome;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { apiClient } from "../../lib/api-client";
// import { GETSTUDENTS_ROUTE, DELETESTUDENT_ROUTE } from "../../utils/constants";

// const StudentHome = () => {
//   const navigate = useNavigate();
//   const [students, setStudents] = useState([]); // Original student list
//   const [filteredStudents, setFilteredStudents] = useState([]); // Filtered list
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     fetchStudents(); // Fetch students on mount
//   }, []);

//   const handleEditClick = (enrollment) => {
//     navigate(`/user_management/student_form/${enrollment}`);
//   };

//   const fetchStudents = async () => {
//     setLoading(true);
//     try {
//       const response = await apiClient.get(GETSTUDENTS_ROUTE, { withCredentials: true });
//       setStudents(response.data.students);
//       setFilteredStudents(response.data.students); // Set initial filtered list
//     } catch (err) {
//       setError(err.response?.data?.message || "An error occurred while fetching students.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Delete student function
//   const handleDelete = async (enrollmentNo) => {
//     if (window.confirm('Are you sure you want to delete this student?')) {
//       try {
//         await apiClient.delete(DELETESTUDENT_ROUTE(enrollmentNo), { withCredentials: true });
//         const updatedStudents = students.filter(student => student.enrollmentNo !== enrollmentNo);
//         setStudents(updatedStudents); // Update original state
//         setFilteredStudents(updatedStudents); // Update filtered state as well
//       } catch (err) {
//         setError(err.response?.data?.message || "An error occurred while deleting the student.");
//       }
//     }
//   };

//   // Client-side search function
//   const handleSearchInput = (e) => {
//     const query = e.target.value.toLowerCase();
//     setSearchQuery(query);

//     // Filter students based on the search query across multiple fields
//     const filtered = students.filter(student => 
//       student.enrollmentNo.toString().toLowerCase().includes(query) || // Convert enrollmentNo to string
//       student.name.toLowerCase().includes(query) ||
//       student.CollegeEmail.toLowerCase().includes(query) ||
//       student.degree.toLowerCase().includes(query) ||
//       student.branch.toLowerCase().includes(query) ||
//       student.semester.toString().includes(query) || // Convert semester to string
//       student.contactNumber.toString().includes(query) // Convert contactNumber to string
//     );

//     setFilteredStudents(filtered);
//   };

//   return (
//     <div className="Home">
//       <h2>Student Management</h2>
//       <div className="search_add">
//         <input
//           type="text"
//           placeholder="Search students"
//           className="search_input"
//           value={searchQuery}
//           onChange={handleSearchInput} // Update search input and filter list
//         />
//         <button className="user_btn" onClick={() => navigate('/user_management/student_form')}>Add User</button>
//       </div>

//       {loading ? (
//         <p>Loading...</p>
//       ) : error ? (
//         <p>{error}</p>
//       ) : (
//         <div className="table-container">
//           {filteredStudents.length > 0 ? (
//             <table className="user-table">
//               <thead>
//                 <tr>
//                   <th>Enrollment No</th>
//                   <th>Name</th>
//                   <th>CollegeEmail Id</th>
//                   <th>Degree</th>
//                   <th>Branch</th>
//                   <th>Semester</th>
//                   <th>Phone No</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredStudents.map((student, index) => (
//                   <tr key={index}>
//                     <td>{student.enrollmentNo}</td>
//                     <td>{student.name}</td>
//                     <td>{student.CollegeEmail}</td>
//                     <td>{student.degree}</td>
//                     <td>{student.branch}</td>
//                     <td>{student.semester}</td>
//                     <td>{student.contactNumber}</td>
//                     <td className="actions">
//                       <button className="edit-btn" onClick={() => handleEditClick(student.enrollmentNo)}>Edit</button>
//                       <button className="delete-btn" onClick={() => handleDelete(student.enrollmentNo)}>Delete</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <p>No students found.</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default StudentHome;
