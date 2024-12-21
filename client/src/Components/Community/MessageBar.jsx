import React, { useState, useRef, useEffect } from "react";
import { Smile, Paperclip, Send, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

const MessageBar = ({ addMessage }) => {
  const [newMessage, setNewMessage] = useState("");
  const emojiRef = useRef();
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileInputRef = useRef();

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
    function handleClickOutside(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setEmojiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [emojiRef]);
  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAttachmentChange = async (event) => {
    try {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        setIsUploading(true);
        const response = await apiClient.post(UPLOAD_FILE_ROUTE, formData, {
          withCredentials: true,
          onUploadProgress: (data) => {
            const progress = Math.floor((data.loaded * 100) / data.total);
            setFileUploadProgress(progress);
          },
        });

        if (response.status === 200 && response.data) {
          setIsUploading(false);
          if (selectedChatType === "contact") {
            socket.emit("sendMessage", {
              sender: userInfo.id,
              content: undefined,
              recipient: selectedChatData._id,
              messageType: "file",
              fileUrl: response.data.filePath,
            });
          } else if (selectedChatType === "channel") {
            socket.emit("send-channel-message", {
              sender: userInfo.id,
              content: undefined,
              messageType: "file",
              fileUrl: response.data.filePath,
              channelId: selectedChatData._id,
            });
          }
        }
      }
    } catch (error) {
      setIsUploading(false);
      console.log({ error });
    }
  };
  return (
    <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
      <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1.5">

        <button
          type="button"
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors border border-transparent hover:border-gray-200"
          onClick={() => setEmojiOpen((prev) => !prev)}
        >
          {emojiOpen ? (
            <X className="w-5 h-5 text-gray-500" /> // Close button
          ) : (
            <Smile className="w-5 h-5 text-gray-500" /> // Smile button
          )}
        </button>
        <div className="absolute top-12" ref={emojiRef}>
          <EmojiPicker theme="light" open={emojiOpen} onEmojiClick={handleAddEmoji} autoFocusSearch={false} />
        </div>
        <button
          type="button"
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors border border-transparent hover:border-gray-200"
          onClick={handleAttachmentClick}
        >
          <Paperclip className="w-5 h-5 text-gray-500" />
        </button>
        <input type="file" className="hidden" ref={fileInputRef} onChange={handleAttachmentChange} />
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-3 py-1 focus:outline-none border-l border-r border-gray-200 mx-1 text-sm"
        />
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
