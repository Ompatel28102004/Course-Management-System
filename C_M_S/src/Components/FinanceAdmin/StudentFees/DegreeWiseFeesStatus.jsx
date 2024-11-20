'use client';
import { Fragment, useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

const feeData = [
  { id: 1, semester: 1, degree: 'Bachelor', branch: 'Computer Science', fee: 5000 },
  { id: 2, semester: 1, degree: 'Bachelor', branch: 'Civil Engineering', fee: 5000 },
  { id: 3, semester: 1, degree: 'Bachelor', branch: 'Electrical Engineering', fee: 4800 },
  { id: 4, semester: 1, degree: 'Bachelor', branch: 'Mechanical Engineering', fee: 4800 },

  { id: 1, semester: 1, degree: 'Master', branch: 'Computer Science', fee: 5000 },
  { id: 2, semester: 1, degree: 'Master', branch: 'Civil Engineering', fee: 5000 },
  { id: 3, semester: 1, degree: 'Master', branch: 'Electrical Engineering', fee: 4800 },
  { id: 4, semester: 1, degree: 'Master', branch: 'Mechanical Engineering', fee: 4800 },

  { id: 1, semester: 1, degree: 'Phd', branch: 'Computer Science', fee: 5500 },
  { id: 2, semester: 1, degree: 'Phd', branch: 'Civil Engineering', fee: 5000 },
  { id: 3, semester: 1, degree: 'Phd', branch: 'Electrical Engineering', fee: 4800 },
  { id: 4, semester: 1, degree: 'Phd', branch: 'Mechanical Engineering', fee: 4800 },

  { id: 1, semester: 2, degree: 'Bachelor', branch: 'Computer Science', fee: 5000 },
  { id: 2, semester: 2, degree: 'Bachelor', branch: 'Civil Engineering', fee: 5000 },
  { id: 3, semester: 2, degree: 'Bachelor', branch: 'Electrical Engineering', fee: 4800 },
  { id: 4, semester: 2, degree: 'Bachelor', branch: 'Mechanical Engineering', fee: 4800 },

  { id: 1, semester: 2, degree: 'Master', branch: 'Computer Science', fee: 5000 },
  { id: 2, semester: 2, degree: 'Master', branch: 'Civil Engineering', fee: 5000 },
  { id: 3, semester: 2, degree: 'Master', branch: 'Electrical Engineering', fee: 4800 },
  { id: 4, semester: 2, degree: 'Master', branch: 'Mechanical Engineering', fee: 4800 },

  { id: 1, semester: 2, degree: 'Phd', branch: 'Computer Science', fee: 6000 },
  { id: 2, semester: 2, degree: 'Phd', branch: 'Civil Engineering', fee: 5000 },
  { id: 3, semester: 2, degree: 'Phd', branch: 'Electrical Engineering', fee: 4800 },
  { id: 4, semester: 2, degree: 'Phd', branch: 'Mechanical Engineering', fee: 4800 },

  { id: 1, semester: 3, degree: 'Bachelor', branch: 'Computer Science', fee: 5000 },
  { id: 2, semester: 3, degree: 'Bachelor', branch: 'Civil Engineering', fee: 5000 },
  { id: 3, semester: 3, degree: 'Bachelor', branch: 'Electrical Engineering', fee: 4800 },
  { id: 4, semester: 3, degree: 'Bachelor', branch: 'Mechanical Engineering', fee: 4800 },

  { id: 1, semester: 3, degree: 'Master', branch: 'Computer Science', fee: 5000 },
  { id: 2, semester: 3, degree: 'Master', branch: 'Civil Engineering', fee: 5000 },
  { id: 3, semester: 3, degree: 'Master', branch: 'Electrical Engineering', fee: 4800 },
  { id: 4, semester: 3, degree: 'Master', branch: 'Mechanical Engineering', fee: 4800 },

  { id: 1, semester: 3, degree: 'Phd', branch: 'Computer Science', fee: 5800 },
  { id: 2, semester: 3, degree: 'Phd', branch: 'Civil Engineering', fee: 5000 },
  { id: 3, semester: 3, degree: 'Phd', branch: 'Electrical Engineering', fee: 4800 },
  { id: 4, semester: 3, degree: 'Phd', branch: 'Mechanical Engineering', fee: 4800 },

  { id: 1, semester: 4, degree: 'Bachelor', branch: 'Computer Science', fee: 5000 },
  { id: 2, semester: 4, degree: 'Bachelor', branch: 'Civil Engineering', fee: 5000 },
  { id: 3, semester: 4, degree: 'Bachelor', branch: 'Electrical Engineering', fee: 4800 },
  { id: 4, semester: 4, degree: 'Bachelor', branch: 'Mechanical Engineering', fee: 4800 },

  { id: 1, semester: 4, degree: 'Master', branch: 'Computer Science', fee: 5000 },
  { id: 2, semester: 4, degree: 'Master', branch: 'Civil Engineering', fee: 5000 },
  { id: 3, semester: 4, degree: 'Master', branch: 'Electrical Engineering', fee: 4800 },
  { id: 4, semester: 4, degree: 'Master', branch: 'Mechanical Engineering', fee: 4800 },

  { id: 1, semester: 4, degree: 'Phd', branch: 'Computer Science', fee: 5800 },
  { id: 2, semester: 4, degree: 'Phd', branch: 'Civil Engineering', fee: 5000 },
  { id: 3, semester: 4, degree: 'Phd', branch: 'Electrical Engineering', fee: 4800 },
  { id: 4, semester: 4, degree: 'Phd', branch: 'Mechanical Engineering', fee: 4800 },
  
];

export default function DegreeWiseFeesStatus() {
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const degrees = useMemo(() => [...new Set(feeData.map(item => item.degree))], []);
  const branches = useMemo(() => [...new Set(feeData.map(item => item.branch))], []);

  const filteredData = useMemo(() => {
    return feeData.filter(item => 
      (!selectedDegree || item.degree === selectedDegree) &&
      (!selectedBranch || item.branch === selectedBranch)
    );
  }, [selectedDegree, selectedBranch]);

  const groupedData = useMemo(() => {
    const groups = filteredData.reduce((acc, item) => {
      const key = `${item.degree}-${item.branch}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  
    return Object.entries(groups).map(([key, items]) => ({
      key,
      items,
      total: items.reduce((sum, item) => sum + item.fee, 0)
    }));
  }, [filteredData]);

  return (
    <div className='flex justify-center items-center max-w-screen h-full p-4'>
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Fee Structure</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Select onValueChange={(value) => setSelectedDegree(value !== "all" ? value : null)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Degree" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Degrees</SelectItem>
              {degrees.map(degree => (
                <SelectItem key={degree} value={degree}>{degree}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setSelectedBranch(value !== "all" ? value : null)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map(branch => (
                <SelectItem key={branch} value={branch}>{branch}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semester</TableHead>
                <TableHead>Degree</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead className="text-right">Fee Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedData.map(({ key, items, total }) => (
                <Fragment key={key}>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.semester}</TableCell>
                      <TableCell>{item.degree}</TableCell>
                      <TableCell>{item.branch}</TableCell>
                      <TableCell className="text-right">₹ {item.fee.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell className="text-custom-selectedPurple font-medium text-[15px]" colSpan={3}>Total for {key}</TableCell>
                    <TableCell className="text-right text-custom-selectedPurple">₹ {total.toFixed(2)}</TableCell>
                  </TableRow>
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
