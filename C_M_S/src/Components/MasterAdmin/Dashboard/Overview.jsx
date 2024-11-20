import React, { useState, useEffect } from "react";
import axios from 'axios';
import { HOST } from "../../../utils/constants";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../Components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../../../Components/ui/alert";
import Toast from "../../Toast/Toast";

export default function Overview() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOverviewData();
    fetchRecentActivities();
  }, []);

  const fetchOverviewData = async () => {
    try {
      const response = await axios.get(`${HOST}/api/master-admin/get-total-users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
      });
      setTotalUsers(response.data.totalUsers);
      setPendingPayments(response.data.totalPendingUnpaidOverdue);
    } catch (error) {
      console.error('Error fetching overview data:', error);
      setError('Failed to fetch overview data. Please try again.');
      showToastNotification('Failed to fetch overview data. Please try again.');
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await axios.get(`${HOST}/api/master-admin/get-all-admin-activities`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
      });
      const activities = response.data.activities.slice(0, 3);
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setError('Failed to fetch recent activities. Please try again.');
      showToastNotification('Failed to fetch recent activities. Please try again.');
    }
  };

  const showToastNotification = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  // OverviewCard Component
  const OverviewCard = ({ title, count }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
      </CardContent>
    </Card>
  );

  // LogCard Component
  const LogCard = ({ action, timestamp }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b last:border-b-0">
      <p className="text-sm mb-1 sm:mb-0">{action}</p>
      <small className="text-muted-foreground">{timestamp}</small>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <div className="container py-6 space-y-8">
          {/* System Overview Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              System Overview
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <OverviewCard title="Total Users" count={totalUsers} />
              <OverviewCard title="Pending Payments" count={pendingPayments} />
            </div>
          </section>
          {/* Activity Logs Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Activity Logs</h2>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>
                  Latest actions performed in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <LogCard
                        key={index}
                        action={activity.name + " (" + (activity.user_id) + ") " + activity.activity}
                        timestamp={new Date(activity.createdAt).toLocaleString()}
                      />
                    ))
                  ) : (
                    <p>No recent activities available.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      {error && <Toast message={error} />}
    </div>
  );
}
