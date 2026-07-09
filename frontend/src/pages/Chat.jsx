import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft } from 'lucide-react';
import { workers } from '../data/workers';

const Chat = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const worker = workers.find(w => w.id === workerId);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Load existing messages or set default
    const saved = JSON.parse(localStorage.getItem(`kaammitra_chat_${workerId}`) || '[]');
    if (saved.length === 0 && worker) {
      const initial = [{ id: 1, text: `Hello! I am ${worker.name}. How can I help you today?`, sender: 'worker', time: new Date().toLocaleTimeString() }];
      setMessages(initial);
      localStorage.setItem(`kaammitra_chat_${workerId}`, JSON.stringify(initial));
    } else {
      setMessages(saved);
    }
  }, [workerId, worker]);

  const handleSend = (text) => {
    if(!text.trim()) return;
    
    const newMsg = {
      id: Date.now(),
      text: text,
      sender: 'customer',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    setInput('');
    localStorage.setItem(`kaammitra_chat_${workerId}`, JSON.stringify(updated));

    // Simulate auto-reply
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        text: "Ji, main available hu. Address bhej dijiye.",
        sender: 'worker',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      const afterReply = [...updated, reply];
      setMessages(afterReply);
      localStorage.setItem(`kaammitra_chat_${workerId}`, JSON.stringify(afterReply));
    }, 1500);
  };

  if(!worker) return <div>Worker not found</div>;

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-130px)] flex flex-col bg-card-white border-x border-border-gray">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="hover:bg-primary-hover p-2 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <img src={worker.photo} alt={worker.name} className="w-10 h-10 rounded-full border-2 border-white" />
        <div>
          <h2 className="font-bold">{worker.name}</h2>
          <p className="text-xs text-blue-100">{worker.service}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-bg-warm flex flex-col gap-4">
        {messages.map(msg => (
          <div key={msg.id} className={`max-w-[80%] rounded-2xl p-3 ${msg.sender === 'customer' ? 'bg-primary text-white self-end rounded-br-none' : 'bg-card-white border border-border-gray text-navy self-start rounded-bl-none'}`}>
            <p>{msg.text}</p>
            <span className={`text-[10px] block mt-1 ${msg.sender === 'customer' ? 'text-blue-200' : 'text-border-gray'}`}>{msg.time}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="p-3 bg-card-white border-t border-border-gray flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button onClick={() => handleSend("Aap available ho?")} className="bg-bg-soft-blue hover:bg-border-gray text-text-gray text-sm px-4 py-2 rounded-full">Aap available ho?</button>
        <button onClick={() => handleSend("Kitna charge lagega?")} className="bg-bg-soft-blue hover:bg-border-gray text-text-gray text-sm px-4 py-2 rounded-full">Kitna charge lagega?</button>
        <button onClick={() => handleSend("Kab aa sakte ho?")} className="bg-bg-soft-blue hover:bg-border-gray text-text-gray text-sm px-4 py-2 rounded-full">Kab aa sakte ho?</button>
      </div>

      {/* Input */}
      <div className="p-4 bg-card-white border-t border-border-gray flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder="Type a message..." 
          className="flex-1 bg-bg-soft-blue border-transparent focus:bg-card-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-full px-4 py-2 outline-none transition-all"
        />
        <button onClick={() => handleSend(input)} className="bg-primary hover:bg-primary-hover text-white p-3 rounded-full shadow-md transition-colors">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default Chat;
