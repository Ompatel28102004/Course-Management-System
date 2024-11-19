import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../Components/ui/card"
import { Button } from "../../../Components/ui/button"
import { ArrowUp, ArrowDown, Bell } from 'lucide-react'

export default function Overview() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      

      <main className="flex-1">
        <div className="container py-6 space-y-8">
          {/* System Overview Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <OverviewCard title="Total Users" count="1,245" change={5} />
              <OverviewCard title="Pending Payments" count="32" change={-10} />
              <OverviewCard title="Active Sessions" count="120" change={15} />
            </div>
          </section>

          {/* Activity Logs Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Activity Logs</h2>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest actions performed in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <LogCard action="User 'JohnDoe' updated their profile" timestamp="10 mins ago" />
                  <LogCard action="Admin 'Admin01' deactivated user 'JaneDoe'" timestamp="1 hour ago" />
                  <LogCard action="System 'Study Session' scheduled" timestamp="2 hours ago" />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Notifications Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <NotificationCard title="New Admin Role Assigned" action="View Details" />
              <NotificationCard title="Security Alert Detected" action="View Alerts" />
              <NotificationCard title="System Update Required" action="Install Now" />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

// OverviewCard Component
const OverviewCard = ({ title, count, change }) => (
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
      <p className={`text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
        {change >= 0 ? <ArrowUp className="mr-1 h-4 w-4" /> : <ArrowDown className="mr-1 h-4 w-4" />}
        {Math.abs(change)}%
      </p>
    </CardContent>
  </Card>
)

// LogCard Component
const LogCard = ({ action, timestamp }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b last:border-b-0">
    <p className="text-sm mb-1 sm:mb-0">{action}</p>
    <small className="text-muted-foreground">{timestamp}</small>
  </div>
)

// NotificationCard Component
const NotificationCard = ({ title, action }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <Button variant="outline" className="w-full">{action}</Button>
    </CardContent>
  </Card>
)