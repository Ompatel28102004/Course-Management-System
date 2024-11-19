import { useState } from 'react'
import { Button } from "../../../Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../Components/ui/card"
import { Input } from "../../../Components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../Components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../Components/ui/tabs"
import { Calendar } from "../../../Components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../../Components/ui/popover"
import { cn } from "../../../lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Download } from "lucide-react"

export default function Component() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-purple-200">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Filter Card */}
          <Card className="shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Start Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Status Select */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          <div className="w-full">
            <Tabs defaultValue="fees" className="w-full space-y-6">
              <div className="relative">
                <TabsList className="w-full h-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-3 w-full">
                    <TabsTrigger 
                      value="fees" 
                      className="w-full py-3 text-sm sm:text-base data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      Fees Report
                    </TabsTrigger>
                    <TabsTrigger 
                      value="attendance" 
                      className="w-full py-3 text-sm sm:text-base data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      Attendance Report
                    </TabsTrigger>
                    <TabsTrigger 
                      value="feedback" 
                      className="w-full py-3 text-sm sm:text-base data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      Feedback Report
                    </TabsTrigger>
                  </div>
                </TabsList>
              </div>

              {/* Tab Contents */}
              {['fees', 'attendance', 'feedback'].map((reportType) => (
                <TabsContent key={reportType} value={reportType} className="mt-6 space-y-6">
                  <Card className="shadow-lg">
                    <CardHeader className="text-center p-4 sm:p-6 border-b">
                      <CardTitle className="text-lg sm:text-xl font-semibold text-purple-700 capitalize">
                        {reportType} Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center p-6">
                      <p className="text-sm sm:text-base text-gray-600 text-center mb-6">
                        Download the {reportType} report for the selected date range and status.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                        <Button 
                          className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto min-w-[160px]"
                        >
                          <Download className="mr-2 h-4 w-4" /> 
                          <span>Download CSV</span>
                        </Button>
                        <Button 
                          className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto min-w-[160px]"
                        >
                          <Download className="mr-2 h-4 w-4" /> 
                          <span>Download PDF</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}