import { useState } from "react";
import axios from "axios";
import { HOST } from "@/utils/constants";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { Button } from "../../../Components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../Components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../Components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../Components/ui/tabs";
import { Calendar } from "../../../Components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../Components/ui/popover";
import { cn } from "../../../lib/utils";
import { format } from "date-fns";
import Toast from "@/Components/Toast/Toast";
import { Calendar as CalendarIcon, Download, CircleAlert } from "lucide-react";

export default function Component() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  
  const generatePDFReport = async (reportType, startDate, endDate) => {
    const doc = new jsPDF();
  
    if (startDate === "" || endDate === "") {
      showToastNotification("Please select a start and end date.");
      return;
    }
  
    try {
      // API endpoints for different reports
      const apiEndpoints = {
        fees: `${HOST}/api/master-admin/generate-fees-report`,
        attendance: `${HOST}/api/master-admin/generate-attendance-report`,
        feedback: `${HOST}/api/master-admin/generate-feedback-report`,
      };
  
      // Fetch the data from the backend
      const response = await axios.get(`${apiEndpoints[reportType]}`, {
        params: { startDate, endDate },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
  
      const data =
        reportType === "fees"
          ? response.data.data
          : response.data.report

  
      // Set up the PDF
      doc.setTextColor("#5B4B8A"); // Purple color for the theme
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("StudySync", 105, 15, { align: "center" }); // Title
      doc.setFontSize(16);
      doc.text(`Report Type: ${reportType.toUpperCase()}`, 105, 30, {
        align: "center",
      });
      doc.setFontSize(12);
  
      // Format the dates to show only the date part
      const formattedStartDate = new Date(startDate).toLocaleDateString();
      const formattedEndDate = new Date(endDate).toLocaleDateString();
  
      doc.text(
        `Date Range: ${formattedStartDate} to ${formattedEndDate}`,
        105,
        40,
        { align: "center" }
      );
  
      // Add custom styling
      doc.setFillColor(230, 230, 255); // Light purple background for the table
  
      // Generate table based on report type
      if (reportType === "fees") {
        const feesTableData = [];
        data.fees.forEach((degreeData) => {
          degreeData.branches.forEach((branchData) => {
            feesTableData.push([
              degreeData.degree,
              branchData.branch,
              branchData.totalStudents,
              branchData.collectedAmount,
              branchData.pendingAmount,
            ]);
          });
        });
  
        // Add overall totals row
        feesTableData.push([
          "",
          "Overall Totals",
          "",
          data.overall.totalCollected,
          data.overall.totalPending,
        ]);
  
        doc.autoTable({
          startY: 50,
          head: [
            [
              "Degree",
              "Branch",
              "Total Students",
              "Collected Amount",
              "Pending Amount",
            ],
          ],
          body: feesTableData,
          styles: { fillColor: [91, 75, 138], textColor: "#FFFFFF" }, // Purple theme
          alternateRowStyles: { fillColor: [245, 245, 255], textColor: "#212121" }, // Alternate row color
          headStyles: { fillColor: [91, 75, 138] }, // Purple header
        });
      } else if (reportType === "attendance") {
        const attendanceTableData = data.map((course) => [
          course.courseID,
          course.courseName,
          course.department,
          course.branch,
          course.semester,
          course.courseInstructorName,
          course.totalLectures,
          course.lecturesTaken,
          course.averageLecturesAttended,
        ]);
  
        doc.autoTable({
          startY: 50,
          head: [
            [
              "Course ID",
              "Course Name",
              "Department",
              "Branch",
              "Semester",
              "Instructor",
              "Total Lectures",
              "Lectures Taken",
              "Avg. Lectures Attended",
            ],
          ],
          body: attendanceTableData,
          styles: { fillColor: [91, 75, 138], textColor: "#FFFFFF" }, // Purple theme
          alternateRowStyles: { fillColor: [245, 245, 255], textColor: "#212121" }, // Alternate row color
          headStyles: { fillColor: [91, 75, 138] }, // Purple header
        });
      } else if (reportType === "feedback") {
        const feedbackTableData = data.map((feedback) => [
          feedback.feedbackID,
          feedback.feedbackName,
          feedback.courseID,
          feedback.courseName,
          feedback.facultyID,
          feedback.facultyName,
          feedback.branch,
          format(new Date(feedback.startDateTime), "dd-MM-yyyy"),
          feedback.totalResponses,
        ]);
  
        doc.autoTable({
          startY: 50,
          head: [
            [
              "Feedback ID",
              "Feedback Name",
              "Course ID",
              "Course Name",
              "Faculty ID",
              "Faculty Name",
              "Branch",
              "Start Date",
              "Responses",
            ],
          ],
          body: feedbackTableData,
          styles: { fillColor: [91, 75, 138], textColor: "#FFFFFF", overflow: 'linebreak'}, // Purple theme
          alternateRowStyles: { fillColor: [245, 245, 255], textColor: "#212121" }, // Alternate row color
          headStyles: { fillColor: [91, 75, 138] }, // Purple header
        });
      }
  
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
      }
  
      // Save the PDF
      doc.save(`${reportType}_Report.pdf`);
    } catch (error) {
      console.error("Error generating PDF report:", error);
      showToastNotification(`Error: ${error.response.data.message}`);
    }
  };
  
  const generateCSVReport = async (reportType, startDate, endDate) => {
    if (startDate === "" || endDate === "") {
      showToastNotification("Please select a start and end date.");
      return;
    }
  
    try {
      // API endpoints for different reports
      const apiEndpoints = {
        fees: `${HOST}/api/master-admin/generate-fees-report`,
        attendance: `${HOST}/api/master-admin/generate-attendance-report`,
        feedback: `${HOST}/api/master-admin/generate-feedback-report`, // Endpoint for feedback
      };
  
      // Fetch the data from the backend
      const response = await axios.get(`${apiEndpoints[reportType]}`, {
        params: { startDate, endDate },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
  
      const data =
        reportType === "fees"
          ? response.data.data
          : response.data.report

      // Prepare CSV data
      let csvData = [];
      let headers = [];
  
      if (reportType === "fees") {
        headers = [
          "Degree",
          "Branch",
          "Total Students",
          "Collected Amount",
          "Pending Amount",
        ];
  
        data.fees.forEach((degreeData) => {
          degreeData.branches.forEach((branchData) => {
            csvData.push([
              degreeData.degree,
              branchData.branch,
              branchData.totalStudents,
              branchData.collectedAmount,
              branchData.pendingAmount,
            ]);
          });
        });
  
        // Add overall totals row
        csvData.push([
          "",
          "Overall Totals",
          "",
          data.overall.totalCollected,
          data.overall.totalPending,
        ]);
      } else if (reportType === "attendance") {
        headers = [
          "Course ID",
          "Course Name",
          "Department",
          "Branch",
          "Semester",
          "Instructor",
          "Total Lectures",
          "Lectures Taken",
          "Avg. Lectures Attended",
        ];
  
        csvData = data.map((course) => [
          course.courseID,
          course.courseName,
          course.department,
          course.branch,
          course.semester,
          course.courseInstructorName,
          course.totalLectures,
          course.lecturesTaken,
          course.averageLecturesAttended,
        ]);
      } else if (reportType === "feedback") {
        headers = [
          "Feedback ID",
          "Feedback Name",
          "Course ID",
          "Course Name",
          "Faculty ID",
          "Faculty Name",
          "Branch",
          "Start Date",
          "End Date",
          "Responses",
        ];
  
        csvData = data.map((feedback) => [
          feedback.feedbackID,
          feedback.feedbackName,
          feedback.courseID,
          feedback.courseName,
          feedback.facultyID,
          feedback.facultyName,
          feedback.branch,
          format(new Date(feedback.startDateTime), "dd-MM-yyyy"),
          format(new Date(feedback.endDateTime), "dd-MM-yyyy"),
          feedback.totalResponses,
        ]);
      }
  
      // Add title and date range to CSV
      csvData.unshift([`StudySync - ${reportType.toUpperCase()} Report`]);
      csvData.unshift([
        `Date Range: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`,
      ]);
      csvData.unshift([]); // Empty row for formatting
  
      // Convert data to CSV format
      const csvContent = Papa.unparse({
        fields: headers,
        data: csvData,
      });
  
      // Save CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `${reportType}_Report.csv`);
    } catch (error) {
      console.error("Error generating CSV report:", error);
      showToastNotification(
        `Error: ${
          error.response?.data?.message || "Failed to generate report."
        }`
      );
    }
  };
  
  const showToastNotification = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-purple-200">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Filter Card */}
          <Card className="shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Start Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          format(startDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? (
                          format(endDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Status Select */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <CircleAlert className="text-red-500 size-4 mr-1" />
                <p className="text-red-500">
                  For more detailed reports, contact Academic/Finance Admin.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          <div className="w-full">
            <Tabs defaultValue="fees" className="w-full space-y-6">
              <div className="relative">
                <TabsList className="w-full h-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-3 w-full">
                    <TabsTrigger
                      value="fees"
                      className="w-full py-3 text-sm sm:text-base data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      Fees Report
                    </TabsTrigger>
                    <TabsTrigger
                      value="attendance"
                      className="w-full py-3 text-sm sm:text-base data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      Attendance Report
                    </TabsTrigger>
                    <TabsTrigger
                      value="feedback"
                      className="w-full py-3 text-sm sm:text-base data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      Feedback Report
                    </TabsTrigger>
                  </div>
                </TabsList>
              </div>

              {/* Tab Contents */}
              {["fees", "attendance", "feedback"].map((reportType) => (
                <TabsContent
                  key={reportType}
                  value={reportType}
                  className="mt-6 space-y-6"
                >
                  <Card className="shadow-lg">
                    <CardHeader className="text-center p-4 sm:p-6 border-b">
                      <CardTitle className="text-lg sm:text-xl font-semibold text-purple-700 capitalize">
                        {reportType} Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center p-6">
                      <p className="text-sm sm:text-base text-gray-600 text-center mb-6">
                        Download the {reportType} report for the selected date
                        range and status.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto min-w-[160px]">
                          <Download className="mr-2 h-4 w-4" />
                          <span onClick={() => generateCSVReport(reportType, startDate, endDate)}>
                            Download CSV
                          </span>
                        </Button>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto min-w-[160px]">
                          <Download className="mr-2 h-4 w-4" />
                          <span
                            onClick={() =>
                              generatePDFReport(reportType, startDate, endDate)
                            }
                          >
                            Download PDF
                          </span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
      {/* Toast Notification */}
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}
// ADD DATE CHECKS IN BACKEND AND DO THE FEEDBACK PART