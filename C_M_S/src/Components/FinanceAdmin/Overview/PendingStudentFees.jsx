import { useState , useEffect } from "react";
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
import { AlertCircle, Clock, Send, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function PendingStudentFees() {

  // const token = localStorage.getItem('authToken');

  // const [data,setData] = useState(null);
  
  // useEffect(() => {
  //   const fetchAllQuestions = async () => {
  //       try {
  //           const response = await axios.get("http://localhost:3000/api/finance-admin/pendingFees",{
  //               headers: { Authorization: `Bearer ${token}` },
  //           });
  //           setData(response.data); // see the structure of data and then use wherever you want

  //       } catch (error) {
  //           console.error("Error fetching questions:", error);
  //       }
  //   };
  //   fetchAllQuestions();
  // }, []);

  // // console.log(data[0]);

  const [fees, setFees] = useState({
    BTech: {
      CS: [
        {
          id: "1",
          studentName: "Prajapati Yash",
          enrollmentNumber: "221040011026",
          pendingAmount: 5000,
          dueDate: "2023-07-15",
          status: "overdue",
        },
        {
          id: "2",
          studentName: "Himani Ayaan",
          enrollmentNumber: "221040011010",
          pendingAmount: 4500,
          dueDate: "2023-07-30",
          status: "nearing",
        },
      ],
      Mech: [
        {
          id: "3",
          studentName: "Rohit Pani",
          enrollmentNumber: "221040011027",
          pendingAmount: 4800,
          dueDate: "2023-08-05",
          status: "overdue",
        },
      ],
    },
    MTech: {
      Electrical: [
        {
          id: "4",
          studentName: "Patel Mansi",
          enrollmentNumber: "221040011011",
          pendingAmount: 6000,
          dueDate: "2023-07-20",
          status: "overdue",
        },
      ],
    },
    PhD: {
      Civil: [
        {
          id: "5",
          studentName: "Kajal Patel",
          enrollmentNumber: "221040011010",
          pendingAmount: 7500,
          dueDate: "2023-08-10",
          status: "nearing",
        },
      ],
    },
  });

  const [expandedDegrees, setExpandedDegrees] = useState([]);

  const sendReminder = (feeId) => {
    console.log(`Reminder sent for fee ID: ${feeId}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "overdue":
        return <AlertCircle className="text-red-500" />;
      case "nearing":
        return <Clock className="text-yellow-500" />;
      // case "normal":
        // return <CheckCircle className="text-green-500"/> ;
      default :
        return null;
    }
  };

  const toggleDegree = (degree) => {
    setExpandedDegrees((prev) =>
      prev.includes(degree)
        ? prev.filter((d) => d !== degree)
        : [...prev, degree]
    );
  };


  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Pending Student Fees</h2>
      {Object.entries(fees).map(([degree, courses]) => (
        <Collapsible
          key={degree}
          open={expandedDegrees.includes(degree)}
          onOpenChange={() => toggleDegree(degree)}
        >
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 transition-colors rounded-t-lg cursor-pointer">
              <h3 className="text-xl font-semibold">{degree}</h3>
              <Button
                            className="bg-gray-500 hover:bg-gray-600 text-white"
                            variant="outline"
                            size="sm"
                            onClick={() => sendReminder(fee.id)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send Reminder
                          </Button>
              {expandedDegrees.includes(degree) ? (
                <ChevronUp />
              ) : (
                <ChevronDown />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {Object.entries(courses).map(([course, feeList]) => (
              <div
                key={course}
                className="mb-4 p-4 bg-white rounded-b-lg shadow"
              >
                <h4 className="text-lg font-medium mb-2 p-2 bg-gray-50 hover:bg-gray-100 transition-colors rounded cursor-pointer">
                  {course}
                </h4> 

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Enrollment Number</TableHead>
                      <TableHead>Pending Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeList.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell>{fee.studentName}</TableCell>
                        <TableCell>{fee.enrollmentNumber}</TableCell>
                        <TableCell>₹{fee.pendingAmount}</TableCell>
                        <TableCell>{fee.dueDate}</TableCell>
                        <TableCell>{getStatusIcon(fee.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
