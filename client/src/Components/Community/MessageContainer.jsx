import React, { useState, useEffect, useRef } from "react";
import MessageBar from "./MessageBar";
import { GETMessage_ROUTE, DELETEMessage_ROUTE, GETCommunity_ROUTE } from "../../utils/constants";
import { useSocket } from "../../context/SocketContext";
import { apiClient } from "@/lib/api-client";
import { format } from "date-fns";
import { File, X, Download,Trash } from "lucide-react"; // Import icons

const MessageContainer = ({ Course_Id }) => {
  const [messages, setMessages] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const socket = useSocket();
  const userId = Number(localStorage.getItem("userId"));
  const communityId = Course_Id || "12345";
  const messagesEndRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
    const fetchCommunityDetails = async () => {
      try {
        const response = await apiClient.get(GETCommunity_ROUTE(communityId), {
          withCredentials: true,
        });
        if (response.data?.community) {
          const adminIds = response.data.community.admin.map(admin => admin.user_id) || []; // Extracting user_id from each admin object
          const isAdmin = adminIds.includes(userId);
          setIsAdmin(isAdmin); // New state to track admin status
        } else {
          console.warn("Community details not found in the response");
        }
      } catch (error) {
        console.error("Error fetching community details:", error);
      }
    };

    fetchMessages();
    fetchCommunityDetails();
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
      socket.on("message-deleted", ({ messageId, communityId }) => {
        setMessages((prevMessages) =>
          prevMessages.filter((message) => message._id !== messageId)
        );
      });


      return () => {
        socket.off("receive-channel-message");
        socket.off("message-deleted");
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

  // const deleteMessage = async (messageId) => {
  //   try {
  //     const response = await apiClient.delete(DELETEMessage_ROUTE(messageId)); 
  //     setMessages((prevMessages) =>
  //       prevMessages.filter((message) => message._id !== messageId)
  //     );
  //   } catch (error) {
  //     console.error("Failed to delete message:", error);
  //   }
  // };

  const deleteMessage = async (messageId) => {
    socket.emit("delete-message", { messageId, communityId });
  };
  const handleDownloadFile = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();
      const fileObjectUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = fileObjectUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        URL.revokeObjectURL(fileObjectUrl);
      }, 1000);
    } catch (error) {
      console.error("Failed to download file:", error);
    }
  };

  const renderFilePreview = () => {
    if (!previewFile) return null;

    return (
      <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-50 p-4">
        <button
          className="absolute top-4 right-4 bg-gray-200 rounded-full p-2 hover:bg-gray-300"
          onClick={() => setPreviewFile(null)}
        >
          <X className="w-6 h-6 md:w-8 md:h-8" />
        </button>

        {previewFile.type === "image" ? (
          <img
            src={previewFile.url}
            alt="Preview"
            className="max-w-full max-h-[55vh] rounded-lg cursor-pointer object-contain"
          />
        ) : (
          <div className="text-center">
            <File className="w-20 h-20 text-gray-500 mx-auto" />
            <p className="text-gray-800 mt-2">{previewFile.fileName}</p>
          </div>
        )}

        <button
          className="mt-1 bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
          onClick={() => handleDownloadFile(previewFile.url, previewFile.fileName)}
        >
          <Download className="inline-block w-5 h-5 mr-2" /> Download
        </button>
      </div>
    );
  };


  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {renderFilePreview()}

      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-3">
        {messages.map((message, index) => {
          const isSelf = message.sender.user_id === userId;

          return (
            <React.Fragment key={message._id || Math.random()}>
              {renderDateSeparator(index)}

              <div
                className={`flex items-start gap-2 ${isSelf ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className="w-10 h-10 md:w-12 md:h-12">
                  <img
                    src={message.sender.ImgUrl || "default-avatar.png"}
                    alt="avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div
                  className={`max-w-[80%] md:max-w-[70%] lg:max-w-[60%] rounded-xl px-3 py-1.5 border text-sm ${isSelf
                    ? "bg-purple-100 border-purple-200"
                    : "bg-gray-100 border-gray-200"}`}
                >
                  <p className="font-semibold text-gray-800">{message.sender.Name} | {message.sender.user_id}</p>
                  {message.messageType === "image" ? (
                    <img
                      src={message.fileUrl}
                      alt={message.content}
                      className="w-full max-w-[250px] max-h-[200px] md:max-h-[250px] rounded-lg cursor-pointer object-contain"
                      onClick={() =>
                        setPreviewFile({
                          url: message.fileUrl,
                          type: "image",
                          fileName: message.content,
                        })
                      }
                    />
                  ) : message.messageType === "file" && message.fileUrl ? (
                    <button
                      onClick={() => handleDownloadFile(message.fileUrl, message.content)}
                      className="text-purple-500 flex items-center gap-1 text-sm md:text-base break-words"
                    >
                      <File className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="break-words">{message.content}</span>
                    </button>
                  ) : (
                    <p className="text-gray-800">{message.content}
                    </p>

                  )}
                  

                  <p className="text-gray-500 text-xs mt-1 text-right">
                    {format(new Date(message.Timestamp), "hh:mm a")}
                    {isAdmin && (
                    <button
                      onClick={() => deleteMessage(message._id)}
                      className="text-red-500 text-xs ml-2 hover:underline"
                    >
                      <Trash className="w-4 h-4"/>
                    </button>
                  )}
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <MessageBar addMessage={addMessage} />
    </div>

  );
};

export default MessageContainer;
