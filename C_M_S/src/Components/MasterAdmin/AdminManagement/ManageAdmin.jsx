import React, { useState, useEffect } from 'react';
import { Button } from "../../../Components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../Components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "../../../Components/ui/alert";
import { X, Check } from 'lucide-react';

export default function ManageAdmin() {
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchAdmins();
  }, []);
  
  const fetchAdmins = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admins'); // Adjust URL as per your backend
      const data = await response.json();
      setAdmins(data.admins || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError('Failed to fetch admins. Please try again.');
    }
  };

  const deactivateAdmin = async (adminId) => {
    try {
      await fetch(`http://localhost:5000/api/admins/deactivate/${adminId}`, { method: 'PUT' });
      setAdmins(admins.map(admin => 
        admin.id === adminId ? { ...admin, status: 'deactivated' } : admin
      ));
      setSuccessMessage('Admin has been deactivated successfully.');
    } catch (error) {
      setError('Failed to deactivate admin. Please try again.');
    }
  };

  const ManageAdmin = async (adminId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admins/${adminId}`, { method: 'DELETE' });
      if (response.ok) {
        setAdmins(admins.filter(admin => admin.id !== adminId));
        setSuccessMessage('Admin has been deleted successfully.');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete admin. Please try again.');
      }
    } catch (error) {
      setError('Failed to delete admin. Please try again.');
    }
  };

  const filteredAdmins = admins.filter(admin => 
    admin.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="delete-admin-container">
      <h2>Manage Admins</h2>

      {/* Search Admins */}
      <input
        type="text"
        placeholder="Search by username or email"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />

      {/* Error and Success Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert variant="success">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Admin Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAdmins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell>{admin.username}</TableCell>
              <TableCell>{admin.email}</TableCell>
              <TableCell>{admin.status === 'deactivated' ? 'Deactivated' : 'Active'}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  onClick={() => ManageAdmin(admin.id)}
                  className="delete-button"
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => deactivateAdmin(admin.id)}
                  className="deactivate-button"
                >
                  {admin.status === 'deactivated' ? 'Reactivate' : 'Deactivate'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
