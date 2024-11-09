import React, { useState, useEffect } from "react";
import axios from "axios";
import { HOST } from "../../../utils/constants";
import "./Attendance.css";
import Toast from "../../Toast/Toast";

const Attendance = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseRefID, setSelectedCourseRefID] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState({
    present: 0,
    absent: 0,
    leave: 0,
    totalLectures: 0,
  });
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");

  const showToastNotification = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 5000);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseRefID) {
      fetchStudentAttendance(selectedCourseRefID);
    }
  }, [selectedCourseRefID]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${HOST}/api/student/get-course-data`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId },
      });
      const acceptedCourses = response.data.Courses.filter(
        (course) => course.enroll_req_accepted
      );
      setCourses(acceptedCourses.length !== 0 ? acceptedCourses : [{Course_Id: "", Course_Name: "No Courses Enrolled"}]);
      setSelectedCourseRefID(acceptedCourses.length !== 0 ? acceptedCourses[0].RefID : "");
      if(acceptedCourses.length === 0){showToastNotification("No Course Enrolled this semester. If you have requested for course enrollment, Please contact faculty."), setLoading(false)}
    } catch (error) {
      console.error("Error fetching courses", error);
      showToastNotification(`Error fetching courses ${error}`);
    }
  };

  const fetchStudentAttendance = async (RefID) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${HOST}/api/student/get-student-attendance`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { RefID, userId },
        }
      );
      setAttendanceData(response.data.attendance);
      calculateSummary(response.data);
    } catch (error) {
      console.error("Error fetching attendance", error);
      showToastNotification(`Error fetching courses ${error}`);
      setAttendanceData([]);
      setSummary({ present: 0, absent: 0, leave: 0, totalLectures: 0 });
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const calculateSummary = (Data) => {
    const summary = {
      present: 0,
      absent: 0,
      leave: 0,
      totalLectures: Data.lecturesTaken,
    };
    Data.attendance.forEach((day) => {
      if (day.status === "Present") summary.present++;
      if (day.status === "Absent") summary.absent++;
      if (day.status === "Leave") summary.leave++;
    });
    setSummary(summary);
  };

  const handleMonthChange = (direction) => {
    let newMonth = currentMonth + direction;
    if (newMonth > 11) {
      newMonth = 0;
      setCurrentYear(currentYear + 1);
    } else if (newMonth < 0) {
      newMonth = 11;
      setCurrentYear(currentYear - 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleYearChange = (e) => {
    setCurrentYear(parseInt(e.target.value));
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const filterAttendanceByMonthAndYear = (attendance) => {
    return attendance.filter((day) => {
      const date = new Date(day.date);
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    });
  };

  const renderDay = (index) => {
    const day = attendanceData.find(
      (d) => new Date(d.date).getDate() === index + 1
    );
    const isCorrectDate = new Date(day?.date);
    let statusClass = "no-record";
    if (
      isCorrectDate.getMonth() !== currentMonth ||
      isCorrectDate.getFullYear() !== currentYear
    ) {
      statusClass = "no-record";
    } else {
      if (day?.status === "Present") statusClass = "present";
      else if (day?.status === "Absent") statusClass = "absent";
      else if (day?.status === "Leave") statusClass = "leave";
    }
    return (
      <div key={index} className={`day ${statusClass}`}>
        {index + 1}
      </div>
    );
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const filteredAttendance = filterAttendanceByMonthAndYear(attendanceData);

  return (
    <div className="attendance-container">
      <h1 className="attendance-heading">Attendance Sheet</h1>

      <div className="controls">
        <div className="course-selector">
          <label>Select Course: </label>
          <select
            onChange={(e) => setSelectedCourseRefID(e.target.value)}
            value={selectedCourseRefID}
          >
            {courses.map((course) => (
              <option key={course.Course_Id} value={course.RefID}>
                {course.Course_Name} ({course.Course_Id})
              </option>
            ))}
          </select>
        </div>
        <div className="month-year-selector">
          <div className="month-year">
            <select
              onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
              value={currentMonth}
            >
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index} value={index}>
                  {new Date(0, index).toLocaleString("en-US", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
            <select onChange={handleYearChange} value={currentYear}>
              {Array.from({ length: 10 }, (_, index) => {
                const year = currentYear - 7 + index;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Lectures</h3>
          <p>{summary.totalLectures}</p>
        </div>
        <div className="summary-card">
          <h3>Present</h3>
          <p>{summary.present}</p>
        </div>
        <div className="summary-card">
          <h3>Absent</h3>
          <p>{summary.absent}</p>
        </div>
        <div className="summary-card">
          <h3>Leave</h3>
          <p>{summary.leave}</p>
        </div>
        <div className="summary-card">
          <h3>Attendance Percentage</h3>
          <p>{((summary.present / summary.totalLectures) * 100).toFixed(2)}%</p>
        </div>
      </div>

      <div className="calendar-strip-container">
        <button
          className="arrow-btn-left"
          onClick={() => handleMonthChange(-1)}
        >
          &lt;
        </button>
        <div className="calendar-strip">
          {Array.from({ length: daysInMonth }, (_, index) => renderDay(index))}
        </div>
        <button
          className="arrow-btn-right"
          onClick={() => handleMonthChange(1)}
        >
          &gt;
        </button>
      </div>

      <div className={`attendance-details ${loading ? "loading" : ""}`}>
        <h3 className="attendance-details-heading">Attendance Details</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="shimmer-container">
                  <td>
                    <div className="shimmer"></div>
                  </td>
                  <td>
                    <div className="shimmer"></div>
                  </td>
                  <td>
                    <div className="shimmer"></div>
                  </td>
                  <td>
                    <div className="shimmer"></div>
                  </td>
                </tr>
              ))
            ) : filteredAttendance.length > 0 && loading === false ? (
              filteredAttendance.map((day, index) => (
                <tr key={index}>
                  <td>{new Date(day.date).toLocaleDateString()}</td>
                  <td>
                    {new Date(day.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>{day.attendanceType}</td>
                  <td className={day.status}>{day.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">
                  No attendance data available for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
};

export default Attendance;
