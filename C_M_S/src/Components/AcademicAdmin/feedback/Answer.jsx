import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from "../../../lib/api-client";
import { GETINACTIVEFEEDBACK_ROUTE, GET_RESPONSES_ROUTE } from "../../../utils/constants";
import LoadingAnimation from "../../Loading/LoadingAnimation";

const Answer = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responses, setResponses] = useState([]);
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  
  // Reference for the responses section
  const responsesRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchFeedbacks();
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
      setFeedbacks(sortedFeedback);
      setFilteredFeedbacks(sortedFeedback);
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
      setTimeout(() => {
        responsesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while fetching responses.");
      setResponses([]);
    }
  };

  const showAnswer = (feedbackID) => {
    setSelectedFeedback(feedbackID);
    fetchResponses(feedbackID);
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
    setFilteredFeedbacks(filtered);
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
        <div  className="responses"> {/* Reference added here */}
          <h3 className='responsive'>Responses for Feedback ID: {selectedFeedback}</h3>
          {Array.isArray(responses) && responses.length === 0 ? (
            <p>No responses available.</p>
          ) : (
            <div className="table-container" ref={responsesRef}>
              {Array.isArray(responses) && responses.length > 0 ? (
                screenSize < 768 ? (
                  <div className="response-cards">
                    {responses.map((response, index) => (
                      <div key={index} className="response-card" style={{ border: "2px solid black", marginTop: "10px", padding: "10px" }}>
                        <p><strong>Response #:</strong> {index + 1}</p>
                        {Array.isArray(response.answers) && response.answers.map((answer, idx) => (
                          <div key={idx}>
                            <strong>QID: {answer.questionID}</strong> - {answer.response}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <table className="user-table" ref={responsesRef}>
                    <thead>
                      <tr>
                        <th>Response #</th>
                        <th>Answers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responses.map((response, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
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
