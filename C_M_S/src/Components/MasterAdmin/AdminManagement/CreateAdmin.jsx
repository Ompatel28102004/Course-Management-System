import React, { useState, useEffect } from 'react';
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../Components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../Components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../Components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../Components/ui/dialog";
import { Alert, AlertDescription } from "../../../Components/ui/alert";

export default function CreateAdmin() {   
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState('');
  const [adminRole, setAdminRole] = useState('Academic Admin');
  const [error, setError] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  // useEffect(() => {
  //   fetchAdmins();
  // }, []);

  const fetchAdmins = async () => {
    // try {
    //   const response = await fetch('http://localhost:5000/api/admins');
    //   const data = await response.json();
    //   setAdmins(data.map(admin => ({ ...admin, password: 'encrypted' })));
    // } catch (error) {
    //   console.error('Error fetching admins:', error);
    //   setError('Failed to fetch admins. Please try again.');
    // }
  };

  const addAdmin = () => {
    if (!newAdmin.trim()) {
      setError('Admin name cannot be empty');
      return;
    }
    if (admins.some((admin) => admin.name === newAdmin)) {
      setError('Admin already exists');
      return;
    }
    const newAdminObj = { id: Date.now().toString(), name: newAdmin, role: adminRole, password: 'encrypted' };
    setAdmins([...admins, newAdminObj]);
    setNewAdmin('');
    setAdminRole('Academic Admin');
    setError('');
  };

  const handlePasswordVisibility = () => {
    // Check the password and security code
    if (masterPassword === 'your_master_password' && securityCode === 'your_security_code') {
      setPasswordVisibility(true);
      setError('');
    } else {
      setError('Incorrect password or security code');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Admin Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add Admin</CardTitle>
          <CardDescription>Create a new admin account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Add new admin"
              value={newAdmin}
              onChange={(e) => setNewAdmin(e.target.value)}
            />
            <Select value={adminRole} onValueChange={setAdminRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Academic Admin">Academic Admin</SelectItem>
                <SelectItem value="Finance Admin">Finance Admin</SelectItem>
                <SelectItem value="Master Admin">Master Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addAdmin}>Add Admin</Button>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Admin List with Password Visibility */}
      <Card>
        <CardHeader>
          <CardTitle>Admin List</CardTitle>
          <CardDescription>View existing admins and their passwords</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button>View Passwords</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Access Passwords</DialogTitle>
                <DialogDescription>
                  Please enter the master password and security code to view admin passwords.
                </DialogDescription>
              </DialogHeader>
              <Input
                type="password"
                placeholder="Master Password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Security Code"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
              />
              <Button onClick={handlePasswordVisibility}>Submit</Button>
            </DialogContent>
          </Dialog>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Password</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.role}</TableCell>
                  <TableCell>
                    {passwordVisibility ? admin.password : '********'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
