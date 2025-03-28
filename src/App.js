import React, { useState } from "react";
import axios from "axios";
import './App.css';


import logo from './logo.svg';

const App = () => {
  const [text, setText] = useState(""); // For storing the recognized text
  const [response, setResponse] = useState(""); // For storing the chatbot's response
  const [isListening, setIsListening] = useState(false); // To track if speech is being recognized
  const [errorMessage, setErrorMessage] = useState(""); // new state for error message

  const apiKey = process.env.REACT_APP_HF_API_KEY; // Get Hugging Face API key from environment variables

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
      setErrorMessage(`Error: ${event.error}`); // Display the error message in the UI
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
            Authorization: `Bearer ${apiKey}`,
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
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel(); // Stop previous speech before speaking new text
    }
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-US"; // Set language
    window.speechSynthesis.speak(msg); // Speak the text
    setIsListening(false); // Stop listening after speaking
  };

  return (
    <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <div className="App-content">
      <h1 className="m-3">React App Audio Chatbot using DiabloGPT</h1>
    <button 
      onClick={isListening ? stopListening : startListening} 
      className={`btn ${isListening ? "btn-danger" : "btn-success"} m-3`}
    >
    <i className={`bi ${isListening ? "bi-mic-mute-fill" : "bi-mic-fill"}`}></i>
      {isListening ? " Stop Listening" : " Start Listening"}
    </button>
      {isListening && <p>Listening...</p>}
      <div className="m-3">
        <h2 className="m-3">User Input:</h2>
        <p>{text}</p>
      </div>
      <div>
        <h2 className="m-3">Chatbot Response:</h2>
        <p>{response}</p>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </div>
    </div>
    </header>

    <footer className="App-footer">
      <small>
        &copy; 2025 Irvin Dale. All rights reserved.
      </small>
      <p>
        <span>About this website:</span> built with&nbsp; 
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
         React
      </a>,&nbsp; 
      <a
          className="App-link"
          href="https://huggingface.co/"
          target="_blank"
          rel="noopener noreferrer"
        >
         Hugging face API
      </a>&nbsp;
      <a
          className="App-link"
          href="https://huggingface.co/microsoft/DialoGPT-medium"
          target="_blank"
          rel="noopener noreferrer"
        >
         (DiabloGPT)
      </a>
      ,&nbsp;
      <a
          className="App-link"
          href="https://vercel.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
         Vercel
      </a>,&nbsp;
      <a
          className="App-link"
          href="https://github.com/IrvinDale/ai-chatbot"
          target="_blank"
          rel="noopener noreferrer"
        >
         GitHub source code
      </a>

      </p>
 
    </footer>
    </div>
  );
};

export default App;
