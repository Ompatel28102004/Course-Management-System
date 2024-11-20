import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HOST } from "../../../utils/constants";
import { Button } from "../../../Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../Components/ui/card";
import { Textarea } from "../../../Components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../Components/ui/table";
import './Activity.css';

const Report = () => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState('All');
  const [updates, setUpdates] = useState([]);
  const [response, setResponse] = useState('');
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const response = await axios.get(`${HOST}/api/master-admin/get-all-admin-activities`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
      });
      setUpdates(response.data.activities || []);
    } catch (error) {
      console.error('Error fetching updates:', error);
      setError('Failed to fetch updates. Please try again.');
      showToastNotification('Failed to fetch updates. Please try again.');
    }
  };

  const handleResponseSubmit = async () => {
    if (selectedUpdate) {
      try {
        await axios.put(`${HOST}/api/master-admin/submit-activity-response`, {
          id: selectedUpdate._id,
          response: response,
          status: 'Reviewed'
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
        });

        setUpdates(updates.map(update => 
          update._id === selectedUpdate._id ? { ...update, status: 'Reviewed', masterAdminResponse: response } : update
        ));
        setSelectedUpdate(null);
        setResponse('');
        showToastNotification('Response submitted successfully.');
      } catch (error) {
        console.error('Error submitting response:', error);
        setError('Failed to submit response. Please try again.');
        showToastNotification('Failed to submit response. Please try again.');
      }
    }
  };

  const showToastNotification = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  return (
    <div className="min-h-screen bg-[#f0e6ff] p-10 font-sans">
      <div className="container mx-auto">
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
                  <TableRow key={update._id}>
                    <TableCell className="text-[#616161]">{update.name + " (" + update.user_id + ")  "}</TableCell>
                    <TableCell className="text-[#616161]">{update.activity}</TableCell>
                    <TableCell className="text-[#616161]">{new Date(update.createdAt).toLocaleDateString()}</TableCell>
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
                Responding to: {selectedUpdate.activity} by {selectedUpdate.name + " (" + selectedUpdate.user_id + ")  "}
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
