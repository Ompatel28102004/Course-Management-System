import React from "react";
import { useParams } from "react-router-dom";
import MessageContainer from "../../Community/MessageContainer";

const ChatRoom = () => {
  const { courseId } = useParams(); // Extract Course_Id from the route

  return (
    <div className="flex flex-col chat bg-white border border-gray-200">
      <div className="py-3 px-4 border-b border-gray-600">
        <h1 className="responsive">Course Forum - {courseId}</h1> {/* Use courseId */}
      </div>
      <MessageContainer Course_Id={courseId} />

    </div>
  );
};

export default ChatRoom;
