import React, { useState, useRef, useEffect } from "react";
import { Smile, Paperclip, Send, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { apiClient } from "@/lib/api-client";
import { useSocket } from "../../context/SocketContext";
import { HOST } from "@/utils/constants";
const MessageBar = ({ addMessage }) => {
  const [newMessage, setNewMessage] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const socket = useSocket();

  const emojiRef = useRef();
  const fileInputRef = useRef();
  const userId = Number(localStorage.getItem("userId")); // Convert to number for comparison
  const communityId = "12345";

  const handleAddEmoji = (emoji) => {
    setNewMessage((msg) => msg + emoji.emoji);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      addMessage(newMessage);
      setNewMessage("");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setEmojiOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const checkIfImage = (filePath) => {
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  }
  // const handleAttachmentChange = async (event) => {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   try {
  //     const formData = new FormData();
  //     formData.append("file", file);

  //     setIsUploading(true);
  //     setFileUploadProgress(0);

  //     const response = await apiClient.post(`{HOST}/api/file/upload-file`, formData, {
  //       withCredentials: true,
  //       onUploadProgress: (data) => {
  //         const progress = Math.floor((data.loaded * 100) / data.total);
  //         setFileUploadProgress(progress); // Update upload progress
  //       },
  //     });

  //     if (response.status === 201 && response.data) {
  //       setIsUploading(false);
  //       setFileUploadProgress(0);
  //       // Emit socket event with file details
  //       socket.emit("send-channel-message", {
  //         userId: userId,
  //         content: file.name,
  //         messageType: "file",
  //         fileUrl: response.data.data.file_url,
  //         communityId: communityId,
  //       });
  //     } else {
  //       throw new Error("Failed to upload file.");
  //     }
  //   } catch (error) {
  //     setIsUploading(false);
  //     console.error("Error uploading file:", error.message);
  //     alert("There was an error uploading the file. Please try again.");
  //   } finally {
  //     event.target.value = ""; // Reset file input to allow re-upload
  //   }
  // };
  const handleAttachmentChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      const formData = new FormData();
      formData.append("file", file);
  
      setIsUploading(true);
      setFileUploadProgress(0);
  
      // Determine the upload URL
      const uploadUrl = checkIfImage(file.name)
        ? `${HOST}/api/file/upload-image`
        : `${HOST}/api/file/upload-file`;
  
      const response = await apiClient.post(uploadUrl, formData, {
        withCredentials: true,
        onUploadProgress: (data) => {
          const progress = Math.floor((data.loaded * 100) / data.total);
          setFileUploadProgress(progress); // Update upload progress
        },
      });
  
      if (response.status === 201 && response.data) {
        setIsUploading(false);
        setFileUploadProgress(0);
  
        // Emit socket event with file details
        socket.emit("send-channel-message", {
          userId: userId,
          content: file.name,
          messageType: checkIfImage(file.name) ? "image" : "file",
          fileUrl: response.data.data.file_url,
          communityId: communityId,
        });
      } else {
        throw new Error("Failed to upload file.");
      }
    } catch (error) {
      setIsUploading(false);
      console.error("Error uploading file:", error.message);
      alert("There was an error uploading the file. Please try again.");
    } finally {
      event.target.value = ""; // Reset file input to allow re-upload
    }
  };
  
  if (isUploading) {
    // Show progress bar in place of the MessageBar
    return (
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-center">
          <div className="w-full bg-gray-200 rounded-full">
            <div
              className="bg-purple-600 text-xs font-medium text-white text-center p-0.5 leading-none rounded-full"
              style={{ width: `${fileUploadProgress}%` }}
            >
              {fileUploadProgress}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
      <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1.5">
        {/* Emoji Picker Button */}
        <button
          type="button"
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors border border-transparent hover:border-gray-200"
          onClick={() => setEmojiOpen((prev) => !prev)}
        >
          {emojiOpen ? <X className="w-5 h-5 text-gray-500" /> : <Smile className="w-5 h-5 text-gray-500" />}
        </button>

        {/* Emoji Picker */}
        {emojiOpen && (
          <div className="absolute right-16 bottom-6 z-10" ref={emojiRef}>
            <EmojiPicker theme="light" onEmojiClick={handleAddEmoji} autoFocusSearch={false} />
          </div>
        )}

        {/* File Attachment Button */}
        <button
          type="button"
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors border border-transparent hover:border-gray-200"
          onClick={handleAttachmentClick}
        >
          <Paperclip className="w-5 h-5 text-gray-500" />
        </button>
        <input type="file" className="hidden" ref={fileInputRef} onChange={handleAttachmentChange} />

        {/* Message Input */}
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-3 py-1 focus:outline-none border-l border-r border-gray-200 mx-1 text-sm"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors border border-transparent hover:border-gray-200 disabled:opacity-50"
        >
          <Send className="w-5 h-5 text-purple-600" />
        </button>
      </div>
    </form>
  );
};

export default MessageBar;
