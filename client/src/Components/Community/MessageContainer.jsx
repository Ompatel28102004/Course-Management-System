import React, { useState, useEffect, useRef } from "react";
import MessageBar from "./MessageBar";
import { GETMessage_ROUTE } from "../../utils/constants";
import { useSocket } from "../../context/SocketContext";
import { apiClient } from "@/lib/api-client";
import { format } from "date-fns"; // For formatting Timestamps

const MessageContainer = () => {
  const [messages, setMessages] = useState([]);
  const socket = useSocket();
  const userId = Number(localStorage.getItem("userId")); // Convert to number for comparison
  const communityId = "12345";
  const messagesEndRef = useRef(null); // Reference to the bottom of the messages container

  // Scroll to the bottom of the messages container
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Fetch messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      const response = await apiClient.get(GETMessage_ROUTE(communityId), {
        withCredentials: true,
      });
      setMessages(response.data.messages);
    };

    fetchMessages();
  }, []);

  // Automatically scroll to bottom when `messages` changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle socket events
  useEffect(() => {
    if (socket) {
      socket.on("receive-channel-message", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });

      return () => {
        socket.off("receive-channel-message");
      };
    }
  }, [socket]);

  const addMessage = (newMessage) => {
    socket.emit("send-channel-message", {
      userId: userId,
      content: newMessage,
      messageType: "text",
      communityId: communityId,
      fileUrl: null,
    });
  };

  const getFormattedDate = (Timestamp) => format(new Date(Timestamp), "MMM dd, yyyy");

  const renderDateSeparator = (index) => {
    const currentMessageDate = getFormattedDate(messages[index].Timestamp);
    const previousMessageDate =
      index > 0 ? getFormattedDate(messages[index - 1].Timestamp) : null;

    if (currentMessageDate !== previousMessageDate) {
      return (
        <div className="text-center text-sm text-gray-500 my-2">
          {currentMessageDate}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-3">
        {messages.map((message, index) => {
          const isSelf = message.sender.user_id === userId;

          return (
            <React.Fragment key={message._id || Math.random()}>
              {/* Render date separator */}
              {renderDateSeparator(index)}

              {/* Message */}
              <div
                key={message._id || Math.random()}
                className={`flex items-start gap-2 ${isSelf ? "flex-row-reverse" : "flex-row"
                  }`}
              >
                <div className="border border-gray-200 rounded-full">
                  <img
                    src={message.sender.ImgUrl || "default-avatar.png"}
                    alt="avatar"
                    className="w-12 h-12 rounded-full"
                  />
                </div>
                <div
                  className={`max-w-[70%] rounded-xl px-3 py-1.5 border text-sm ${isSelf
                      ? "bg-purple-100 border-purple-200"
                      : "bg-gray-100 border-gray-200"
                    }`}
                >
                  <p className="font-semibold text-gray-800">{message.sender.Name}</p>
                  <p className="text-gray-800">{message.content}</p>
                  <p className="text-gray-500 text-xs mt-1 text-right">
                    {format(new Date(message.Timestamp), "hh:mm a")}
                  </p>
                </div>
              </div>

            </React.Fragment>
          );
        })}
        {/* Dummy element to maintain scroll position */}
        <div ref={messagesEndRef} />
      </div>

      {/* MessageBar for sending messages */}
      <MessageBar addMessage={addMessage} />
    </div>
  );
};

export default MessageContainer;
