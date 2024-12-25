import Community from "../model/CommunityModel.js";
import Message from "../model/MessageModel.js";
export const getCommunityMessages = async (request, response, next) => {
  try {
    const { communityId } = request.params;

    // Fetch the community by the custom string ID
    const community = await Community.findOne({ communityId }).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "Name ImgUrl user_id",
      },
    });

    if (!community) {
      return response.status(404).send("Community not found");
    }

    const messages = community.messages;
    return response.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    return response.status(500).send("Internal Server Error");
  }
};
export const DeleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    // Find and delete the message
    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Remove the message ID from the community's messages array
    const community = await Community.findOneAndUpdate(
      { messages: messageId },
      { $pull: { messages: messageId } },
      { new: true }
    );

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    return res.status(200).json({ messages: community.messages });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getCommunityDetails = async (request, response, next) => {
  try {
    const { communityId } = request.params;

    // Fetch the community by the custom string ID
    const community = await Community.findOne({ communityId }).populate({
      path: "admin",
      select: "user_id",
    });
    
    if (!community) {
      return response.status(404).send("Community not found");
    }

    return response.status(200).json({ community });
  } catch (error) {
    console.error(error);
    return response.status(500).send("Internal Server Error");
  }
};