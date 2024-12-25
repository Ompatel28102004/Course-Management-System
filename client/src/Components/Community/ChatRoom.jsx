import React from "react";
import MessageContainer from "./MessageContainer";

const ChatRoom = () => {
  return (
    <div className="flex flex-col chat bg-white border border-gray-200">
      <div className="py-3 px-4 border-b border-gray-600">
        <h1 className="responsive">COMMUNITY</h1>
      </div>

      <MessageContainer />
    </div>
  );
};

export default ChatRoom;
