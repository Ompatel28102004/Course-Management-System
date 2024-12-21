import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HOST } from "../../../utils/constants";
import { Button } from "../../../Components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../Components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "../../../Components/ui/alert";
import Toast from '../../Toast/Toast';

export default function ManageAdmin() {
  const [admins, setAdmins] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${HOST}/api/master-admin/get-admins`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { masterAdminId: userId },
      });
      setAdmins((response.data.admins.filter(admin => admin.user_id != userId)) || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      showToastNotification('Failed to fetch admins. Please try again.');
    }
  };

  const deleteAdmin = async (adminId) => {
    try {
      const response = await axios.delete(`${HOST}/api/master-admin/delete-admin`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { masterAdminId: userId, adminId },
      });
      if (response.status === 200) {
        setAdmins(admins.filter(admin => admin.user_id !== adminId));
        setSuccessMessage('Admin has been deleted successfully.');
        showToastNotification('Admin has been deleted successfully.');
      } else {
        showToastNotification(response.data.message || 'Failed to delete admin. Please try again.');
      }
    } catch (error) {
      console.log(error);
      showToastNotification('Failed to delete admin. Please try again.');
    }
  };

  const showToastNotification = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const filteredAdmins = admins.filter(admin => 
    admin.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.user_id.toString().includes(searchQuery)
  );  

  return (
    <div className="manage-admin-container p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Admins</h2>

      {/* Search Admins */}
      <input
        type="text"
        placeholder="Search by userID or role"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input mb-4 p-2 border border-gray-300 rounded"
      />

      {/* Admin Table */}
      <Table className="w-full border-collapse">
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead className="p-2 border border-gray-300">UserID</TableHead>
            <TableHead className="p-2 border border-gray-300">Email</TableHead>
            <TableHead className="p-2 border border-gray-300">Role</TableHead>
            <TableHead className="p-2 border border-gray-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAdmins.map((admin) => (
            <TableRow key={admin.user_id} className="hover:bg-gray-50">
              <TableCell className="p-2 border border-gray-300">{admin.user_id}</TableCell>
              <TableCell className="p-2 border border-gray-300">{admin.email}</TableCell>
              <TableCell className="p-2 border border-gray-300">{admin.role}</TableCell>
              <TableCell className="p-2 border border-gray-300">
                <Button
                  variant="destructive"
                  onClick={() => deleteAdmin(admin.user_id)}
                  className="mr-2"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {successMessage && <Toast message={successMessage} />}
    </div>
  );
}
