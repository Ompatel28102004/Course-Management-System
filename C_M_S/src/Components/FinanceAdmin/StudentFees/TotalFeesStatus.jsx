import React from 'react';
import axios from 'axios';
import { useEffect , useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const feeData = [
  { degree: 'Bachelor', branch: 'Computer Science', totalStudents: 150, feesCollected: 960000, pendingFees: 40000 },
  { degree: 'Bachelor', branch: 'Electrical Engineering', totalStudents: 110, feesCollected: 750000, pendingFees: 50000 },
  { degree: 'Bachelor', branch: 'Civil Engineering', totalStudents: 100, feesCollected: 960000, pendingFees: 40000 },
  { degree: 'Bachelor', branch: 'Mechanical Engineering', totalStudents: 120, feesCollected: 750000, pendingFees: 50000 },

  { degree: 'Master', branch: 'Computer Science', totalStudents: 50, feesCollected: 960000, pendingFees: 40000 },
  { degree: 'Master', branch: 'Electrical Engineering', totalStudents: 40, feesCollected: 750000, pendingFees: 50000 },
  { degree: 'Master', branch: 'Civil Engineering', totalStudents: 30, feesCollected: 960000, pendingFees: 40000 },
  { degree: 'Master', branch: 'Mechanical Engineering', totalStudents: 20, feesCollected: 750000, pendingFees: 50000 },

  { degree: 'Phd', branch: 'Computer Science', totalStudents: 120, feesCollected: 960000, pendingFees: 40000 },
  { degree: 'Phd', branch: 'Electrical Engineering', totalStudents: 100, feesCollected: 750000, pendingFees: 50000 },
  { degree: 'Phd', branch: 'Civil Engineering', totalStudents: 30, feesCollected: 960000, pendingFees: 40000 },
  { degree: 'Phd', branch: 'Mechanical Engineering', totalStudents: 20, feesCollected: 750000, pendingFees: 50000 },
];

function StatusIndicator({ status }) {
  const colorClass = status === 'Fully Paid' ? 'bg-green-500' :
                     status === 'Partial' ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className={`w-3 h-3 rounded-full ${colorClass}`} />
  );
}

export default function TotalFeesStatus() {

  const token = localStorage.getItem("authToken");

  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAllQuestions = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/finance-admin/overview", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data);
        setData(response.data); // see the structure of data and then use wherever you want
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };
    fetchAllQuestions();
  }, [token]);

  const totalFeesCollected = feeData.reduce((sum, item) => sum + item.feesCollected, 0);
  const totalPendingFees = feeData.reduce((sum, item) => sum + item.pendingFees, 0);

  return (
    <div className='w-screen h-full flex justify-center items-center p-4'>
    <Card className="w-full h-max shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold ">Student Degree and Branch-wise Fees Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-custom-selectedPurple">Total Fees Collected</CardTitle>
              <StatusIndicator status="Fully Paid" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹ {totalFeesCollected.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-custom-selectedPurple">Total Pending Fees</CardTitle>
              <StatusIndicator status="Pending" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹ {totalPendingFees.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Degree</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Total Enrolled Students</TableHead>
                <TableHead>Total Fees Collected</TableHead>
                <TableHead>Pending Fees</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeData.map((item, index) => {
                const totalFees = item.feesCollected + item.pendingFees;
                const percentagePaid = (item.feesCollected / totalFees) * 100;
                let status = 'Pending';
                if (percentagePaid === 100) status = 'Fully Paid';
                else if (percentagePaid > 0) status = 'Partial';

                return (
                  <TableRow key={index}>
                    <TableCell>{item.degree}</TableCell>
                    <TableCell>{item.branch}</TableCell>
                    <TableCell>{item.totalStudents}</TableCell>
                    <TableCell>₹ {item.feesCollected.toLocaleString()}</TableCell>
                    <TableCell>₹ {item.pendingFees.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusIndicator status={status} />
                        <span>{status}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
