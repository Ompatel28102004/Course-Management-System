import React, { useState } from 'react';
import { Button } from "../../../Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../Components/ui/card";
import { Textarea } from "../../../Components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../Components/ui/table";
import './Activity.css';

const Report = () => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState('All');
  const [updates, setUpdates] = useState([
    { id: 1, admin: 'John Doe', action: 'Updated user permissions', date: '2023-06-01', status: 'Pending' },
    { id: 2, admin: 'Jane Smith', action: 'Modified payment gateway settings', date: '2023-06-02', status: 'Pending' },
    { id: 3, admin: 'Mike Johnson', action: 'Added new course category', date: '2023-06-03', status: 'Reviewed' },
  ]);
  const [response, setResponse] = useState('');
  const [selectedUpdate, setSelectedUpdate] = useState(null);

  const handleResponseSubmit = () => {
    if (selectedUpdate) {
      setUpdates(updates.map(update => 
        update.id === selectedUpdate.id ? { ...update, status: 'Reviewed' } : update
      ));
      setSelectedUpdate(null);
      setResponse('');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0e6ff] p-10 font-sans">
      <div className="container mx-auto">
        {/* <h2 className="text-4xl font-bold mb-6 text-[#B21FDC] uppercase tracking-wider text-center">
          Master Admin Dashboard
        </h2>
        <p className="text-lg font-medium mb-8 text-[#4A4A4A] max-w-2xl mx-auto text-center">
          Monitor and respond to recent admin updates, and view a summary of system activities.
        </p> */}

        {/* Recent Admin Updates Table */}
        <Card className="mb-8 bg-gradient-to-br from-white to-[#f3eaff] shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-[#B21FDC]">Recent Admin Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[#4A4A4A] font-semibold">Admin</TableHead>
                  <TableHead className="text-[#4A4A4A] font-semibold">Action</TableHead>
                  <TableHead className="text-[#4A4A4A] font-semibold">Date</TableHead>
                  <TableHead className="text-[#4A4A4A] font-semibold">Status</TableHead>
                  <TableHead className="text-[#4A4A4A] font-semibold">Respond</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {updates.map((update) => (
                  <TableRow key={update.id}>
                    <TableCell className="text-[#616161]">{update.admin}</TableCell>
                    <TableCell className="text-[#616161]">{update.action}</TableCell>
                    <TableCell className="text-[#616161]">{update.date}</TableCell>
                    <TableCell className="text-[#616161]">{update.status}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => setSelectedUpdate(update)}
                        disabled={update.status === 'Reviewed'}
                        className="bg-[#B21FDC] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-[#8707a8] hover:shadow-md hover:-translate-y-1"
                      >
                        Respond
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Response Submission Form */}
        {selectedUpdate && (
          <Card className="mb-8 bg-gradient-to-br from-white to-[#f3eaff] shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-[#B21FDC]">Respond to Update</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-[#4A4A4A]">
                Responding to: {selectedUpdate.action} by {selectedUpdate.admin}
              </p>
              <Textarea
                placeholder="Enter your response..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="mb-4 border-[#ddd] rounded-lg focus:border-[#B21FDC] focus:ring-[#B21FDC] transition-all duration-300"
              />
              <Button
                onClick={handleResponseSubmit}
                className="bg-[#B21FDC] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:bg-[#8707a8] hover:shadow-md hover:-translate-y-1"
              >
                Submit Response
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Summary Overview */}
        <Card className="bg-gradient-to-br from-white to-[#f3eaff] shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-[#B21FDC]">Summary Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-[#4A4A4A]">
              <li className="text-lg">Total Updates: {updates.length}</li>
              <li className="text-lg">Pending Reviews: {updates.filter(u => u.status === 'Pending').length}</li>
              <li className="text-lg">Reviewed Updates: {updates.filter(u => u.status === 'Reviewed').length}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Report;
