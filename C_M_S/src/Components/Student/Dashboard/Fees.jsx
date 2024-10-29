import React, { useState, useEffect } from "react";
import { Check, X, FileText, Loader2, AlertTriangle, Calendar } from "lucide-react";
import { HOST } from "../../../utils/constants"
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, semesterInfo }) => {
  if (!isOpen || !semesterInfo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Confirm Payment</h2>
        <p className="text-gray-600 mb-4">Are you sure you want to pay the fees for Semester {semesterInfo.semester}?</p>
        <p className="font-semibold text-lg text-gray-800 mb-6">Amount: ₹{semesterInfo.amount}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
};

const FeesSection = () => {
  const [feesData, setFeesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, semesterInfo: null });
  const [studentData, setStudentData] = useState(null);

  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId || !token) {
      setError("User ID or token not found. Please log in again.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [feesResponse, studentResponse] = await Promise.all([
          axios.get(`${HOST}/api/student/fees?userId=${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${HOST}/api/student/get-data`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { userId: userId },
          })
        ]);

        setFeesData(feesResponse.data);
        setStudentData(studentResponse.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, token]);

  const handlePayFees = (semesterInfo) => {
    setConfirmationModal({ isOpen: true, semesterInfo });
  };

  const confirmPayment = async () => {
    if (!confirmationModal.semesterInfo) return;

    const semesterId = confirmationModal.semesterInfo.semesterId;
    setPaymentProcessing(semesterId);
    setConfirmationModal({ isOpen: false, semesterInfo: null });

    try {
      // Simulate a 5-second loading state
      await new Promise(resolve => setTimeout(resolve, 5000));

      const response = await axios.put(
        `${HOST}/api/student/fees/update/${semesterId}`,
        { userId, status: 'paid' },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFeesData(prevData =>
        prevData.map(fee =>
          fee.semesterId === semesterId
            ? { ...fee, ...response.data.semester }
            : fee
        )
      );

      toast.success(response.data.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(error.response?.data?.message || "Failed to process payment", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setPaymentProcessing(null);
    }
  };

  const printReceipt = (semesterInfo) => {
    if (!studentData) return;

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
        <h1>Fee Receipt</h1>
        <div class="details">
          <table>
            <tr>
              <th>Student Name</th>
              <td>${studentData.FirstName.toUpperCase()} ${studentData.LastName.toUpperCase()}</td>
            </tr>
            <tr>
              <th>Enrollment Number</th>
              <td>${studentData.enrollment}</td>
            </tr>
            <tr>
              <th>Branch</th>
              <td>${studentData.Academic_info.Branch}</td>
            </tr>
            <tr>
              <th>Semester</th>
              <td>${semesterInfo.semester}</td>
            </tr>
            <tr>
              <th>Amount Paid</th>
              <td>₹${semesterInfo.amount}</td>
            </tr>
            <tr>
              <th>Date</th>
              <td>${new Date().toLocaleDateString('en-GB')}</td>
            </tr>
            <tr>
              <th>Payment Status</th>
              <td>Paid</td>
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentSemesterFee = feesData.length > 0 ? feesData[feesData.length - 1] : null;
  const previousSemesterFees = feesData.slice(0, -1);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-500 bg-green-100';
      case 'pending':
        return 'text-yellow-500 bg-yellow-100';
      case 'overdue':
        return 'text-red-500 bg-red-100';
      case 'waived':
        return 'text-blue-500 bg-blue-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <Check className="mr-1" size={16} />;
      case 'pending':
        return <AlertTriangle className="mr-1" size={16} />;
      case 'overdue':
        return <X className="mr-1" size={16} />;
      case 'waived':
        return <FileText className="mr-1" size={16} />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  const renderFeeCard = (fee, isCurrentSemester = false) => (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8 transition-all duration-300 hover:shadow-xl">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          {isCurrentSemester ? "Current Semester Fee" : `Semester: ${fee.semester}`}
        </h2>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 p-4 rounded-lg bg-gray-50">
          <div className="w-full lg:w-2/3 mb-4 lg:mb-0">
            <div className="flex items-center mb-2">
              <p className="text-xl font-semibold text-gray-800">Amount: ₹{fee.amount}</p>
            </div>
            <div className="flex items-center mb-2">
              <span className={`flex items-center px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(fee.status)}`}>
                {getStatusIcon(fee.status)} {fee.status}
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="mr-2" size={16} />
              <span>
                {fee.status === 'paid' 
                  ? `Paid on: ${formatDate(fee.paidAt)}`
                  : `Due date: ${formatDate(fee.dueDate)}`
                }
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 w-full lg:w-auto">
            {fee.status !== 'paid' && (
              <button
                onClick={() => handlePayFees(fee)}
                className={`w-full lg:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  paymentProcessing === fee.semesterId ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={paymentProcessing === fee.semesterId}
              >
                {paymentProcessing === fee.semesterId ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Processing...
                  </span>
                ) : (
                  "Pay Fees"
                )}
              </button>
            )}
            {fee.status === 'paid' && (
              <button
                onClick={() => printReceipt(fee)}
                className="w-full lg:w-auto px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                See Receipt
              </button>
            )}
          </div>
        </div>
        {fee.remarks && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700"><strong className="text-blue-700">Remarks:</strong> {fee.remarks}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Fees Management</h1>

      {/* Current Semester Fee */}
      {currentSemesterFee ? renderFeeCard(currentSemesterFee, true) : (
        <p className="text-red-500 text-center bg-red-100 p-4 rounded-lg">No current semester fee data available.</p>
      )}

      {/* Previous Semester Fees */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 mt-12">Previous Semester Fees</h2>
      {previousSemesterFees.length > 0 ? (
        previousSemesterFees.map((fee) => renderFeeCard(fee))
      ) : (
        <p className="text-yellow-600 text-center bg-yellow-100 p-4 rounded-lg">No previous semester fee data available.</p>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, semesterInfo: null })}
        
        onConfirm={confirmPayment}
        semesterInfo={confirmationModal.semesterInfo}
      />

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default FeesSection;