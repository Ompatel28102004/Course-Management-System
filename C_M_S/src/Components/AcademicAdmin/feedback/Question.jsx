import React, { useState, useEffect, useRef ,useLayoutEffect} from 'react';
import { apiClient } from "../../../lib/api-client";
import { GETACTIVEQUESTIONS_ROUTE, GETINACTIVEQUESTIONS_ROUTE, ADDQUESTION_ROUTE, EDITQUESTION_ROUTE, DELETEQUESTION_ROUTE } from "../../../utils/constants";
import { MdEdit, MdDelete, MdAddCircle, MdCancel } from "react-icons/md";

const Question = () => {
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [inactiveQuestions, setInactiveQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [responseType, setResponseType] = useState('text');
  const [questionID, setQuestionID] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [screenSize, setScreenSize] = useState(window.innerWidth); // Track screen size

  // Track window resize to update screen size state
  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Create a ref for the form
  const formRef = useRef(null);
  useLayoutEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm]); // Trigger scroll when showForm changes to true
  useEffect(() => {
    fetchActiveQuestions();
    fetchInactiveQuestions();
  }, []);

  const fetchActiveQuestions = async () => {
    try {
      const response = await apiClient.get(GETACTIVEQUESTIONS_ROUTE, { withCredentials: true });
      setActiveQuestions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while fetching active questions.");
    }
  };

  const fetchInactiveQuestions = async () => {
    try {
      const response = await apiClient.get(GETINACTIVEQUESTIONS_ROUTE, { withCredentials: true });
      setInactiveQuestions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while fetching inactive questions.");
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    try {
      const questionData = {
        questionID: editingQuestion ? editingQuestion.questionID : (questionID || generateUniqueID()),
        questionText: newQuestionText,
        isActive,
        responseType
      };

      if (editingQuestion) {
        await apiClient.put(EDITQUESTION_ROUTE(editingQuestion.questionID), questionData, { withCredentials: true });
      } else {
        await apiClient.post(ADDQUESTION_ROUTE, questionData, { withCredentials: true });
      }

      resetForm();
      fetchActiveQuestions();
      fetchInactiveQuestions();
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while adding/editing the question.");
    }
  };

  const resetForm = () => {
    setNewQuestionText("");
    setIsActive(true);
    setResponseType('text');
    setQuestionID("");
    setEditingQuestion(null);
    setShowForm(false);
  };

  const generateUniqueID = () => {
    return `q-${Date.now()}`;
  };

  // Scroll to the form when editing a question
  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionID(question.questionID);
    setNewQuestionText(question.questionText);
    setIsActive(question.isActive);
    setResponseType(question.responseType);
    setShowForm(true);
    // Delay scrolling to ensure the form is rendered
    setTimeout(() => {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handleDelete = async (questionID) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await apiClient.delete(DELETEQUESTION_ROUTE(questionID), { withCredentials: true });
        setActiveQuestions(activeQuestions.filter(question => question.questionID !== questionID));
        setInactiveQuestions(inactiveQuestions.filter(question => question.questionID !== questionID));
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred while deleting the question.");
      }
    }
  };

  return (
    <div className="Home">
      <h2 className='responsive mb-3'>Active Questions</h2>
      {
        <div className="table-container">
          {activeQuestions.length > 0 ? (
            screenSize < 768 ? (
              // Mobile/Tablet view: Render a simple list or cards
              <div className="user-table">
                {activeQuestions.map((question, index) => (
                  <div key={index} className="question-card" style={{ border: "2px solid black", marginTop: "10px", padding: "10px" }}>
                    <p><strong>Question ID:</strong> {question.questionID}</p>
                    <p><strong>Question Text:</strong> {question.questionText}</p>
                    <p><strong>Status:</strong> Active</p>
                    <div className="action-buttons flex gap-10 justify-center align-middle">
                      <button className="edit-btn" onClick={() => handleEditQuestion(question)}>
                        <MdEdit />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(question.questionID)}>
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
                    <th>Question ID</th>
                    <th>Question Text</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeQuestions.map((question, index) => (
                    <tr key={index}>
                      <td>{question.questionID}</td>
                      <td>{question.questionText}</td>
                      <td>Active</td>
                      <td className="actions">
                        <div className="action-buttons">
                          <button className="edit-btn" onClick={() => handleEditQuestion(question)}>
                            <MdEdit />
                          </button>
                          <button className="delete-btn" onClick={() => handleDelete(question.questionID)}>
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
            <p>No questions found.</p>
          )}
        </div>
      }


      <h2 className='responsive mb-3 mt-3'>Inactive Questions</h2>
      {
        <div className="table-container">
          {inactiveQuestions.length > 0 ? (
            screenSize < 768 ? (
              // Mobile/Tablet view: Render a simple list or cards
              <div className="user-table">
                {inactiveQuestions.map((question, index) => (
                  <div key={index} className="question-card" style={{ border: "2px solid black", marginTop: "10px", padding: "10px" }}>
                    <p><strong>Question ID:</strong> {question.questionID}</p>
                    <p><strong>Question Text:</strong> {question.questionText}</p>
                    <p><strong>Status:</strong> Inactive</p>
                    <div className="action-buttons flex gap-10 justify-center align-middle">
                      <button className="edit-btn" onClick={() => handleEditQuestion(question)}>
                        <MdEdit />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(question.questionID)}>
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
                    <th>Question ID</th>
                    <th>Question Text</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inactiveQuestions.map((question, index) => (
                    <tr key={index}>
                      <td>{question.questionID}</td>
                      <td>{question.questionText}</td>
                      <td>Inactive</td>
                      <td className="actions">
                        <div className="action-buttons">
                          <button className="edit-btn" onClick={() => handleEditQuestion(question)}>
                            <MdEdit />
                          </button>
                          <button className="delete-btn" onClick={() => handleDelete(question.questionID)}>
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
            <p>No inactive questions found.</p>
          )}
        </div>
      }

      <button
        className="user_btn add w-52 mt-3"
        onClick={() => {
          if (showForm) {
            // When closing the form, reset both the form data and editing state
            resetForm();
          } else {
            // If opening the form, clear editing and reset form data to empty
            setEditingQuestion(null);
            setNewQuestionText("");
            setIsActive(true);
            setResponseType('text');
            setQuestionID("");
          }
          setShowForm(!showForm); // Toggle the form
        }}
      >
        {showForm ? (
          <>
            <MdCancel className="icon" />
            <span>Cancel</span>
          </>
        ) : (
          <>
            <MdAddCircle className="icon" />
            <span>Add Question</span>
          </>
        )}
      </button>


      {/* Form ref added here */}
      {showForm && (
        <form ref={formRef} onSubmit={handleSubmitQuestion} className="student-form">
          <label>Enter Question ID: </label>
          <input
            type="text"
            value={questionID}
            onChange={(e) => setQuestionID(e.target.value)}
            required
            disabled={!!editingQuestion}
          />
          <label>Enter Question Text: </label>
          <input
            type="text"
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            required
          />
          <label>Active:</label>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label>Response Type:</label>
          <select
            value={responseType}
            onChange={(e) => setResponseType(e.target.value)}
            required
          >
            <option value="rating">Rating</option>
            <option value="text">Text</option>
          </select>
          <button type="submit" className="submit-btn" style={{ width: "90%", gridColumn: -2 }}>{editingQuestion ? 'Update' : 'Submit'}</button>
        </form>
      )}
    </div>
  );
};

export default Question;
