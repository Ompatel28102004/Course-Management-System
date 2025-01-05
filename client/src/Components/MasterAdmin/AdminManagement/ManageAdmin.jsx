import React, { useState, useEffect } from "react";
import axios from "axios";
import { HOST } from "../../../utils/constants";
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
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
} from "../../../Components/ui/dialog";
import Toast from "../../Toast/Toast";
import { set } from "date-fns";

export default function ManageAdmin() {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');

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
      setAdmins(
        response.data.admins.filter((admin) => admin.user_id != userId) || []
      );
    } catch (error) {
      console.error("Error fetching admins:", error);
      showToastNotification("Failed to fetch admins. Please try again.");
    }
  };

  const deleteAdmin = async (adminId) => {
    if (!securityCode.trim()) {
      setError('Security code is required.');
      return;
    }
    try {
      const response = await axios.delete(
        `${HOST}/api/master-admin/delete-admin`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { masterAdminId: userId, adminId, securityCode },
        }
      );
      if (response.status === 200) {
        setAdmins(admins.filter((admin) => admin.user_id !== adminId));
        showToastNotification("Admin has been deleted successfully.");
      } else {
        showToastNotification(
          response.data.message || "Failed to delete admin. Please try again."
        );
      }
    } catch (error) {
      console.log(error);
      showToastNotification(`Failed to delete admin. Please try again. (${error.response.data.message})`);
    }
    setError("");
    setIsDialogOpen(false);
  };

  const showToastNotification = (message) => {
    setMessage(message);
    setTimeout(() => setMessage(""), 5000);
  };

  const filteredAdmins = admins.filter(
    (admin) =>
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
            <TableHead className="p-2 border border-gray-300">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAdmins.map((admin) => (
            <TableRow key={admin.user_id} className="hover:bg-gray-50">
              <TableCell className="p-2 border border-gray-300">
                {admin.user_id}
              </TableCell>
              <TableCell className="p-2 border border-gray-300">
                {admin.email}
              </TableCell>
              <TableCell className="p-2 border border-gray-300">
                {admin.role}
              </TableCell>
              <TableCell className="p-2 border border-gray-300">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setSelectedAdmin(admin);
                    setIsDialogOpen(true);
                  }}
                  // onClick={() => deleteAdmin(admin.user_id)}
                  className="mr-2"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#eb3939]">Delete Admin</DialogTitle>
            <DialogDescription className="text-[#222222] text-lg">
              The Data of Admin cannot be recovered once deleted. Are you sure you want to delete?
            </DialogDescription>
            <DialogDescription className="text-[#eb3939] text-lg">Please Enter your Security Code to Delete Admin.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Security Code"
            type="password"
            value={securityCode}
            onChange={(e) => setSecurityCode(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm text-">{error}</p>}
          <div className="flex justify-end space-x-4">
            <Button
              onClick={() => {
                deleteAdmin(selectedAdmin.user_id);
              }}
              className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-red-700"
            >
              Yes, Delete
            </Button>
            <Button
              onClick={() => setIsDialogOpen(false)}
              className="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-gray-400"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {message && <Toast message={message} />}
    </div>
  );
}
