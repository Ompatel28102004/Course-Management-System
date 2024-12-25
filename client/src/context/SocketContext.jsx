import { HOST } from "../utils/constants";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null); // Use state to hold the socket
  const UserId = localStorage.getItem("userId");

  useEffect(() => {
    if (UserId) {
      const newSocket = io(HOST, {
        withCredentials: true,
        query: { userId: UserId },
      });

      newSocket.on("connect", () => {
        console.log("Connected to socket server");
      });

    //   const handleRecieveChannelMessage = (message) => {
    //     console.log("Message received from server:", message);
    // };

      // newSocket.on("receive-channel-message", handleRecieveChannelMessage);
    
      setSocket(newSocket); // Update the state with the new socket instance

      return () => {
        newSocket.disconnect();
      };
    }
  }, [UserId]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
