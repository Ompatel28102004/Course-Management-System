import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from "../../../lib/api-client";
import {
  GETEXAMS_ROUTE,
  ADDEXAM_ROUTE,
  EDITEXAM_ROUTE,
  DELETEEXAM_ROUTE,
} from "../../../utils/constants";
import { MdEdit, MdDelete, MdAddCircle, MdCancel } from "react-icons/md";

const Exam = () => {
  const [activeExams, setActiveExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newExamData, setNewExamData] = useState({
    ExamName: "",
    degree: "",
    branch: "",
    semester: "",
    ExamStartDate: "",
  });
  const [editingExam, setEditingExam] = useState(null);
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [activeCurrentPage, setActiveCurrentPage] = useState(1);
  const feedbacksPerPage = 5; // Number of exams per page

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formRef = useRef(null);

  useEffect(() => {
    fetchActiveExams();
  }, []);

  const fetchActiveExams = async () => {
    try {
      const response = await apiClient.get(GETEXAMS_ROUTE, { withCredentials: true });
      setActiveExams(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while fetching active exams.");
    }
  };

  const formatDateForInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmitExam = async (e) => {
    e.preventDefault();
    try {
      const examData = { ...newExamData };

      if (editingExam) {
        await apiClient.put(EDITEXAM_ROUTE(editingExam._id), examData, { withCredentials: true });
      } else {
        await apiClient.post(ADDEXAM_ROUTE, examData, { withCredentials: true });
      }

      resetForm();
      fetchActiveExams();
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while adding/editing the exam.");
    }
  };

  const resetForm = () => {
    setNewExamData({
      ExamName: "",
      degree: "",
      branch: "",
      semester: "",
      ExamStartDate: "",
    });
    setEditingExam(null);
    setShowForm(false);
  };

  const handleEditExam = (exam) => {
    setEditingExam(exam);
    setNewExamData({
      ExamName: exam.ExamName,
      degree: exam.degree,
      branch: exam.branch,
      semester: exam.semester,
      ExamStartDate: exam.ExamStartDate,
      ExamEndDate: exam.ExamEndDate,
    });
    setShowForm(true);
    // Delay scrolling to ensure the form is rendered
    setTimeout(() => {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handleDelete = async (examID) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await apiClient.delete(DELETEEXAM_ROUTE(examID), { withCredentials: true });
        fetchActiveExams();
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred while deleting the exam.");
      }
    }
  };

  // Pagination for active exams
  const indexOfLastExam = activeCurrentPage * feedbacksPerPage;
  const indexOfFirstExam = indexOfLastExam - feedbacksPerPage;
  const currentActiveExams = activeExams.slice(indexOfFirstExam, indexOfLastExam);
  const totalActivePages = Math.ceil(activeExams.length / feedbacksPerPage);

  const handleActivePageChange = (pageNumber) => {
    setActiveCurrentPage(pageNumber);
  };

  return (
    <div className="Home">
      <h2 className='responsive mb-4'>Upcoming Exams</h2>
      <div className="table-container">
        {activeExams.length > 0 ? (
          screenSize < 768 ? (
            <div className="user-table">
              {currentActiveExams.map((exam, index) => (
                <div key={index} className="exam-card" style={{ border: "2px solid black", marginTop: "10px", padding: "10px" }}>
                  <p><strong>Exam Name:</strong> {exam.ExamName}</p>
                  <p><strong>Degree:</strong> {exam.degree}</p>
                  <p><strong>Branch:</strong> {exam.branch}</p>
                  <p><strong>Semester:</strong> {exam.semester}</p>
                  <p><strong>Start Date:</strong> {new Date(exam.ExamStartDate).toLocaleString()}</p>
                  <p><strong>End Date:</strong> {new Date(exam.ExamEndDate).toLocaleString()}</p>
                  <div className="action-buttons flex gap-10 justify-center align-middle">
                    <button className="edit-btn" onClick={() => handleEditExam(exam)}>
                      <MdEdit />
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(exam._id)}>
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
                  <th>Exam Name</th>
                  <th>Degree</th>
                  <th>Branch</th>
                  <th>Semester</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentActiveExams.map((exam, index) => (
                  <tr key={index}>
                    <td>{exam.ExamName}</td>
                    <td>{exam.degree}</td>
                    <td>{exam.branch}</td>
                    <td>{exam.semester}</td>
                    <td>{new Date(exam.ExamStartDate).toLocaleString()}</td>
                    <td>{new Date(exam.ExamEndDate).toLocaleString()}</td>
                    <td className="actions">
                      <div className="action-buttons">
                        <button className="edit-btn" onClick={() => handleEditExam(exam)}>
                          <MdEdit />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(exam._id)}>
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
          <p>No exams found.</p>
        )}
        <div className="pagination-container">
          <button
            className={`pagination-button ${activeCurrentPage === 1 ? 'disabled-button' : ''}`}
            onClick={() => handleActivePageChange(activeCurrentPage - 1)}
            disabled={activeCurrentPage === 1}
          >
            Previous
          </button>
          <div className="page-numbers">
            {[...Array(totalActivePages)].map((_, index) => (
              <button
                key={index + 1}
                className={`pagination-button ${index + 1 === activeCurrentPage ? 'active-page' : ''}`}
                onClick={() => handleActivePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button
            className={`pagination-button ${activeCurrentPage === totalActivePages ? 'disabled-button' : ''}`}
            onClick={() => handleActivePageChange(activeCurrentPage + 1)}
            disabled={activeCurrentPage === totalActivePages}
          >
            Next
          </button>
        </div>
      </div>
      <button
        className="user_btn add w-52 mt-4"
        onClick={() => {
          if (showForm) {
            // If hiding the form, scroll to the top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            resetForm();
          } else {
            // If showing the form, scroll to it
            setShowForm(true);
            setTimeout(() => {
              formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 0);
          }
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
            <span>Add Exam</span>
          </>
        )}
      </button>

      {showForm && (
        <form ref={formRef} onSubmit={handleSubmitExam} className="student-form">
          <label>Exam Name:</label>
          <select
            value={newExamData.ExamName}
            onChange={(e) => setNewExamData({ ...newExamData, ExamName: e.target.value })}
            required
          >
            <option value="">Select Exam Name</option>
            <option value="Class Test 1">Class Test 1</option>
            <option value="Class Test 2">Class Test 2</option>
            <option value="Mid Semester">Mid Semester</option>
            <option value="End Semester">End Semester</option>
          </select>
          <label>Degree:</label>
          <select
            value={newExamData.degree}
            onChange={(e) => setNewExamData({ ...newExamData, degree: e.target.value })}
            required
          >
            <option value="">Select Degree</option>
            <option value="B.Tech">B.Tech</option>
            <option value="M.Tech">M.Tech</option>
            <option value="Ph.D">Ph.D</option>
          </select>
          <label>Branch:</label>
          <select
            value={newExamData.branch}
            onChange={(e) => setNewExamData({ ...newExamData, branch: e.target.value })}
            required
          >
            <option value="">Select Branch</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
          </select>
          <label>Semester:</label>
          <select
            value={newExamData.semester}
            onChange={(e) => setNewExamData({ ...newExamData, semester: parseInt(e.target.value, 10) })}
            required
          >
            <option value="">Select Semester</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
          </select>
          <label>Start Date:</label>
          <input
            type="datetime-local"
            value={formatDateForInput(newExamData.ExamStartDate)}
            onChange={(e) => setNewExamData({ ...newExamData, ExamStartDate: e.target.value })}
            required
          />
          <button type="submit" className="submit-btn" style={{ width: "90%", gridColumn: -2 }}>
            {editingExam ? 'Update' : 'Submit'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Exam;
