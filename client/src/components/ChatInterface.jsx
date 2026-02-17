import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { chatWithAI } from '../services/puterAI';

export default function ChatInterface({ sessionId, onDataCollected, floorPlanData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [floorPlanSent, setFloorPlanSent] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const welcomeMsg = floorPlanData
      ? `Welcome to Decorpot! I can see you've uploaded your floor plan — I've identified a ${floorPlanData.propertyType} with approximately ${floorPlanData.estimatedCarpetArea} sqft and ${(floorPlanData.roomsIdentified || []).length} rooms. Let me confirm a few details to prepare your personalized quotation. Which city is this property located in?`
      : "Welcome to Decorpot! I'm your personal design consultant. We've designed over 2,000+ beautiful homes in Bangalore with premium materials and a 10-year warranty. Let's plan your dream home — what type of property are you looking to design? (1BHK, 2BHK, 3BHK, Villa, etc.)";

    setMessages([{ role: 'assistant', content: welcomeMsg }]);
  }, [floorPlanData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);

    try {
      const fpData = !floorPlanSent ? floorPlanData : null;
      if (floorPlanData && !floorPlanSent) setFloorPlanSent(true);

      const response = await chatWithAI(text, sessionId, fpData);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.message },
      ]);

      if (response.isComplete && response.extractedData) {
        onDataCollected(response.extractedData);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I encountered an issue. Could you please try again?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerDot} />
        <span style={styles.headerTitle}>Decorpot Design Consultant</span>
        <span style={styles.headerStatus}>Online</span>
      </div>

      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.messageRow,
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'fadeIn 0.3s ease-out',
            }}
          >
            {msg.role === 'assistant' && (
              <div style={styles.avatar}>
                <Bot size={18} color="#fff" />
              </div>
            )}
            <div
              style={{
                ...styles.bubble,
                ...(msg.role === 'user' ? styles.userBubble : styles.aiBubble),
              }}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div style={styles.userAvatar}>
                <User size={18} color="#fff" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
            <div style={styles.avatar}>
              <Bot size={18} color="#fff" />
            </div>
            <div style={{ ...styles.bubble, ...styles.aiBubble, ...styles.typingBubble }}>
              <span style={styles.typingDot}>.</span>
              <span style={{ ...styles.typingDot, animationDelay: '0.2s' }}>.</span>
              <span style={{ ...styles.typingDot, animationDelay: '0.4s' }}>.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputArea}>
        <input
          ref={inputRef}
          type="text"
          style={styles.input}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button
          style={{
            ...styles.sendBtn,
            opacity: !input.trim() || isLoading ? 0.5 : 1,
          }}
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? <Loader2 size={20} /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '600px',
    maxHeight: '70vh',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 20px',
    background: '#c53030',
    color: '#fff',
  },
  headerDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#68d391',
  },
  headerTitle: { fontWeight: 600, fontSize: '15px', flex: 1 },
  headerStatus: { fontSize: '12px', color: '#fed7d7' },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    background: '#f7fafc',
  },
  messageRow: { display: 'flex', alignItems: 'flex-end', gap: '10px' },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: '#c53030',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: '#1a365d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: '16px',
    fontSize: '14px',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
  },
  aiBubble: {
    background: '#fff',
    color: '#1a202c',
    borderBottomLeftRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  userBubble: {
    background: '#1a365d',
    color: '#fff',
    borderBottomRightRadius: '4px',
  },
  typingBubble: {
    display: 'flex',
    gap: '2px',
    padding: '14px 20px',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  typingDot: { animation: 'typing 1s infinite', color: '#a0aec0' },
  inputArea: {
    display: 'flex',
    gap: '10px',
    padding: '14px 20px',
    borderTop: '1px solid #e2e8f0',
    background: '#fff',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    background: '#f7fafc',
  },
  sendBtn: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    border: 'none',
    background: '#c53030',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
};
