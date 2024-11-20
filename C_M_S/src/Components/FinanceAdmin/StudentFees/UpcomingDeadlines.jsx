import { useState , useEffect} from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AlertCircle, CheckCircle2, Clock } from "lucide-react"
import axios from "axios"

const deadlines = [
  { id: "1", degree: "B.Tech", course: "Computer", semester: "3rd", dueDate: "2024-08-15", amount: 50000, status: "approaching" },
  { id: "2", degree: "B.Tech", course: "Civil", semester: "5th", dueDate: "2024-07-30", amount: 48000, status: "overdue" },
  { id: "3", degree: "M.Tech", course: "Mechanical", semester: "2nd", dueDate: "2024-08-30", amount: 55000, status: "approaching" },
  { id: "4", degree: "PhD", course: "Electrical", semester: "1st", dueDate: "2024-09-15", amount: 60000, status: "approaching" },
  { id: "5", degree: "B.Tech", course: "Computer", semester: "7th", dueDate: "2024-08-01", amount: 52000, status: "overdue" },
  { id: "6", degree: "M.Tech", course: "Civil", semester: "4th", dueDate: "2024-07-25", amount: 53000, status: "overdue" },
]

export default function UpcomingDeadlines() {

  const [expandedDegrees, setExpandedDegrees] = useState([])

  const sendReminders = () => {
    const pendingDeadlines = deadlines.filter(d => d.status !== "completed")
    console.log("Sending reminders for pending payments:", pendingDeadlines)
    alert(`Reminders sent for ${pendingDeadlines.length} pending payments`)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "overdue":
        return <AlertCircle className="text-red-500" aria-label="Overdue" />
      case "approaching":
        return <Clock className="text-yellow-500" aria-label="Approaching deadline" />
      // case "completed":
        // return <CheckCircle2 className="text-green-500" aria-label="Completed" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "overdue":
        return "border-red-500"
      case "approaching":
        return "border-yellow-500"
      // case "completed":
        // return "border-green-500"
    }
  }

  const groupedDeadlines = deadlines.reduce((acc, deadline) => {
    if (!acc[deadline.degree]) {
      acc[deadline.degree] = {}
    }
    if (!acc[deadline.degree][deadline.course]) {
      acc[deadline.degree][deadline.course] = []
    }
    acc[deadline.degree][deadline.course].push(deadline)
    return acc
  }, {})

  // const token = localStorage.getItem('authToken');

  // const [data,setData] = useState(null);
  
  // useEffect(() => {
  //   const fetchAllQuestions = async () => {
  //       try {
  //           const response = await axios.get("http://localhost:3000/api/finance-admin/dueDates",{
  //               headers: { Authorization: `Bearer ${token}` },
  //           });
  //           setData(response.data); // see the structure of data and then use wherever you want

  //       } catch (error) {
  //           console.error("Error fetching questions:", error);
  //       }
  //   };
  //   fetchAllQuestions();
  // }, []);

  // console.log(data);

  return (
    <div className="flex justify-center items-center p-4">

    <Card className="w-full max-w-4xl m-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className='text-2xl font-bold'>Upcoming Fee Deadlines</CardTitle>
        <Button className="bg-custom-selectedPurple hover:bg-cutom-hoverSelectedPurple" onClick={sendReminders}>Send Reminders</Button>
      </CardHeader>

      <CardContent>
        <Accordion type="multiple" value={expandedDegrees} onValueChange={setExpandedDegrees}>
          {Object.entries(groupedDeadlines).map(([degree, courses]) => (
            <AccordionItem key={degree} value={degree}>
              <AccordionTrigger>{degree}</AccordionTrigger>
              <AccordionContent>
                {Object.entries(courses).map(([course, courseDeadlines]) => (
                  <div key={course} className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">{course}</h3>
                    <div className="space-y-2">
                      {courseDeadlines.map((deadline) => (
                        <div
                          key={deadline.id}
                          className={`flex items-center space-x-4 border-l-4 pl-4 py-2`}
                        >
                          {/* {getStatusIcon(deadline.status)} */}
                          <div className="flex-grow">
                            <p className="font-medium">{deadline.semester} Semester</p>
                            <p className="text-sm text-muted-foreground">Due: {deadline.dueDate}</p>
                          </div>
                          <p className="font-semibold">₹ {deadline.amount.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
    </div>
  )
}

// import React from "react";
// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function DegreeInfo() {
//   const token = localStorage.getItem("authToken");

//   const [data, setData] = useState(null);

//   useEffect(() => {
//     const fetchAllQuestions = async () => {
//       try {
//         const response = await axios.get("http://localhost:3000/api/finance-admin/dueDates", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         // console.log(response.data);
//         setData(response.data); // see the structure of data and then use wherever you want
//       } catch (error) {
//         console.error("Error fetching questions:", error);
//       }
//     };
//     fetchAllQuestions();
//   }, [token]);

//   return (
//     <div>
//       {data ? (
//         data.map((degree) => (
//           <div key={degree._id}>
//             <h2>Degree: {degree._id}</h2>
//             {degree.branches.map((branch) => (
//               <div>
//                 <h3>Branch: {branch.branch}</h3>
//                 {/* {branch.semesters.map((semester, semesterIndex) => ( */}
//                   <div>
//                     <p>Semester: {branch.semesters.semester}</p>
//                     <p>Due Date: {new Date(branch.semesters.dueDate).toDateString()}</p>
//                     <p>Pending Amount: {branch.semesters.totalPendingAmount}</p>
//                   </div>
//                 {/* // ))} */}
//               </div>
//             ))}
//           </div>
//         ))
//       ) : (
//         <p>Loading...</p>
//       )}
//     </div>
//   );
// }
