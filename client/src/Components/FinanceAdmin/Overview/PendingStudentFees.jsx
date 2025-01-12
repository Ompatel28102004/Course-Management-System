import { useState, useEffect } from "react";
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, Send, Search, CheckCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";

export default function PendingStudentFees() {
  const [fees, setFees] = useState([]);
  const [selectedDegree, setSelectedDegree] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    byDegree: {}
  });

  useEffect(() => {
    const fetchPendingFees = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get("http://localhost:3000/api/finance-admin/pendingFees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFees(response.data);
        calculateSummaryStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching pending fees:", error);
        setError("Failed to fetch pending fees. Please try again later.");
        setLoading(false);
      }
    };
    fetchPendingFees();
  }, []);

  const calculateSummaryStats = (feeData) => {
    const stats = {
      total: 0,
      byDegree: {}
    };

    feeData.forEach(degreeData => {
      const degreeName = degreeData._id;
      stats.byDegree[degreeName] = 0;

      degreeData.branches.forEach(branchData => {
        branchData.students.forEach(student => {
          const amount = Number(student.pendingAmount) || 0;
          stats.total += amount;
          stats.byDegree[degreeName] += amount;
        });
      });
    });

    setSummaryStats(stats);
  };

  const sendReminder = async (enrollmentNumber) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        "http://localhost:3000/api/finance-admin/sendReminder",
        { enrollmentNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Reminder sent successfully!");
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert("Failed to send reminder. Please try again.");
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "overdue":
        return <AlertCircle className="text-red-500" />;
      case "pending":
        return <Clock className="text-yellow-500" />;
      case "unpaid":
        return <AlertCircle className="text-orange-500" />;
      case "waived":
        return <CheckCircle className="text-green-500" />;
      default:
        return null;
    }
  };

  const consolidateStudentData = () => {
    const studentMap = new Map();

    fees.forEach(degreeData => {
      const degreeName = degreeData._id;
      
      degreeData.branches.forEach(branchData => {
        branchData.students.forEach(student => {
          const key = student.enrollmentNumber;
          if (!studentMap.has(key)) {
            studentMap.set(key, {
              name: student.name,
              enrollmentNumber: student.enrollmentNumber,
              feeRecords: []
            });
          }
          
          studentMap.get(key).feeRecords.push({
            degree: degreeName,
            branch: branchData.branch,
            semester: student.semester,
            pendingAmount: student.pendingAmount,
            dueDate: student.dueDate,
            status: student.status
          });
        });
      });
    });

    return Array.from(studentMap.values());
  };

  const safeString = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).trim().toLowerCase();
  };

  const filterStudents = (students) => {
    if (!searchQuery.trim()) return students;
    
    const searchTerms = searchQuery.trim().toLowerCase().split(' ').filter(term => term.length > 0);
    
    return students.filter(student => {
      // Check each search term
      return searchTerms.every(term => {
        // Check student details first
        if (
          safeString(student.name).includes(term) ||
          safeString(student.enrollmentNumber).includes(term)
        ) {
          return true;
        }

        // Check fee records
        return student.feeRecords.some(record => 
          safeString(record.degree).includes(term) ||
          safeString(record.branch).includes(term) ||
          safeString(record.semester).toString().includes(term) ||
          safeString(record.status).includes(term)
        );
      });
    });
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-red-500 text-center mt-8 p-4 bg-red-50 rounded-lg">
      <AlertCircle className="w-6 h-6 mx-auto mb-2" />
      {error}
    </div>
  );

  const consolidatedStudents = consolidateStudentData();
  const degreeFilteredStudents = selectedDegree === "all" 
    ? consolidatedStudents
    : consolidatedStudents.filter(student => 
        student.feeRecords.some(record => record.degree === selectedDegree)
      );
  const filteredStudents = filterStudents(degreeFilteredStudents);

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fee Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">Total Pending Fees</p>
                <p className="text-2xl font-bold">₹{summaryStats.total.toLocaleString()}</p>
              </div>
              {Object.entries(summaryStats.byDegree).map(([degree, amount]) => (
                <div key={degree} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{degree}</p>
                  <p className="text-2xl font-bold">₹{amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Fee Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                
                <Input
                  placeholder="Search by Name or Enrollment number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedDegree} onValueChange={setSelectedDegree}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Degree" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Degrees</SelectItem>
                  {Object.keys(summaryStats.byDegree).map(degree => (
                    <SelectItem key={degree} value={degree}>{degree}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students found matching your search criteria
              </div>
            ) : (
              <Accordion type="single" collapsible>
                {filteredStudents.map((student) => (
                  <AccordionItem key={student.enrollmentNumber} value={student.enrollmentNumber}>
                    <AccordionTrigger className="hover:bg-gray-50 px-4 py-2 rounded-lg">
                      <div className="flex justify-between items-center w-full">
                        <span className="font-medium">{student.name || "Unknown Student"}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">{student.enrollmentNumber}</span>
                          <span className="text-sm font-semibold">
                            Total: ₹{student.feeRecords.reduce((sum, record) => sum + (Number(record.pendingAmount) || 0), 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Degree</TableHead>
                            <TableHead>Branch</TableHead>
                            <TableHead>Semester</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {student.feeRecords
                            .filter(record => selectedDegree === "all" || record.degree === selectedDegree)
                            .map((record, index) => (
                            <TableRow key={index}>
                              <TableCell>{record.degree}</TableCell>
                              <TableCell>{record.branch}</TableCell>
                              <TableCell>{record.semester}</TableCell>
                              <TableCell className="text-right">₹{Number(record.pendingAmount).toLocaleString()}</TableCell>
                              <TableCell>{record.dueDate ? new Date(record.dueDate).toLocaleDateString() : "No due date"}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(record.status)}
                                  <span className="capitalize">{record.status || "Unknown"}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="mt-4 flex justify-end">
                        <Button
                          onClick={() => sendReminder(student.enrollmentNumber)}
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send Reminder
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}