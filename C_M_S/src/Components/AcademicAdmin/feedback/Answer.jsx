import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from "../../../lib/api-client";
import { GETINACTIVEFEEDBACK_ROUTE, GET_RESPONSES_ROUTE } from "../../../utils/constants"; // Ensure these routes exist

const Answer = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]); // Original feedback list
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]); // Filtered list based on search
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null); // Store selected feedback
  const [responses, setResponses] = useState([]); // Store responses for selected feedback
  const [screenSize, setScreenSize] = useState(window.innerWidth); // Track screen size

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
      setFeedbacks(response.data.feedbacks);
      setFilteredFeedbacks(response.data.feedbacks); // Initialize filtered list with full data
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while fetching feedbacks.");
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async (feedbackID) => {
    try {
      const response = await apiClient.get(GET_RESPONSES_ROUTE(feedbackID), { withCredentials: true });
      const parsedResponses = (response.data.responses || []).map((resp) => {
        if (typeof resp === "string") {
          return JSON.parse(resp);
        }
        return resp;
      });
      setResponses(parsedResponses);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while fetching responses.");
      setResponses([]); // Reset responses in case of error
    }
  };

  const showAnswer = (feedbackID) => {
    setSelectedFeedback(feedbackID);
    fetchResponses(feedbackID); // Fetch responses for the selected feedback
  };

  const handleSearchInput = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = feedbacks.filter((feedback) =>
      feedback.feedbackID.toString().toLowerCase().includes(query) ||
      feedback.feedbackName.toLowerCase().includes(query) ||
      feedback.departmentID.toLowerCase().includes(query) ||
      feedback.branch.toLowerCase().includes(query)
    );
    setFilteredFeedbacks(filtered); // Update filtered list
  };

  return (
    <div className="Home">
      <h2 className='responsive'>Responsed Feedback</h2>
      <div className="search_add">
        <input
          type="text"
          placeholder="Search Feedback"
          className="search_input"
          value={searchQuery}
          onChange={handleSearchInput} // Update search input and filter list
        />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="table-container">
          {filteredFeedbacks.length > 0 ? (
            screenSize < 768 ? (
              <div className="user-table">
                {filteredFeedbacks.map((feedback, index) => (
                  <div key={index} className="feedback-card" style={{ border: "2px solid black", marginTop: "10px", padding: "10px" }}>
                    <p><strong>Feedback ID:</strong> {feedback.feedbackID}</p>
                    <p><strong>Name:</strong> {feedback.feedbackName}</p>
                    <p><strong>Department Name:</strong> {feedback.departmentID}</p>
                    <p><strong>Branch:</strong> {feedback.branch}</p>
                    <div className="actions">
                      <button className="edit-btn" onClick={() => showAnswer(feedback.feedbackID)}>Answer</button>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedbacks.map((feedback, index) => (
                    <tr key={index}>
                      <td>{feedback.feedbackID}</td>
                      <td>{feedback.feedbackName}</td>
                      <td>{feedback.departmentID}</td>
                      <td>{feedback.branch}</td>
                      <td className="actions">
                        <button className="edit-btn" onClick={() => showAnswer(feedback.feedbackID)}>Answer</button>
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

      {selectedFeedback && (
        <div className="responses">
          <h3 className='responsive'>Responses for Feedback ID: {selectedFeedback}</h3>
          {Array.isArray(responses) && responses.length === 0 ? (
            <p>No responses available.</p>
          ) : (
            <div className="table-container">
              {Array.isArray(responses) && responses.length > 0 ? (
                screenSize < 768 ? (
                  <div className="response-cards">
                    {responses.map((response, index) => (
                      <div key={index} className="response-card" style={{ border: "2px solid black", marginTop: "10px", padding: "10px" }}>
                        <p><strong>Response #:</strong> {index + 1}</p> {/* Display index starting from 1 */}
                        {Array.isArray(response.answers) && response.answers.map((answer, idx) => (
                          <div key={idx}>
                            <strong>QID: {answer.questionID}</strong> - {answer.response}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>Response #</th>
                        <th>Answers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responses.map((response, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td> {/* Display index starting from 1 */}
                          <td>
                            {Array.isArray(response.answers) && response.answers.map((answer, idx) => (
                              <div key={idx}>
                                <strong>QID: {answer.questionID}</strong> - {answer.response}
                              </div>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                <p>No responses found.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Answer;
