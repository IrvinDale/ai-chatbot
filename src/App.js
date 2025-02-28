import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [text, setText] = useState(""); // For storing the recognized text
  const [response, setResponse] = useState(""); // For storing the chatbot's response
  const [isListening, setIsListening] = useState(false); // To track if speech is being recognized

  const HF_API_KEY = "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";

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = false;
  recognition.lang = "en-US";
  recognition.interimResults = false;

  const startListening = () => {
    recognition.start();
    setIsListening(true);

    recognition.onresult = async (event) => {
      const speechText = event.results[0][0].transcript;
      setText(speechText); // Update text with recognized speech

      const chatResponse = await getChatbotResponse(speechText); // Get response from chatbot
      setResponse(chatResponse); // Display chatbot response
      speakText(chatResponse); // Speak the response aloud
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
    };
  };

  const stopListening = () => {
    recognition.stop();
    setIsListening(false);
  };

  const getChatbotResponse = async (userInput) => {
    try {
      const response = await axios.post(
        "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
        { inputs: userInput },
        {
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
          },
        }
      );
      return response.data[0].generated_text; // Return the chatbot's response
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      return "Sorry, I couldn't process your request.";
    }
  };

  const speakText = (text) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-US"; // Set language
    window.speechSynthesis.speak(msg); // Speak the text
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", textAlign: "center" }}>
      <h1>Audio-to-Audio Chatbot</h1>
      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>
      <div>
        <h2>User Input:</h2>
        <p>{text}</p>
      </div>
      <div>
        <h2>Chatbot Response:</h2>
        <p>{response}</p>
      </div>
    </div>
  );
};

export default App;
