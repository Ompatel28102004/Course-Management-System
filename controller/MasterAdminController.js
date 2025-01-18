import User from '../model/UserModel.js';
import Fee from '../model/FeesModel.js';
import Community from '../model/CommunityModel.js';
import AdminActivity from '../model/AdminActivityModel.js';
import Attendance from '../model/AttendanceModel.js';
import Feedback from '../model/feedbackModel.js';
import Course from '../model/CourseModel.js';
import bcrypt from "bcrypt";

// Helper function to generate CollegeEmail
const generateCollegeEmail = (role) => {
    let rolePrefix = '';

    // Assign the role prefix based on the role
    if (role === 'academic-admin') {
        rolePrefix = 'academic.admin';
    } else if (role === 'finance-admin') {
        rolePrefix = 'finance.admin';
    } else if (role === 'master-admin') {
        rolePrefix = 'master.admin';
    }

    // Generate the email based on the role prefix
    return `${rolePrefix}@iitram.ac.in`;
};

const generateSixDigitSecurityCode = () => {
    const alphabets = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789'
    let result = '';
    for (let i = 0; i < 3; i++) {
        result += alphabets.charAt(Math.floor(Math.random() * alphabets.length));
    }
    for (let i = 0; i < 3; i++) {
        result += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return result;
};

export const getProfile = async (req, res) => {
    try {
      const user = await User.findOne({ role: "master-admin" }, {
        user_id: 1,
        role: 1,
        email: 1,
      });
  
      return res.status(200).json({
        user,
        message: 'user Data retrieved successfully!',
      });
    } catch (error) {
      console.error('Error fetching User:', error);
      return res.status(500).send({ message: 'Internal Server Error', error });
    }
};


export const getAllAdminActivities = async (req, res) => {
    try {
        // Fetch all admin activities
        const activities = await AdminActivity.find().sort({ updatedAt: -1 });

        if (!activities || activities.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No admin activities found.",
            });
        }

        return res.status(200).json({
            success: true,
            activities,
        });
    } catch (error) {
        console.error("Error fetching admin activities:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


export const submitActivityResponse = async (req, res) => {
    try {
        const { id, response, status } = req.body;

        const activity = await AdminActivity.findById(id);

        if (!activity) {
            return res.status(404).json({
                success: false,
                message: "Activity not found"
            });
        }

        activity.masterAdminResponse = response;
        activity.status = status;
        activity.updatedAt = Date.now();

        await activity.save();

        return res.status(200).json({
            success: true,
            message: "Response submitted successfully",
            activity: activity
        });
    } catch (error) {
        console.error("Error submitting response:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

export const submitReviewedActivityReply = async (req, res) => {
    const { adminName, reply, _id } = req.body;

    if (!adminName || !reply || !_id) {
        return res.status(400).json({
            success: false,
            message: "Admin name, reply, and _id are required.",
        });
    }

    try {
        // Find the admin activity by _id
        const activity = await AdminActivity.findById(_id);

        if (!activity) {
            return res.status(404).json({
                success: false,
                message: "Admin activity not found.",
            });
        }

        // Create a new reply
        const newReply = {
            adminName,
            reply,
            date: new Date(),
        };

        // Add the new reply to the replies array
        activity.replies.push(newReply);

        // Save the updated activity
        await activity.save();

        return res.status(201).json({
            success: true,
            message: "Reply saved successfully.",
            activity,
        });
    } catch (error) {
        console.error("Error saving reply:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const settleActivity = async (req, res) => {
    const { _id } = req.body;

    if (!_id) {
        return res.status(400).json({
            success: false,
            message: "Activity ID is required.",
        });
    }

    try {
        // Find the activity by _id and update isSettled to true
        const activity = await AdminActivity.findByIdAndUpdate(
            _id,
            { isSettled: true },
            { new: true }
        );

        if (!activity) {
            return res.status(404).json({
                success: false,
                message: "Activity not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Activity settled successfully.",
            activity,
        });
    } catch (error) {
        console.error("Error settling activity:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const deleteAllSettledActivity = async (req, res) => {
    try {
        const result = await AdminActivity.deleteMany({ isSettled: true });

        if (result.deletedCount === 0) {
            return res.status(200).json({
                success: false,
                message: "No settled activities found.",
            });
        }

        const message = result.deletedCount === 1
            ? "1 settled activity deleted successfully."
            : `${result.deletedCount} settled activities deleted successfully.`;

        return res.status(200).json({
            success: true,
            message,
        });
    } catch (error) {
        console.error("Error deleting settled activities:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const addAdmin = async (req, res) => {
    try {
        const { masterAdminId, newAdminID, newAdminPassword, adminRole } = req.body;

        // Verify master admin
        const masterAdmin = await User.findOne({ user_id: masterAdminId });
        if (!masterAdmin || masterAdmin.role !== 'master-admin') {
            return res.status(403).json({
                message: "Unauthorized. Only master admin can add new admins."
            });
        }

        // Generate email based on the role
        const email = generateCollegeEmail(adminRole);

        // Validate input
        if (!email || !newAdminPassword || !adminRole) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Validate role
        const validRoles = ['master-admin', 'academic-admin', 'finance-admin'];
        if (!validRoles.includes(adminRole.toLowerCase())) {
            return res.status(400).json({
                message: "Invalid role. Must be either 'master-admin', 'academic-admin', or 'finance-admin'"
            });
        }
    
        // Format adminName based on the role
        const formatAdminName = (role) => {
            return role
                .split('-') // Split the role into words by hyphen
                .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
                .join(' '); // Join the words with a space
        };

        const adminName = formatAdminName(adminRole);

        const salt = await bcrypt.genSalt(10);

        // Hash the temporary password
        const hashedPassword = await bcrypt.hash(newAdminPassword, salt);

        // Generate and hash a security code
        const securityCode = generateSixDigitSecurityCode();

        const hashedSecurityCode = await bcrypt.hash(securityCode, salt);

        // Create admin user
        const newAdmin = await User.create({
            user_id: newAdminID,
            email,
            password: hashedPassword,
            role: adminRole,
            securityCode: hashedSecurityCode,
            Name: adminName,
            ImgUrl: "https://res.cloudinary.com/dipuxyudm/image/upload/v1732177603/rglcbivhx90hy4m7uzjg.png",
        });

        await Community.findOneAndUpdate(
            { communityId: "12345" },
            { $push: { members: newAdmin._id, admin:  newAdmin._id} }
        );

        await AdminActivity.create({ user_id: masterAdminId, name: "Master Admin", activity: `Created ${adminName} (${newAdminID})`, status: "Pending" });

        return res.status(201).json({
            success: true,
            admin: {
                user_id: newAdmin.user_id,
                email: newAdmin.email,
                role: newAdmin.role,
                securityCode: securityCode
            },
            message: `Admin created successfully! Role: ${adminRole}`
        });

    } catch (error) {
        console.error("Error creating admin:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};


export const getAdmins = async (req, res) => {
    try {
        const { masterAdminId } = req.query;
        // Verify master admin
        const masterAdmin = await User.findOne({user_id: masterAdminId});
        if (!masterAdmin || masterAdmin.role !== 'master-admin') {
            return res.status(403).json({
                message: "Unauthorized. Only master admin can view all admins."
            });
        }

        const admins = await User.find({
            role: { $in: ['master-admin', 'academic-admin', 'finance-admin'] }
        })

        return res.status(200).json({
            success: true,
            admins
        });

    } catch (error) {
        console.error("Error fetching admins:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

export const deleteAdmin = async (req, res) => {
    try {
        const { adminId, masterAdminId, securityCode } = req.query;

        // Verify master admin
        const masterAdmin = await User.findOne({ user_id: masterAdminId });
        if (!masterAdmin || masterAdmin.role !== 'master-admin') {
            return res.status(403).json({
                message: "Unauthorized. Only master admin can delete admins."
            });
        }

        // Check security code
        const isMatch = await bcrypt.compare(securityCode, masterAdmin.securityCode);
        if (!isMatch) {
            return res.status(403).json({
                message: "Unauthorized. Incorrect security code."
            });
        }

        const deletedAdmin = await User.findOneAndDelete({ user_id: adminId });
        if (!deletedAdmin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        await AdminActivity.create({ user_id: masterAdminId, name: "Master Admin", activity: `Deleted Admin with Admin ID: ${adminId}`, status: "Pending" });

        return res.status(200).json({
            success: true,
            message: "Admin deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting admin:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};


export const getTemporaryAccess = async (req, res) => {
    try {
        const { masterAdminId, adminId, tempPassword, tempSecurityCode } = req.body;
        
        // Verify master admin
        const masterAdmin = await User.findOne({ user_id: masterAdminId });
        if (!masterAdmin || masterAdmin.role !== 'master-admin') {
            return res.status(403).json({
                message: "Unauthorized. Only master admin can get temporary access."
            });
        }

        // Ensure tempPassword and tempSecurityCode are not undefined or null
        if (!tempPassword || !tempSecurityCode) {
            return res.status(400).json({
                message: "Temporary password and security code are required."
            });
        }

        // Hash the temporary password and security code
        const salt = await bcrypt.genSalt(10);
        const hashedTempPassword = await bcrypt.hash(tempPassword, salt);
        const hashedTempSecurityCode = await bcrypt.hash(tempSecurityCode, salt);

        // Update the admin's password and security code
        const updatedAdmin = await User.findOneAndUpdate(
            { user_id: adminId },
            { password: hashedTempPassword, securityCode: hashedTempSecurityCode },
            { new: true }
        );

        if (!updatedAdmin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }
        
        await AdminActivity.create({ user_id: masterAdminId, name: "Master Admin", activity: `Got Temporary access of Admin with Admin ID: ${adminId}`, status: "Pending" });

        return res.status(200).json({
            success: true,
            message: "Temporary access granted. Please provide them new security code and remind the admin to change their password once done.",
        });

    } catch (error) {
        console.error("Error granting temporary access:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

export const getTotalUsers = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPendingUnpaidOverdue = await Fee.aggregate([
            { $unwind: "$semesters" },
            { $match: { "semesters.status": { $in: ["pending", "unpaid", "overdue"] } } },
            { $count: "total" }
        ]);

        const total = totalPendingUnpaidOverdue.length > 0 ? totalPendingUnpaidOverdue[0].total : 0;

        return res.status(200).json({
            success: true,
            totalUsers: totalUsers,
            totalPendingUnpaidOverdue: total
        });
    } catch (error) {
        console.error("Error fetching total users and fees status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

export const generateFeesReport = async (req, res) => {
  const { startDate, endDate } = req.query;

  // Validate date inputs
  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: "Start date and end date are required.",
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    return res.status(400).json({
      success: false,
      message: "Start date must be before or equal to end date.",
    });
  }

  try {
    // Fetch and process fees data within the date range
    const feesData = await Fee.aggregate([
      { $unwind: "$semesters" },
      {
        $match: {
          "semesters.createdAt": {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            studentId: "$studentId",
            degree: "$semesters.degree",
            branch: "$semesters.branch",
          },
          totalCollected: {
            $sum: {
              $cond: [{ $eq: ["$semesters.status", "paid"] }, "$semesters.amount", 0],
            },
          },
          totalPending: {
            $sum: {
              $cond: [{ $eq: ["$semesters.status", "pending"] }, "$semesters.amount", 0],
            },
          },
        },
      },
      {
        $group: {
          _id: {
            degree: "$_id.degree",
            branch: "$_id.branch",
          },
          totalCollected: { $sum: "$totalCollected" },
          totalPending: { $sum: "$totalPending" },
          totalStudents: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.degree",
          branches: {
            $push: {
              branch: "$_id.branch",
              collectedAmount: "$totalCollected",
              pendingAmount: "$totalPending",
              totalStudents: "$totalStudents",
            },
          },
          totalCollected: { $sum: "$totalCollected" },
          totalPending: { $sum: "$totalPending" },
        },
      },
      {
        $project: {
          degree: "$_id",
          branches: 1,
          totalCollected: 1,
          totalPending: 1,
          totalStudents: 1,
          _id: 0,
        },
      },
      { $sort: { degree: 1 } },
    ]);

    // Calculate overall total collected, pending amounts, and total enrolled students
    const overallData = await Fee.aggregate([
      { $unwind: "$semesters" },
      {
        $match: {
          "semesters.createdAt": {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: "$studentId",
          totalCollected: {
            $sum: {
              $cond: [{ $eq: ["$semesters.status", "paid"] }, "$semesters.amount", 0],
            },
          },
          totalPending: {
            $sum: {
              $cond: [{ $eq: ["$semesters.status", "pending"] }, "$semesters.amount", 0],
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: "$totalCollected" },
          totalPending: { $sum: "$totalPending" },
        },
      },
      {
        $project: {
          _id: 0,
          totalCollected: 1,
          totalPending: 1,
        },
      },
    ]);

    // Combine and send response
    return res.status(200).json({
      message: "Fees report data retrieved successfully",
      data: {
        fees: feesData,
        overall: overallData[0],
      },
    });
  } catch (error) {
    console.error("Error retrieving fees report data:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const generateAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date inputs
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before or equal to end date.",
      });
    }

    // Fetch attendance records where at least one date overlaps with the given range
    const attendanceRecords = await Attendance.find();

    if (!attendanceRecords.length) {
      return res.status(404).json({
        success: false,
        message: "No attendance records found for the specified date range.",
      });
    }

    // Collect all courseRefIDs from attendance records
    const courseRefIDs = attendanceRecords.map(
      (attendance) => attendance.courseRefID
    );

    // Fetch all referenced courses in a single query
    const courses = await Course.find({ _id: { $in: courseRefIDs } });

    // Create a map for quick lookup of course details by ID
    const courseMap = {};
    courses.forEach((course) => {
      courseMap[course._id] = course;
    });

    // Prepare report data
    const reportData = attendanceRecords.map((attendance) => {
      const course = courseMap[attendance.courseRefID];

      if (!course) {
        return null; // Skip if the course is missing
      }

      const totalEnrolledStudents = attendance.enrolledStudents.length;

      // Filter attendance dates within the specified range
      const filteredDates = attendance.dates.filter(
        (dateEntry) =>
          new Date(dateEntry.date) >= start && new Date(dateEntry.date) <= end
      );

      // Calculate total lectures attended during the filtered period
      const totalLecturesAttended = attendance.enrolledStudents.reduce(
        (sum, student) => {
          const lecturesAttendedWithinRange = filteredDates.reduce(
            (subSum, dateEntry) => {
              const record = dateEntry.attendanceRecords.find(
                (rec) =>
                  rec.studentID === student.studentID &&
                  rec.status === "Present"
              );
              return record ? subSum + 1 : subSum;
            },
            0
          );
          return sum + lecturesAttendedWithinRange;
        },
        0
      );

      const averageLecturesAttended = totalEnrolledStudents
        ? Number((totalLecturesAttended / totalEnrolledStudents).toFixed(2))
        : 0;

      // Structure course data
      return {
        courseID: course.courseID,
        courseName: course.courseName,
        department: course.department,
        branch: course.branch,
        semester: course.semester,
        courseInstructorName: course.courseInstructorName,
        totalLectures: attendance.totalLectures,
        lecturesTaken: attendance.lecturesTaken,
        averageLecturesAttended,
      };
    });

    // Filter out null entries and respond with data
    const filteredReportData = reportData.filter((data) => data !== null);

    return res.status(200).json({
      success: true,
      report: filteredReportData,
    });
  } catch (error) {
    console.error("Error generating attendance report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate attendance report.",
      error: error.message,
    });
  }
};

export const generateFeedbackReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date inputs
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before or equal to end date.",
      });
    }

    // Fetch feedbacks within the date range
    const feedbacks = await Feedback.find({
      startDateTime: { $gte: start, $lte: end },
    });

    if (!feedbacks.length) {
      return res.status(404).json({
        success: false,
        message: "No feedback records found within the specified date range.",
      });
    }

    // Prepare feedback report data
    const reportData = feedbacks.map((feedback) => ({
      feedbackID: feedback.feedbackID,
      feedbackName: feedback.feedbackName,
      courseID: feedback.courseID,
      courseName: feedback.courseName,
      departmentID: feedback.departmentID,
      branch: feedback.branch,
      facultyID: feedback.facultyID,
      facultyName: feedback.facultyName,
      startDateTime: feedback.startDateTime,
      endDateTime: feedback.endDateTime,
      totalQuestions: feedback.questions.length,
      totalResponses: feedback.responses.length, // Count of responses
    }));

    // Send the filtered feedback report to the frontend
    return res.status(200).json({
      success: true,
      report: reportData,
    });
  } catch (error) {
    console.error("Error generating feedback report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate feedback report.",
      error: error.message,
    });
  }
};
