import mongoose from 'mongoose';

const adminActivitySchema = new mongoose.Schema({
    user_id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    activity: {
        type: String,
        required: true,
        trim: true,
    },
    masterAdminResponse: {
        type: String,
        default: null,
        trim: true,
    },
    status: {
        type: String,
        enum: ['Reviewed', 'Pending'],
        default: false,
    },
    isSettled: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Middleware to update `updatedAt` on modification
adminActivitySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const AdminActivity = mongoose.model('adminactivities', adminActivitySchema);

export default AdminActivity;
