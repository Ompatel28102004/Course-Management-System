import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
    communityId:
    {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    admin: [{
        type: mongoose.Schema.ObjectId,
        ref: "users",
        required: true,
    }],
    members: [{ type: mongoose.Schema.ObjectId, ref: "users", required: true }],
    messages: [{
        type: mongoose.Schema.ObjectId, ref: "Messages"
    }],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
});

//to change the last updated community to show on top 
// communitySchema.pre("save", function (next) {
//     this.updatedAt = Date.now();
//     next();
// })

// communitySchema.pre("findOneAndUpdate", function (next) {
//     this.set({ updatedAt: Date.now() });
//     next();
// })

const community = mongoose.model("communitys", communitySchema);

export default community;