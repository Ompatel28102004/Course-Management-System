import React, { useState, useEffect } from 'react';
import { apiClient } from "../../../lib/api-client";
import { HOST } from "../../../utils/constants";
import {
  PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer
} from 'recharts';
import LoadingAnimation from "../../Loading/LoadingAnimation";
const Home = () => {
  const [overviewData, setOverviewData] = useState({
    students: { total: 0, byDegree: [] },
    faculty: { total: 0, byDepartment: [] },
    courses: { total: 0, byDepartment: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const response = await apiClient.get(`${HOST}/api/academic-admin/overview`, { withCredentials: true });
        setOverviewData(response.data.data);
      } catch (err) {
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  if (loading) return <LoadingAnimation />;
  if (error) return <p>Error: {error}</p>;

  // Prepare data for charts with percentage labels
  const studentDegreeData = overviewData.students.byDegree.map((degree) => ({
    name: degree._id,
    count: degree.count,
    percentage: ((degree.count / overviewData.students.total) * 100).toFixed(2)
  }));

  const facultyDepartmentData = overviewData.faculty.byDepartment.map((dept) => ({
    name: dept._id,
    count: dept.count,
    percentage: ((dept.count / overviewData.faculty.total) * 100).toFixed(2)
  }));

  const courseDepartmentData = overviewData.courses.byDepartment.map((dept) => ({
    name: dept._id,
    count: dept.count,
    percentage: ((dept.count / overviewData.courses.total) * 100).toFixed(2)
  }));

  // Colors for the pie slices
  // purple theme
  // const COLORS = ['#C58FEA', '#A964E0', '#8B3CD4', '#6D18C6', '#530B9B'];
  const COLORS = [
    "#A8C4E7", // darker mild blue
    "#C0AEE6", // darker mild lavender
    "#E4B6CC", // darker mild pink
    "#E3D79A", // darker mild yellow
    "#7D15A1", // darker purple
    "#A38DBE", // darker mild lavender
    "#8C9B8E", // darker sage green
    "#D2A3C7", // darker rosy mauve
    "#C1C8E4", // darker soft lilac
    "#B5CABF"  // darker pastel mint
  ];
  
  // const COLORS = [
  //   '#B21FDC', // Primary Purple
  //   '#F7B733', // Golden Yellow
  //   '#3498DB', // Bright Blue
  //   '#E74C3C', // Vivid Red
  //   '#2ECC71', // Green
  // ];
  // const COLORS = [
  //   "#FF6F61", // coral
  //   "#6B5B95", // muted violet
  //   "#88B04B", // leafy green
  //   "#F7CAC9", // rose quartz
  //   "#92A8D1"  // serenity blue
  // ];


  // Custom label to show percentage inside each slice
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12px"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="Home">
      <h2 className="responsive">Academic Dashboard</h2>
      <div className='graph'>
        {/* Students by Degree Chart */}
        <div className="chart-card">
          <h2 style={{ fontSize: "2rem" }}>Students</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={studentDegreeData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                stroke="none"
                label={renderCustomLabel} // Show custom label with percentage
                labelLine={false}
              >
                {studentDegreeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Faculty by Department Chart */}
        <div className="chart-card">
          <h2 style={{ fontSize: "2rem" }}>Faculty</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={facultyDepartmentData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                stroke="none"
                label={renderCustomLabel} // Show custom label with percentage
                labelLine={false}
              >
                {facultyDepartmentData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Courses by Department Chart */}
        <div className="chart-card">
          <h2 style={{ fontSize: "2rem" }}>Courses</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={courseDepartmentData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                stroke="none"
                label={renderCustomLabel} // Show custom label with percentage
                labelLine={false}
              >
                {courseDepartmentData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Home;
