import Fee from "../model/FeesModel.js";
import User from "../model/UserModel.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ role: "finance-admin" }, {
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

export const Overview = async (req, res) => {
  try {
    // Fetch and process fees data
    const feesData = await Fee.aggregate([
      {
        $unwind: "$semesters", // Unwind the semesters array
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
          totalStudents: { $sum: 1 }, // Count the number of unique students in each group
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
      {
        $sort: { degree: 1 }, // Sort by degree
      },
    ]);

    // Calculate overall total collected, pending amounts, and total enrolled students
    const overallData = await Fee.aggregate([
      {
        $unwind: "$semesters", // Unwind the semesters array
      },
      {
        $group: {
          _id: "$studentId", // Group by studentId to get unique students
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
          _id: null, // Group everything together
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
      message: "Overview data retrieved successfully",
      data: {
        fees: feesData,
        overall: overallData[0], // Total collected, pending, and enrolled students without considering branch and degree
      },
    });
  } catch (error) {
    console.error("Error retrieving overview data:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const pendingFees = async(req, res) => {
    const remainingfees = await Fee.aggregate([
      { 
        $unwind: "$semesters" 
      },
      { 
        $match: { 
          "semesters.status": { $in: ["unpaid", "pending", "overdue","waived"] } 
        }
      },
      { 
        $lookup: {
          from: "students", // Assuming a separate "students" collection exists
          localField: "studentId",
          foreignField: "enrollment",
          as: "studentDetails"
        }
      },
      {
        $unwind: "$studentDetails"
      },
      { 
        $group: { 
          _id: { degree: "$semesters.degree", branch: "$semesters.branch" },
          students: { 
            $push: { 
              name:{ 
                $concat: [
                  "$studentDetails.FirstName", 
                  " ", 
                  "$studentDetails.LastName"
                ]
              },
              enrollmentNumber: "$studentDetails.enrollment",
              pendingAmount: "$semesters.amount",
              dueDate: "$semesters.dueDate",
              status: "$semesters.status",
              semester:"$semesters.semester"
            } 
          }
        }
      },
      { 
        $group: {
          _id: "$_id.degree",
          branches: { 
            $push: { 
              branch: "$_id.branch",
              students: "$students"
            } 
          }
        }
      },
    ])
    
    if(!remainingfees){
      return res.status(404).json({error: "error in fetching data"});
    }

    res.status(200).json(remainingfees);
};

export const dueDates = async(req, res) => {
    const dates = await Fee.aggregate([
      {
        $unwind: "$semesters" // Flatten the semesters array
      },
      {
        $match: {
          "semesters.status": { $in: ["unpaid", "pending", "overdue"] }, // Filter unpaid/pending fees
        }
      },
      {
        $group: {
          _id: {
            degree: "$semesters.degree",
            branch: "$semesters.branch",
            semester: "$semesters.semester"
          },
          totalPendingAmount: { $sum: "$semesters.amount" }, // Sum up the pending amounts
          dueDate: { $min: "$semesters.dueDate" } // Get the earliest due date
        }
      },
      {
        $sort: {
          "_id.degree": 1,
          "_id.branch": 1,
          "_id.semester": 1
        }
      },
      {
        $group: {
          _id: "$_id.degree",
          branches: {
            $push: {
              branch: "$_id.branch",
              semesters: {
                semester: "$_id.semester",
                dueDate: "$dueDate",
                totalPendingAmount: "$totalPendingAmount"
              }
            }
          }
        }
      }
    ]);

    if(dates.length === 0) {
      return res.status(404).json({message: "No pending fees found", details: dates});
    }

    if(!dates){
      return res.status(404).json({error: "error in fetching data"});
    }

    res.status(200).json(dates);
};