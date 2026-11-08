import React, { useState, useRef, useEffect } from 'react';
import '../Componentcss/Chatbot.css';
import { getTabToken, isValidToken, sanitizeToken } from '../utils/tabSession';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hello! I am the Royal Park Hotel virtual concierge. How can I assist you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        const updatedMessages = [...messages, { sender: 'user', text: userMessage }];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            const rawToken = getTabToken() || localStorage.getItem('token');
            const token = isValidToken(rawToken) ? sanitizeToken(rawToken) : null;

            if (rawToken && !token) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
            }

            // Include last 8 conversational turns so the chatbot has full context and memory
            const historyPayload = messages
                .filter(m => m.text)
                .slice(-8)
                .map(m => ({
                    role: m.sender === 'user' ? 'user' : 'assistant',
                    content: m.text
                }));

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chatbot`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    message: userMessage,
                    history: historyPayload
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
            } else {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
                setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting to the server. ' + (data.error || '') }]);
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am offline right now.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to render markdown bolding (**bold**) and bullet lists nicely without raw asterisks
    const renderMessageContent = (text) => {
        if (!text) return null;

        const lines = text.split('\n');

        return lines.map((line, lineIdx) => {
            let cleanLine = line;
            let isBullet = false;

            // Detect list items like "* ", "- ", "1. "
            if (/^\s*[*•-]\s+/.test(cleanLine)) {
                isBullet = true;
                cleanLine = cleanLine.replace(/^\s*[*•-]\s+/, '');
            }

            // Clean any stray excessive asterisks like ****
            cleanLine = cleanLine.replace(/\*{3,}/g, '**');

            // Parse **bold text**
            const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);

            return (
                <div
                    key={lineIdx}
                    style={{
                        paddingLeft: isBullet ? '12px' : '0',
                        margin: cleanLine.trim() === '' ? '4px 0' : '2px 0',
                        display: 'block'
                    }}
                >
                    {isBullet && <span style={{ marginRight: '6px', color: '#D4AF37' }}>•</span>}
                    {parts.map((part, partIdx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </div>
            );
        });
    };

    return (
        <div className="chatbot-container">
            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-title">
                            <span className="chatbot-avatar">🛎️</span>
                            Hotel Concierge
                        </div>
                        <button className="chatbot-close" onClick={toggleChat}>
                            ✖
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat-message ${msg.sender}`}>
                                <div className="chat-bubble">
                                    {renderMessageContent(msg.text)}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-message bot">
                                <div className="chat-bubble loading-bubble">
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatbot-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me a question..."
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !input.trim()}>
                            ➤
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
                onClick={toggleChat}
                aria-label="Toggle Chat"
            >
                {isOpen ? '✖' : '💬'}
            </button>
        </div>
    );
};

export default Chatbot;
