import User from '../model/UserModel.js';
import Fee from '../model/FeesModel.js';
import AdminActivity from '../model/AdminActivityModel.js';
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
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
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
        const activities = await AdminActivity.find();

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
        });

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
        const { adminId, masterAdminId } = req.query;

        // Verify master admin
        const masterAdmin = await User.findOne({ user_id: masterAdminId });
        if (!masterAdmin || masterAdmin.role !== 'master-admin') {
            return res.status(403).json({
                message: "Unauthorized. Only master admin can delete admins."
            });
        }

        const deletedAdmin = await User.findOneAndDelete({ user_id: adminId });
        if (!deletedAdmin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

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

