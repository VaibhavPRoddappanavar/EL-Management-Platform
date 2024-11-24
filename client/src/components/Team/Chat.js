import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const Chat = ({ teamId, userName }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Connect to the Socket.IO server
    const newSocket = io("http://localhost:5000"); // Update with your backend URL if needed
    setSocket(newSocket);

    // Join the specific team room
    newSocket.emit("joinTeam", teamId);

    // Listen for previous messages
    newSocket.on("previousMessages", (previousMessages) => {
      setMessages(previousMessages);
    });

    // Listen for incoming messages
    newSocket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [teamId]);

  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      const messageData = {
        teamId,
        sender: userName,
        message: newMessage.trim(),
      };
      socket.emit("sendMessage", messageData);
      setNewMessage("");
    }
  };

  return (
    <div>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "scroll",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
