import mongoose from 'mongoose';

// Subdocument schema for replies
const replySchema = new mongoose.Schema({
    adminName: {
        type: String,
        required: true,
    },
    reply: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

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
    replies: [replySchema], 
    status: {
        type: String,
        enum: ['Reviewed', 'Pending'],
        default: 'Pending',
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
