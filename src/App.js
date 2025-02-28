import React, { useState } from "react";
import axios from "axios";

const HF_API_KEY = "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";  // Replace with your API key

const App = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { sender: "User", text: userInput }];
    setMessages(newMessages);
    setUserInput("");

    try {
      const response = await axios.post(
        "https://api-inference.huggingface.co/models/gpt2",
        { inputs: userInput },
        {
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );      

      const botMessage = response.data[0].generated_text;
      setMessages([...newMessages, { sender: "AI", text: botMessage }]);

    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", textAlign: "center" }}>
      <h1>AI Chatbot</h1>
      <div style={{ height: "300px", overflowY: "scroll", border: "1px solid gray", padding: "10px" }}>
        {messages.map((msg, index) => (
          <p key={index} style={{ textAlign: msg.sender === "User" ? "right" : "left" }}>
            <strong>{msg.sender}:</strong> {msg.text}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Ask something..."
        style={{ width: "80%", padding: "10px", marginTop: "10px" }}
      />
      <button onClick={sendMessage} style={{ padding: "10px", marginLeft: "5px" }}>Send</button>
    </div>
  );
};

export default App;
