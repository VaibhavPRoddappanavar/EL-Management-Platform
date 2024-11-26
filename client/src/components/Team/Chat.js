import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./chat.css";

const Chat = ({ teamId, userName }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.emit("joinTeam", teamId);

    newSocket.on("previousMessages", (previousMessages) => {
      setMessages(previousMessages);
    });

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
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === userName ? "sender" : ""}`}
          >
            <strong>{msg.sender}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div className="chat-input-area">
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
