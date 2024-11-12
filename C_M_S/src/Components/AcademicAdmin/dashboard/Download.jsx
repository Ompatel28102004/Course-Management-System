import React, { useState } from 'react';
import { HOST } from "../../../utils/constants";
import { apiClient } from '../../../lib/api-client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Download = () => {
  const [role, setRole] = useState('');
  const [student, setStudent] = useState({
    branch: '',
    semester: '',
    degree: '',
  });
  const [faculty, setFaculty] = useState({
    department: '',
  });
  const [ta, setTA] = useState({
    teachingSem: '',
    facultyId: '',
  });
  const [course, setCourse] = useState({
    branch: '',
    semester: '',
    department: '',
    facultyId: '',
  });
  const [examDetail, setExamDetail] = useState({
    branch: '',
    semester: '',
    degree: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (role === 'student') {
      setStudent((prev) => ({ ...prev, [name]: value }));
    } else if (role === 'faculty') {
      setFaculty((prev) => ({ ...prev, [name]: value }));
    } else if (role === 'ta') {
      setTA((prev) => ({ ...prev, [name]: value }));
    } else if (role === 'course') {
      setCourse((prev) => ({ ...prev, [name]: value }));
    } else if (role === 'exam') {
      setExamDetail((prev) => ({ ...prev, [name]: value }));
    }
  };
  const resetForm = () => {
    setRole('');
    setStudent({
      branch: '',
      semester: '',
      degree: '',
    });
    setFaculty({
      department: '',
    });
    setTA({
      teachingSem: '',
      facultyId: '',
    });
    setCourse({
      branch: '',
      semester: '',
      department: '',
      facultyId: '',
    });
    setExamDetail({
      branch: '',
      semester: '',
      degree: '',
    });
  };  
  const generateStudentPDFReport = (studentsData) => {
    const doc = new jsPDF();

    // Define table headers
    const headers = [
      "Student Name",
      "Enrollment Number",
      "College Email",
      "Contact",
      "Gender",
      "Branch",
      "Semester",
      "Degree",
    ];

    // Map student data into rows format
    const rows = studentsData.map((data) => [
      `${data.FirstName} ${data.LastName}`,
      data.enrollment,
      data.CollegeEmail,
      data.Contact,
      data.Gender,
      data.Academic_info.Branch,
      data.Academic_info.Semester,
      data.Academic_info.Degree,
    ]);

    // Add title and heading
    doc.setFontSize(18);
    doc.text("Student Report", 105, 15, null, null, "center");
    doc.setFontSize(14);
    doc.text("Study Sync", 105, 25, null, null, "center");

    // Render table with headers and rows with header color
    doc.autoTable({
      startY: 40,
      head: [headers],
      body: rows,
      theme: "grid",
      headStyles: {
        fillColor: [220, 220, 220], // Light gray background color
        textColor: [0, 0, 0], // Black text color
        fontStyle: "bold", // Bold text for headers
      },
    });

    // Save the PDF with all students' data in one table
    doc.save("student-reports.pdf");
  };

  const generateFacultyPDFReport = (facultyData) => {
    const doc = new jsPDF();

    // Define table headers
    const headers = [
      "Faculty Name",
      "Faculty ID",
      "Department",
      "Contact",
      "Email",
      "designation",
      "Gender",
      "salary",
    ];

    // Map faculty data into rows format
    const rows = facultyData.map((data) => [
      `${data.FirstName} ${data.LastName}`,
      data.facultyId,
      data.department,
      data.contactNumber,
      data.CollegeEmail,
      data.designation,
      data.Gender,
      data.salary,
    ]);

    // Add title and heading
    doc.setFontSize(18);
    doc.text("Faculty Report", 105, 15, null, null, "center");
    doc.setFontSize(14);
    doc.text("Study Sync", 105, 25, null, null, "center");

    // Render table with headers and rows
    doc.autoTable({
      startY: 40,
      head: [headers],
      body: rows,
      theme: "grid",
      headStyles: {
        fillColor: [220, 220, 220], // Light gray background color
        textColor: [0, 0, 0], // Black text color
        fontStyle: "bold", // Bold text for headers
      },
    });

    // Save the PDF
    doc.save("faculty-reports.pdf");
  };

  const generateTAPDFReport = (taData) => {
    const doc = new jsPDF();

    // Define table headers
    const headers = [
      "Enrollment No",
      "Teaching Semester",
      "Teaching Courses",
      "Faculty ID",
      "stipendAmount",
    ];

    // Map TA data into rows format
    const rows = taData.map((data) => [
      data.enrollment,
      data.teachingSemester,
      data.teachingCourses,
      data.facultyId,
      data.stipendAmount,
    ]);

    // Add title and heading
    doc.setFontSize(18);
    doc.text("Teaching Assistant Report", 105, 15, null, null, "center");
    doc.setFontSize(14);
    doc.text("Study Sync", 105, 25, null, null, "center");

    // Render table with headers and rows
    doc.autoTable({
      startY: 40,
      head: [headers],
      body: rows,
      theme: "grid",
      headStyles: {
        fillColor: [220, 220, 220], // Light gray background color
        textColor: [0, 0, 0], // Black text color
        fontStyle: "bold", // Bold text for headers
      },
    });

    // Save the PDF
    doc.save("ta-reports.pdf");
  };

  const generateCoursePDFReport = (courseData) => {
    const doc = new jsPDF();

    // Define table headers
    const headers = [
      "Course Name",
      "Course Code",
      "Branch",
      "Semester",
      "Department",
      "Faculty ID",
      "Faculty Name",
      "Course Credit",
    ];

    // Map course data into rows format
    const rows = courseData.map((data) => [
      data.courseName,
      data.courseID,
      data.branch,
      data.semester,
      data.department,
      data.courseInstructorID,
      data.courseInstructorName,
      data.courseCredit,
    ]);

    // Add title and heading
    doc.setFontSize(18);
    doc.text("Course Report", 105, 15, null, null, "center");
    doc.setFontSize(14);
    doc.text("Study Sync", 105, 25, null, null, "center");

    // Render table with headers and rows
    doc.autoTable({
      startY: 40,
      head: [headers],
      body: rows,
      theme: "grid",
      headStyles: {
        fillColor: [220, 220, 220], // Light gray background color
        textColor: [0, 0, 0], // Black text color
        fontStyle: "bold", // Bold text for headers
      },
    });

    // Save the PDF
    doc.save("course-reports.pdf");
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
  
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };
  
  const generateExamPDFReport = (examData) => {
    const doc = new jsPDF();
  
    // Define table headers
    const headers = [
      "Exam Name",
      "Branch",
      "Semester",
      "Degree",
      "Start Date & Time",
      "End Date & Time",
    ];
  
    // Format the date and time properly for each row
    const rows = examData.map((data) => {
      const startDateTime = formatDate(data.ExamStartDate); // Use the custom formatDate function
      const endDateTime = formatDate(data.ExamEndDate); // Use the custom formatDate function
  
      return [
        data.ExamName,
        data.branch,
        data.semester,
        data.degree,
        startDateTime,  // Show both date and time
        endDateTime,    // Show both date and time
      ];
    });
  
    // Add title and heading
    doc.setFontSize(18);
    doc.text("Exam Report", 105, 15, null, null, "center");
    doc.setFontSize(14);
    doc.text("Study Sync", 105, 25, null, null, "center");
  
    // Render table with headers and rows
    doc.autoTable({
      startY: 40,
      head: [headers],
      body: rows,
      theme: "grid",
      headStyles: {
        fillColor: [220, 220, 220], // Light gray background color
        textColor: [0, 0, 0], // Black text color
        fontStyle: "bold", // Bold text for headers
      },
    });
  
    // Save the PDF
    doc.save("exam-reports.pdf");
  };
  
  const handleDownloadReport = async () => {
    setLoading(true);
    setError("");
    setToastMessage("");
    const queryParams = new URLSearchParams({
      role,
      ...(role === "student" && student),
      ...(role === "faculty" && faculty),
      ...(role === "ta" && ta),
      ...(role === "course" && course),
      ...(role === "exam" && examDetail),
    }).toString();

    try {
      const response = await apiClient.get(
        `${HOST}/api/academic-admin/report?${queryParams}`,
        { withCredentials: true }
      );
      const data = response.data.data;
      // Generate PDF based on role
      if (role === "student") {
        generateStudentPDFReport(data);
      } else if (role === "faculty") {
        generateFacultyPDFReport(data);
      } else if (role === "ta") {
        generateTAPDFReport(data);
      } else if (role === "course") {
        generateCoursePDFReport(data);
      } else if (role === "exam") {
        generateExamPDFReport(data);
      }

      // Set success message and show toast
      setToastMessage(`${role.charAt(0).toUpperCase() + role.slice(1)} report downloaded successfully as PDF.`);
      setShowToast(true);
      resetForm()
      setTimeout(() => setShowToast(false), 5000);
    } catch (err) {
      // Error handling
      setError(err.response?.data?.message || "An error occurred while fetching data");
      setToastMessage(err.response?.data?.message || "An error occurred");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="StudentForm">
      <div className="head">
        <h2 className="responsive">Report Download</h2>
        <button onClick={() => window.history.back()} className="user_btn back">
          Back
        </button>
      </div>
      <form className="student-form" noValidate>
        <label>Select Role:</label>
        <select value={role} onChange={handleRoleChange}>
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="ta">TA</option>
          <option value="course">Course</option>
          <option value="exam">Exam</option>
        </select>

        {role === 'student' && (
          <>
            <label>Branch:</label>
            <select name="branch" value={student.branch} onChange={handleInputChange}>
              <option value="">Select Branch</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>
            <label>Semester:</label>
            <select name="semester" value={student.semester} onChange={handleInputChange}>
              <option value={0}>Select Semester</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
            </select>
            <label>Degree:</label>
            <select name="degree" value={student.degree} onChange={handleInputChange}>
              <option value="">Select Degree</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="Ph.D">Ph.D</option>
            </select>
          </>
        )}

        {role === 'faculty' && (
          <>
            <label>Department:</label>
            <select name="department" value={faculty.department} onChange={handleInputChange}>
              <option value="">Select department</option>
              <option value="Computer department">Computer department</option>
              <option value="Mechanical department">Mechanical department</option>
              <option value="Electrical department">Electrical department</option>
              <option value="Civil department">Civil department</option>
              <option value="Physics department">Physics department</option>
              <option value="Maths department">Maths department</option>
              <option value="Chemistry department">Chemistry department</option>
              <option value="Humanities and Social Sciences department">Humanities and Social Sciences department</option>
            </select>
          </>
        )}

        {role === 'ta' && (
          <>
            <label>Teaching Semester:</label>
            <select name="teachingSem" value={ta.teachingSem} onChange={handleInputChange}>
              <option value={0}>Select Semester</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
            </select>
            <label>Faculty ID:</label>
            <input type="text" name="facultyId" value={ta.facultyId} onChange={handleInputChange} />
          </>
        )}

        {role === 'course' && (
          <>
            <label>Branch:</label>
            <select name="branch" value={course.branch} onChange={handleInputChange}>
              <option value="">Select Branch</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>
            <label>Semester:</label>
            <select name="semester" value={course.semester} onChange={handleInputChange}>
              <option value={0}>Select Semester</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
            </select>
            <label>Department:</label>
            <select name="department" value={course.department} onChange={handleInputChange}>
              <option value="">Select department</option>
              <option value="Computer department">Computer department</option>
              <option value="Mechanical department">Mechanical department</option>
              <option value="Electrical department">Electrical department</option>
              <option value="Civil department">Civil department</option>
            </select>
            <label>Faculty ID:</label>
            <input type="text" name="facultyId" value={course.facultyId} onChange={handleInputChange} />
          </>
        )}

        {role === 'exam' && (
          <>
            <label>Branch:</label>
            <select name="branch" value={examDetail.branch} onChange={handleInputChange}>
              <option value="">Select Branch</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>
            <label>Semester:</label>
            <select name="semester" value={examDetail.semester} onChange={handleInputChange}>
              <option value={0}>Select Semester</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
            </select>
            <label>Degree:</label>
            <select name="degree" value={examDetail.degree} onChange={handleInputChange}>
              <option value="">Select Degree</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="Ph.D">Ph.D</option>
            </select>
          </>
        )}

        <button type="button" onClick={handleDownloadReport} disabled={loading} style={{ gridColumn: -2 }}>
          {loading ? 'Loading...' : 'Download Report'}
        </button>
      </form>

      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">{toastMessage}</div>
      )}
    </div>
  );
};

export default Download;
