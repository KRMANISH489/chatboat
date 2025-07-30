import React, { useState } from "react";
import axios from "axios";
import "./ChatBot.scss";

function Chatbot() {
  const questions = [
    { key: "location", question: "📍 Where are you looking to buy a property?" },
    { key: "budget", question: "💰 What is your budget (in ₹)?" },
    { key: "bedrooms", question: "🛏️ How many bedrooms do you need?" },
  ];

  const [messages, setMessages] = useState([
    { type: "bot", text: questions[0].question },
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const currentKey = questions[step].key;

    if (!input.trim()) return;

    // 1. Save user input as answer
    setMessages((prev) => [
      ...prev,
      { type: "user", text: input },
    ]);
    const updatedForm = { ...formData, [currentKey]: input };
    setFormData(updatedForm);
    setInput("");

    // 2. If more questions, ask next one
    if (step + 1 < questions.length) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: questions[step + 1].question },
        ]);
      }, 400);
      setStep(step + 1);
    } else {
      // 3. All inputs done: search properties
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "🔍 Searching for matching properties..." },
      ]);
      setLoading(true);

      try {
        const res = await axios.post("http://localhost:5000/api/properties", updatedForm);
        const properties = res.data;

        if (properties.length === 0) {
          setMessages((prev) => [
            ...prev,
            { type: "bot", text: "Sorry, no properties matched your criteria." },
          ]);
        } else {
          properties.forEach((prop) => {
            setMessages((prev) => [
              ...prev,
              {
                type: "property",
                data: prop,
              },
            ]);
          });
        }
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: "Something went wrong while fetching properties." },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="chatbot-container">
      <h2> ❤️ Agent Mira: Real Estate Chatbot ❤️</h2>
      <div className="chat-window">
        {messages.map((msg, idx) =>
          msg.type === "property" ? (
            <div className="chat-message bot" key={idx}>
              <div className="property-card">
                <img src={msg.data.image_url} alt={msg.data.title} />
                <h4>{msg.data.title}</h4>
                <p>₹{msg.data.price} - {msg.data.location}</p>
                <p><strong>Bedrooms:</strong> {msg.data.bedrooms}</p>
                <p><strong>Bathrooms:</strong> {msg.data.bathrooms}</p>
                <p><strong>Amenities:</strong> {msg.data.amenities?.join(", ")}</p>
              </div>
            </div>
          ) : (
            <div className={`chat-message ${msg.type}`} key={idx}>
              {msg.text}
            </div>
          )
        )}
        {loading && <div className="chat-message bot typing">Bot is typing...</div>}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your answer..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button onClick={handleSubmit} disabled={loading}>Send</button>
      </div>
    </div>
  );
}

export default Chatbot;
