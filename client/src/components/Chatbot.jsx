import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./ChatBot.scss";

function Chatbot() {
  const questions = [
    { key: "location", question: "📍 Where are you looking to buy a property?" },
    { key: "budget", question: "💰 What is your budget (in ₹)?" },
    { key: "bedrooms", question: "🛏️ How many bedrooms do you need?" },
  ];

  const [messages, setMessages] = useState([{ type: "bot", text: questions[0].question }]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const currentKey = questions[step].key;
    setMessages(prev => [...prev, { type: "user", text: input }]);
    const updatedForm = { ...formData, [currentKey]: input };
    setFormData(updatedForm);
    setInput("");

    if (step + 1 < questions.length) {
      setTimeout(() => {
        setMessages(prev => [...prev, { type: "bot", text: questions[step + 1].question }]);
      }, 500);
      setStep(step + 1);
    } else {
      setMessages(prev => [...prev, { type: "bot", text: "🔍 Searching for matching properties..." }]);
      setLoading(true);

      try {
        const res = await axios.post("http://localhost:5000/api/properties", updatedForm);
        const properties = res.data;

        if (properties.length === 0) {
          setMessages(prev => [...prev, { type: "bot", text: "❌ No matching properties found." }]);
        } else {
          properties.forEach((prop) => {
            setMessages(prev => [...prev, { type: "property", data: prop }]);
          });
        }
      } catch {
        setMessages(prev => [...prev, { type: "bot", text: "⚠️ Error fetching properties." }]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="whatsapp-chatbot">
      <div className="chat-header">Agent Mira Real Estate Chatbot</div>
      <div className="chat-window">
        {messages.map((msg, idx) =>
          msg.type === "property" ? (
            <div className="msg bot" key={idx}>
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
            <div className={`msg ${msg.type}`} key={idx}>
              <div className="bubble">{msg.text}</div>
            </div>
          )
        )}
        {loading && <div className="msg bot"><div className="bubble typing">Bot is typing...</div></div>}
        <div ref={chatRef} />
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
