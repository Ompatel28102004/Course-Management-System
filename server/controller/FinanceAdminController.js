import Fee from "../model/FeesModel.js";
import Student from "../model/StudentModel.js";

export const Overview = async (req, res) => {
  try {
    // Fetch and process fees data
    const feesData = await Fee.aggregate([
      {
        $unwind: "$semesters", // Unwind the semesters array
      },
      {
        $match: {
          "semesters.status": "paid", // Include only paid semesters
        },
      },
      {
        $group: {
          _id: {
            degree: "$semesters.degree",
            branch: "$semesters.branch",
          },
          totalAmount: { $sum: "$semesters.amount" }, // Calculate total amount for each branch
        },
      },
      {
        $group: {
          _id: "$_id.degree",
          branches: {
            $push: {
              branch: "$_id.branch",
              amount: "$totalAmount",
            },
          },
          totalAmount: { $sum: "$totalAmount" }, // Calculate total amount for each degree
        },
      },
      {
        $project: {
          degree: "$_id",
          branches: 1,
          totalAmount: 1,
          _id: 0,
        },
      },
      {
        $sort: { degree: 1 }, // Sort by degree
      },
    ]);

    // Combine and send response
    return res.status(200).json({
      message: "Overview data retrieved successfully",
      data: {
        fees: feesData,
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
          "semesters.status": { $in: ["unpaid", "pending", "overdue"] } 
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
              status: "$semesters.status"
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