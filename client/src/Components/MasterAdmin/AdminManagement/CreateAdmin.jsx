import React, { useState, useEffect } from "react";
import axios from "axios";
import { HOST } from "../../../utils/constants";
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../Components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../Components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../Components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../Components/ui/dialog";
import { SquarePen } from "lucide-react";
import Toast from "../../Toast/Toast";

export default function CreateAdmin() {
  const [admins, setAdmins] = useState([]);
  const [newAdminID, setNewAdminID] = useState("");
  const [adminRole, setAdminRole] = useState("academic-admin");
  const [toastMessage, setToastMessage] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [tempPassword, setTempPassword] = useState("");
  const [securityCode, setSecurityCode] = useState("");

  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");

  const showToastNotification = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 5000);
  };

  const openDialog = (admin) => {
    setSelectedAdmin(admin);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${HOST}/api/master-admin/get-admins`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { masterAdminId: userId },
      });
      setAdmins(
        response.data.admins.map((admin) => ({
          ...admin,
        }))
      );
    } catch (error) {
      console.error("Error fetching admins:", error);
      showToastNotification("Failed to fetch admins. Please try again.");
    }
  };

  const addAdmin = async () => {
    if (!newAdminID.trim()) {
      showToastNotification("Admin ID cannot be empty");
      return;
    }
    if (!newAdminPassword.trim()) {
      showToastNotification("Admin password cannot be empty");
      return;
    }
    if (admins.some((admin) => admin.user_id == newAdminID)) {
      showToastNotification("Admin already exists");
      return;
    }

    try {
      const response = await axios.post(
        `${HOST}/api/master-admin/add-admin`,
        {
          masterAdminId: userId,
          newAdminID,
          newAdminPassword,
          adminRole,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newAdmin = response.data.admin;
      setAdmins([...admins, newAdmin]);
      setNewAdminID("");
      setNewAdminPassword("");
      setAdminRole("academic-admin");

      showToastNotification(`Admin with ID ${newAdmin.user_id} added successfully. New Security Code: ${newAdmin.securityCode}`);
    } catch (error) {
      console.error("Error adding admin:", error);
      showToastNotification(
        error.response?.data?.message ||
          "Failed to add admin. Please try again."
      );
    }
  };

  const getTemporaryAccess = async () => {
    try {
      const response = await axios.post(
        `${HOST}/api/master-admin/get-temp-admin-access`,
        {
          masterAdminId: userId,
          adminId: selectedAdmin.user_id,
          tempPassword: tempPassword,
          tempSecurityCode: securityCode,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToastNotification(response.data.message);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to get temporary access:", error);
      showToastNotification(
        error.response?.data?.message ||
          "Failed to get temporary access. Please try again."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Admin Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add Admin</CardTitle>
          <CardDescription>Create a new admin account</CardDescription>
          <span className="text-sm text-red-500">Note: When New Admin is added the Security code will be displayed for 5 seconds only</span>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
            <Input
              placeholder="Admin ID"
              value={newAdminID}
              onChange={(e) => setNewAdminID(e.target.value)}
            />
            <Input
              placeholder="Password"
              type="password"
              value={newAdminPassword}
              onChange={(e) => setNewAdminPassword(e.target.value)}
            />
            <Select value={adminRole} onValueChange={setAdminRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="academic-admin">Academic Admin</SelectItem>
                <SelectItem value="finance-admin">Finance Admin</SelectItem>
                <SelectItem value="master-admin">Master Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-[#B21FDC] text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 hover:bg-[#8707a8] hover:shadow-md" onClick={addAdmin}>Add Admin</Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin List with Password Visibility */}
      <Card>
        <CardHeader>
          <CardTitle>Admin List</CardTitle>
          <CardDescription>
            View existing admins and get temporary account access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Get Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin._id}>
                  <TableCell>
                    {admin.user_id}
                    {admin.user_id == userId && (
                      <span className="text-green-500 ml-2">You</span>
                    )}
                  </TableCell>
                  <TableCell>{admin.role}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <SquarePen
                          className="lg:ml-5"
                          onClick={() => openDialog(admin)}
                        />
                      </DialogTrigger>
                      {isDialogOpen && (
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Get Temporary Access</DialogTitle>
                            <DialogDescription>
                              Please Remember Changed Security Code. Ask the
                              actual admin to change their password once your
                              work is completed.
                            </DialogDescription>
                          </DialogHeader>
                          <Input
                            placeholder="Temporary Password"
                            type="password"
                            value={tempPassword}
                            onChange={(e) => setTempPassword(e.target.value)}
                          />
                          <Input
                            placeholder="Security Code"
                            type="password"
                            value={securityCode}
                            onChange={(e) => setSecurityCode(e.target.value)}
                          />
                          <Button className="bg-[#B21FDC] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-[#8707a8] hover:shadow-md" onClick={getTemporaryAccess}>Submit</Button>
                        </DialogContent>
                      )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}
