import Community from "../model/CommunityModel.js";

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
