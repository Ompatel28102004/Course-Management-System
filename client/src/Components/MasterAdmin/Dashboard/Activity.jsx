import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { HOST } from "../../../utils/constants";
import { Button } from "../../../Components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../Components/ui/card";
import { Textarea } from "../../../Components/ui/textarea";
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
import Toast from "@/Components/Toast/Toast";
import "./Activity.css";

const Activity = () => {
  const [updates, setUpdates] = useState([]);
  const [response, setResponse] = useState("");
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [error, setError] = useState("");
  const [viewResponse, setViewResponse] = useState(false); // Toggle between respond and view response
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const response = await axios.get(
        `${HOST}/api/master-admin/get-all-admin-activities`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setUpdates(response.data.activities || []);
    } catch (error) {
      console.error("Error fetching updates:", error);
      setError("Failed to fetch updates. Please try again.");
      showToastNotification("Failed to fetch updates. Please try again.");
    }
  };

  const endOfPageRef = useRef(null);

  const scrollToEnd = () => {
    endOfPageRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleResponseSubmit = async () => {
    if (selectedUpdate) {
      try {
        await axios.put(
          `${HOST}/api/master-admin/submit-activity-response`,
          {
            id: selectedUpdate._id,
            response: response,
            status: "Reviewed",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        setUpdates(
          updates.map((update) =>
            update._id === selectedUpdate._id
              ? { ...update, status: "Reviewed", masterAdminResponse: response }
              : update
          )
        );

        setSelectedUpdate(null);
        setResponse("");
        showToastNotification("Response submitted successfully.");
      } catch (error) {
        console.error("Error submitting response:", error);
        setError("Failed to submit response. Please try again.");
        showToastNotification("Failed to submit response. Please try again.");
      }
    }
  };

  const handleReplySubmit = async () => {
    if (selectedUpdate && response.trim() !== "") {
      const newReply = {
        adminName: "Master Admin",
        reply: response,
        _id: selectedUpdate._id,
      };

      try {
        const res = await axios.put(
          `${HOST}/api/master-admin/submit-reviewed-activity-reply`,
          newReply,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (res.data.success) {
          setUpdates(
            updates.map((update) =>
              update._id === selectedUpdate._id
                ? {
                    ...update,
                    replies: [
                      ...(update.replies || []),
                      {
                        adminName: "Master Admin",
                        reply: response,
                        date: new Date(),
                      },
                    ],
                  }
                : update
            )
          );
          setSelectedUpdate((prevSelectedUpdate) =>
            prevSelectedUpdate && prevSelectedUpdate._id === selectedUpdate._id
              ? {
                  ...prevSelectedUpdate,
                  replies: [
                    ...(prevSelectedUpdate.replies || []),
                    {
                      adminName: "Master Admin",
                      reply: response,
                      date: new Date(),
                    },
                  ],
                }
              : prevSelectedUpdate
          );
          setResponse(""); // Clear response input
        } else {
          showToastNotification(res.data.message);
        }
      } catch (error) {
        console.error("Error submitting reply:", error);
        showToastNotification("Failed to submit reply. Please try again.");
      }
    }
  };

  const handleSettleActivity = async () => {
    if (selectedUpdate && selectedUpdate._id) {
      try {
        const res = await axios.put(
          `${HOST}/api/master-admin/settle-activity`,
          {
            _id: selectedUpdate._id,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (res.data.success) {
          setUpdates(
            updates.map((update) =>
              update._id === selectedUpdate._id
                ? { ...update, isSettled: true }
                : update
            )
          );

          setSelectedUpdate((prevSelectedUpdate) =>
            prevSelectedUpdate && prevSelectedUpdate._id === selectedUpdate._id
              ? { ...prevSelectedUpdate, isSettled: true }
              : prevSelectedUpdate
          );

          showToastNotification("Activity settled successfully.");
        } else {
          showToastNotification(res.data.message);
        }
      } catch (error) {
        console.error("Error settling activity:", error);
        showToastNotification("Failed to settle activity. Please try again.");
      }
    }
  };

  const handleClearAllSettledActivities = async () => {
    try {
      const res = await axios.delete(`${HOST}/api/master-admin/delete-all-settled-activity`,  {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (res.data.success) {
        fetchUpdates();
        setSelectedUpdate(null);
        showToastNotification(res.data.message);
      } else {
        showToastNotification(res.data.message);
      }
    } catch (error) {
      console.error("Error deleting settled activities:", error);
      showToastNotification("Failed to delete settled activities. Please try again.");
    }
  };

  const showToastNotification = (message) => {
    setError(message);
    setTimeout(() => setError(""), 5000);
  };

  return (
    <div className="min-h-screen bg-[#f0e6ff] p-10 font-sans">
      <div className="container mx-auto">
        {/* Recent Admin Updates Table */}
        <Card className="mb-8 bg-gradient-to-br from-white to-[#f3eaff] shadow-lg rounded-2xl">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-2xl font-semibold text-[#B21FDC]">
              Recent Admin Updates
            </CardTitle>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-[#f8e2f8e7] text-[#B21FDC] text-lg font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-[#edcff5] hover:shadow-md"
            >
              Clear All
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[#4A4A4A] font-semibold">
                    Admin
                  </TableHead>
                  <TableHead className="text-[#4A4A4A] font-semibold">
                    Action
                  </TableHead>
                  <TableHead className="text-[#4A4A4A] font-semibold">
                    Date
                  </TableHead>
                  <TableHead className="text-[#4A4A4A] font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-[#4A4A4A] font-semibold">
                    Respond
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {updates.map((update) => (
                  <TableRow key={update._id}>
                    <TableCell className="text-[#616161]">
                      {update.name + " (" + update.user_id + ")  "}
                    </TableCell>
                    <TableCell className="text-[#616161]">
                      {update.activity}
                    </TableCell>
                    <TableCell className="text-[#616161]">
                      {new Date(update.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-[#616161]">
                      {update.status}
                    </TableCell>
                    <TableCell className="flex justify-center align-center">
                      {update.status === "Reviewed" ? (
                        <Button
                          onClick={() => {
                            setSelectedUpdate(update);
                            setViewResponse(true);
                            scrollToEnd();
                          }}
                          className="bg-[#b31fdcac] text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 hover:bg-[#8807a8c0] hover:shadow-md hover:-translate-y-1"
                        >
                          View Response
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            setSelectedUpdate(update);
                            setViewResponse(false);
                            scrollToEnd();
                          }}
                          className="bg-[#B21FDC] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-[#8707a8] hover:shadow-md hover:-translate-y-1"
                        >
                          Respond
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Response Submission Form */}
        {selectedUpdate && !viewResponse && (
          <Card className="mb-8 bg-gradient-to-br from-white to-[#f3eaff] shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-[#B21FDC]">
                Respond to Update
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-[#4A4A4A]">
                Responding to: {selectedUpdate.activity} by{" "}
                {selectedUpdate.name + " (" + selectedUpdate.user_id + ")  "}
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

        {/* View Response */}
        {selectedUpdate && viewResponse && (
          <Card className="mb-8 bg-gradient-to-br from-white to-[#f3eaff] shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-[#B21FDC]">
                View Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-[#4A4A4A]">
                Activity: {selectedUpdate.activity} by{" "}
                {selectedUpdate.name + " (" + selectedUpdate.user_id + ")  "}
              </p>
              <p className="text-lg text-[#616161]">Response:</p>
              <div className="p-4 bg-[#f3eaff] border border-[#ddd] rounded-lg">
                {selectedUpdate.masterAdminResponse || "No response available."}
              </div>
              {/* Display the reply history */}
              <div className="mt-4">
                <h3 className="text-[#B21FDC] text-xl">Reply Thread:</h3>
                <div className="mt-2">
                  {selectedUpdate.replies?.map((reply, index) => (
                    <div
                      key={index}
                      className="p-2 bg-[#f3eaff] mb-2 border border-[#ddd] rounded-lg"
                    >
                      <p>
                        <strong>{reply.adminName}</strong> -{" "}
                        {new Date(reply.date).toLocaleString()}
                      </p>
                      <p>{reply.reply}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Reply form */}
              <Textarea
                placeholder="Add your reply..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="mb-4 border-[#ddd] rounded-lg focus:border-[#B21FDC] focus:ring-[#B21FDC] transition-all duration-300"
              />
              <div className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                  onClick={handleReplySubmit}
                  className="bg-[#B21FDC] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-[#8707a8] hover:shadow-md hover:-translate-y-1"
                >
                  Submit Reply
                </Button>
                {!selectedUpdate.isSettled ? (
                  <Button
                    onClick={handleSettleActivity}
                    className="bg-[#B21FDC] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-[#8707a8] hover:shadow-md hover:-translate-y-1"
                  >
                    Settle
                  </Button>
                ) : (
                  <Button className="bg-white text-[#35c52e] text-xl font-semibold py-1 px-2 rounded-lg transition-all duration-300 hover:shadow-md">
                    Settled
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Overview */}
        <Card className="bg-gradient-to-br from-white to-[#f3eaff] shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-[#B21FDC]">
              Summary Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-[#4A4A4A]">
              <li className="text-lg">Total Updates: {updates.length}</li>
              <li className="text-lg">
                Pending Reviews:{" "}
                {updates.filter((u) => u.status === "Pending").length}
              </li>
              <li className="text-lg">
                Reviewed Updates:{" "}
                {updates.filter((u) => u.status === "Reviewed").length}
              </li>
            </ul>
          </CardContent>
        </Card>
        <div ref={endOfPageRef}></div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Settled Activities</DialogTitle>
            <DialogDescription className="text-[#222222] text-lg">
              All the settled activities will be deleted and cannot be recovered. Are you sure you want to delete them?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4">
            <Button
              onClick={() => {
                handleClearAllSettledActivities();
                setIsDialogOpen(false);
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
      {/* Toast Notification */}
      {error && <Toast message={error} />}
    </div>
  );
};

export default Activity;
