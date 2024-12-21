import { Server as SocketIOServer } from "socket.io";
import Message from "./model/MessageModel.js";
import Channel from "./model/CommunityModel.js";
import User from "./model/UserModel.js";
const setupSocket = (server) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: process.env.ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    const userSocketMap = new Map();

    const disconnect = (socket) => {
        console.log(`Client Disconnected: ${socket.id}`);
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId);
                console.log(`User disconnected: ${userId}`);
                break;
            }
        }
    };

    const sendChannelMessage = async (message) => {
        try {
            const { communityId, userId, content, messageType, fileUrl } = message;

            const user = await User.findOne({ user_id: Number(userId) });

            const createdMessage = await Message.create({
                sender: user._id,
                recipient: null,
                content,
                messageType,
                Timestamp: new Date(),
                fileUrl,
            });

            const messageData = await Message.findById(createdMessage._id)
                .populate("sender", "Name ImgUrl user_id")
                .exec();

            // Update the channel with the new message
            await Channel.findOneAndUpdate(
                { communityId: communityId }, // Use the string field
                { $push: { messages: createdMessage._id } }
            );

            const channel = await Channel.findOne({ communityId: communityId }).populate("members");

            const finalData = { ...messageData._doc, communityId: channel.communityId };
            if (channel && channel.members) {
                channel.members.forEach((member) => {
                    const memberSocketId = userSocketMap.get(member.user_id.toString());
                    if (memberSocketId) {
                        console.log("Sending message to client:", finalData);
                        io.to(memberSocketId).emit("receive-channel-message", finalData);

                        // io.to(memberSocketId).emit("receive-channel-message", finalData);
                    }
                });
            }
        } catch (error) {
            console.error("Error sending channel message:", error);
        }
    };


    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            userSocketMap.set(userId, socket.id);
            console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
        } else {
            console.warn("User ID not provided during connection.");
        }

        socket.on("send-channel-message", sendChannelMessage);
        socket.on("disconnect", () => disconnect(socket));
    });
};

export default setupSocket;