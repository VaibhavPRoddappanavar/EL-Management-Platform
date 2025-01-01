import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./chat.css";

const Chat = ({ teamId, userName }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!teamId || !userName) {
      console.log("Missing required props:", { teamId, userName });
      return;
    }

    const newSocket = io("http://localhost:5000");
    console.log("Connecting to socket server...");
    setSocket(newSocket);

    // Join team chat room
    newSocket.emit("joinTeam", teamId);
    console.log("Joining team:", teamId);

    // Listen for previous messages
    newSocket.on("previousMessages", (previousMessages) => {
      console.log("Received previous messages:", previousMessages);
      if (Array.isArray(previousMessages)) {
        setMessages(previousMessages);
      }
    });

    // Listen for new messages
    newSocket.on("receiveMessage", (message) => {
      console.log("Received new message:", message);
      if (message && typeof message === 'object') {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => {
      if (newSocket) {
        console.log("Disconnecting socket...");
        newSocket.disconnect();
      }
    };
  }, [teamId, userName]);

  const handleSendMessage = () => {
    if (newMessage.trim() && socket && teamId && userName) {
      const messageData = {
        teamId,
        sender: userName,
        message: newMessage.trim()
      };
      console.log("Sending message:", messageData);
      socket.emit("sendMessage", messageData);
      setNewMessage("");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {Array.isArray(messages) && messages.map((msg, index) => (
          <div
            key={msg._id || msg.timestamp || index}
            className={`chat-message ${msg.sender === userName ? "sender" : ""}`}
          >
            <div className="message-content">
              <span className="sender-name">{msg.sender}</span>
              <span className="message-text">{msg.message}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
