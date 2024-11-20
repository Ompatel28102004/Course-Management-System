"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download } from "lucide-react"

const mockInvoices = [
  { id: "INV-001", date: "2023-11-15", enrollmentNumber: 221040011021, studentName: "Patel Ramesh", degree: "BSc", branch: "Computer Science", sem: 5, amount: 5000, status: "Pending" },
  { id: "INV-002", date: "2023-11-20", enrollmentNumber: 221040011022, studentName: "Kumar Abhijit", degree: "MSc", branch: "Electrical Engineering", sem: 2, amount: 6000, status: "Overdue" },
  { id: "INV-003", date: "2023-11-25", enrollmentNumber: 221040011023, studentName: "Pandey Aditya", degree: "PhD", branch: "Mechanical Engineering", sem: 1, amount: 7500, status: "Pending" },
  { id: "INV-004", date: "2023-11-30", enrollmentNumber: 221040011024, studentName: "Jaimin Unagar", degree: "BSc", branch: "Civil Engineering", sem: 4, amount: 5000, status: "Overdue" },
  { id: "INV-005", date: "2023-12-05", enrollmentNumber: 221040011025, studentName: "Hitangi Modi", degree: "MSc", branch: "Mechanical Engineering", sem: 3, amount: 6000, status: "Pending" },
  { id: "INV-006", date: "2023-12-15", enrollmentNumber: 221040011026, studentName: "Premal Modi", degree: "BSc", branch: "Computer Science", sem: 5, amount: 5000, status: "Pending" },
  { id: "INV-007", date: "2023-12-20", enrollmentNumber: 221040011027, studentName: "Kajal Parmar", degree: "MSc", branch: "Civil Engineering", sem: 2, amount: 6000, status: "Overdue" },
  { id: "INV-008", date: "2023-12-23", enrollmentNumber: 221040011028, studentName: "Rahul Bhavisi", degree: "PhD", branch: "Mechanical Engineering", sem: 1, amount: 7500, status: "Overdue" },
  { id: "INV-009", date: "2023-12-30", enrollmentNumber: 221040011029, studentName: "Yash Prajapati", degree: "BSc", branch: "Electrical Engineering", sem: 4, amount: 5000, status: "Overdue" },
  { id: "INV-010", date: "2023-12-31", enrollmentNumber: 221040011020, studentName: "Shahil Gohil", degree: "MSc", branch: "Mechanical Engineering", sem: 3, amount: 6000, status: "Pending" },
]

export default function InvoiceDeatils() {
  const [invoices, setInvoices] = useState(mockInvoices)
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase()
    setSearchTerm(term)
    
    if (term === "") {
      setInvoices(mockInvoices)
    } else {
      const filteredInvoices = mockInvoices.filter(
        invoice => 
          invoice.id.toLowerCase().includes(term) ||
          invoice.studentName.toLowerCase().includes(term)
      )
      setInvoices(filteredInvoices)
    }
  }

  const handleDownload = (semesterInfo) => {
    const receiptWindow = window.open("", "_blank");
    if (!receiptWindow) return;
    const receiptContent = `
      <html>
      <head>
        <title>Fee Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          .details { margin: 20px 0; }
          .company { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="company">Course Management System</div>
        <h1>Invoice Receipt</h1>
        <div class="details">
          <table>
            <tr>
              <th>Student Name</th>
              <td>${mockInvoices.studentName}</td>
            </tr>
            <tr>
              <th>Enrollment Number</th>
              <td>${mockInvoices.enrollmentNumber}</td>
            </tr>
            <tr>
              <th>Degree</th>
              <td>${mockInvoices.degree}</td>
            </tr>
            <tr>
              <th>Branch</th>
              <td>${mockInvoices.branch}</td>
            </tr>
            <tr>
              <th>Semester</th>
              <td>${mockInvoices.sem}</td>
            </tr>
            <tr>
              <th>Amount Paid</th>
              <td>${mockInvoices.amount}</td>
            </tr>
            <tr>
              <th>Date</th>
              <td>${new Date().toLocaleDateString("en-GB")}</td>
            </tr>
            <tr>
              <th>Payment Status</th>
              <td>${mockInvoices.status}</td>
            </tr>
          </table>
        </div>
        <p style="text-align: center; margin-top: 40px;">This is a computer-generated receipt and does not require a signature.</p>
        <script>
          window.print();
          window.onafterprint = function() { window.close(); }
        </script>
      </body>
      </html>
    `;

    receiptWindow.document.write(receiptContent);
    receiptWindow.document.close();
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      // case "paid":
        // return "text-green-600"
      case "pending":
        return "text-yellow-600"
      case "overdue":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Invoices</h1>
      <div className="mb-4 relative">
        {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /> */}
        <Input
          type="text"
          placeholder="Search by invoice number or student name"
          value={searchTerm}
          onChange={handleSearch}
          className="pl-10"
        />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Enrollment Number</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Degree</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Download</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                <TableCell>{invoice.enrollmentNumber}</TableCell>
                <TableCell>{invoice.studentName}</TableCell>
                <TableCell>{invoice.degree}</TableCell>
                <TableCell>{invoice.branch}</TableCell>
                <TableCell>₹{invoice.amount.toFixed(2)}</TableCell>
                <TableCell className={getStatusColor(invoice.status)}>{invoice.status}</TableCell>
                <TableCell>
                  <Button
                    className='hover:bg-custom-selectedPurple hover:text-white'
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(invoice.id)}
                    aria-label={`Download invoice ${invoice.id}`}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
