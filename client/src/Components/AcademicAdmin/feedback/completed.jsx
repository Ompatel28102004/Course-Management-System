import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from "../../../lib/api-client";
import { GETINACTIVEFEEDBACK_ROUTE, DELETEFEEDBACK_ROUTE } from "../../../utils/constants"; // Ensure these routes exist
import LoadingAnimation from "../../Loading/LoadingAnimation";
import { MdEdit, MdDelete } from "react-icons/md";

const Completed = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]); // Original feedback list
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]); // Filtered feedback list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [screenSize, setScreenSize] = useState(window.innerWidth); // Track screen size
  const [currentPage, setCurrentPage] = useState(1);
  const feedbacksPerPage = 5; // Set number of feedbacks per page

  // Track window resize to update screen size state
  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchFeedbacks(); // Fetch feedbacks on mount
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(GETINACTIVEFEEDBACK_ROUTE, { withCredentials: true });
      const sortedFeedback = response.data.feedbacks.sort((a, b) => {
        if (a.feedbackID < b.feedbackID) return -1;
        if (a.feedbackID > b.feedbackID) return 1;
        return 0;
      });
      setFeedbacks(sortedFeedback); // Set original feedback list
      setFilteredFeedbacks(sortedFeedback); // Initialize filtered list with full feedback list
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while fetching feedbacks.");
    } finally {
      setLoading(false);
    }
  };

  // Delete feedback function
  const handleDelete = async (feedbackID) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await apiClient.delete(DELETEFEEDBACK_ROUTE(feedbackID), { withCredentials: true });
        const updatedFeedbacks = feedbacks.filter(feedback => feedback.feedbackID !== feedbackID);
        setFeedbacks(updatedFeedbacks); // Update original list
        setFilteredFeedbacks(updatedFeedbacks); // Update filtered list as well
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred while deleting the feedback.");
      }
    }
  };

  // Client-side search function
  const handleSearchInput = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter feedbacks based on the search query across multiple fields
    const filtered = feedbacks.filter(feedback =>
      feedback.feedbackID.toLowerCase().includes(query) ||
      feedback.feedbackName.toLowerCase().includes(query) ||
      feedback.departmentID.toLowerCase().includes(query) ||
      feedback.branch.toLowerCase().includes(query) ||
      feedback.facultyName.toLowerCase().includes(query) ||
      feedback.courseName.toLowerCase().includes(query) ||
      new Date(feedback.startDateTime).toLocaleDateString('en-US').includes(query) ||
      new Date(feedback.endDateTime).toLocaleDateString('en-US').includes(query)
    );

    setFilteredFeedbacks(filtered); // Update filtered feedback list
    setCurrentPage(1); // Reset to first page after search
  };

  const handleEditClick = (feedbackID) => {
    navigate(`/academic-admin/feedback/add/${feedbackID}`); // Adjust the route accordingly
  };

  const indexOfLastFeedback = currentPage * feedbacksPerPage;
  const indexOfFirstFeedback = indexOfLastFeedback - feedbacksPerPage;
  const currentFeedbacks = filteredFeedbacks.slice(indexOfFirstFeedback, indexOfLastFeedback);
  const totalPages = Math.ceil(filteredFeedbacks.length / feedbacksPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="Home">
      <h2 className='responsive'>Completed Feedback</h2>
      <div className="search_add">
        <input
          type="text"
          placeholder="Search Feedback"
          className="search_input"
          value={searchQuery}
          onChange={handleSearchInput}
        />
      </div>

      {loading ? (
        <LoadingAnimation />
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="table-container">
          {filteredFeedbacks.length > 0 ? (
            screenSize < 768 ? (
              <div className="user-table">
                {currentFeedbacks.map((feedback, index) => (
                  <div key={index} className="feedback-card" style={{ border: "2px solid black", marginTop: "10px", padding: "10px" }}>
                    <p><strong>Feedback ID:</strong> {feedback.feedbackID}</p>
                    <p><strong>Name:</strong> {feedback.feedbackName}</p>
                    <p><strong>Department Name:</strong> {feedback.departmentID}</p>
                    <p><strong>Branch:</strong> {feedback.branch}</p>
                    <p><strong>Faculty Name:</strong> {feedback.facultyName}</p>
                    <p><strong>Course Name:</strong> {feedback.courseName}</p>
                    <p><strong>Start Date:</strong> {new Date(feedback.startDateTime).toLocaleString('en-US', {
                      year: 'numeric', month: '2-digit', day: '2-digit',
                      hour: '2-digit', minute: '2-digit', hour12: true
                    })}</p>
                    <p><strong>End Date:</strong> {new Date(feedback.endDateTime).toLocaleString('en-US', {
                      year: 'numeric', month: '2-digit', day: '2-digit',
                      hour: '2-digit', minute: '2-digit', hour12: true
                    })}</p>
                    <div className="action-buttons flex gap-10 justify-center align-middle">
                      <button className="edit-btn" onClick={() => handleEditClick(feedback.feedbackID)}>
                        <MdEdit />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(feedback.feedbackID)}>
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
                    <th>Feedback ID</th>
                    <th>Name</th>
                    <th>Department Name</th>
                    <th>Branch</th>
                    <th>Faculty Name</th>
                    <th>Course Name</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentFeedbacks.map((feedback, index) => (
                    <tr key={index}>
                      <td>{feedback.feedbackID}</td>
                      <td>{feedback.feedbackName}</td>
                      <td>{feedback.departmentID}</td>
                      <td>{feedback.branch}</td>
                      <td>{feedback.facultyName}</td>
                      <td>{feedback.courseName}</td>
                      <td>{new Date(feedback.startDateTime).toLocaleString('en-US', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit', hour12: true
                      })}</td>
                      <td>{new Date(feedback.endDateTime).toLocaleString('en-US', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit', hour12: true
                      })}</td>
                      <td className="actions">
                        <div className="action-buttons">
                          <button className="edit-btn" onClick={() => handleEditClick(feedback.feedbackID)}>
                            <MdEdit />
                          </button>
                          <button className="delete-btn" onClick={() => handleDelete(feedback.feedbackID)}>
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
            <p>No feedbacks found.</p>
          )}
        </div>
      )}

      {/* Pagination Controls */}
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
              key={index + 1}
              className={`pagination-button ${index + 1 === currentPage ? 'active-page' : ''}`}
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

export default Completed;
