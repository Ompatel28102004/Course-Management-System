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
