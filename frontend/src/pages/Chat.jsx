import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Chat = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [worker, setWorker] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const customerId = user?.role === 'customer' ? user?._id : workerId; // If worker is logged in, workerId param is actually the customerId they are chatting with
  const actualWorkerId = user?.role === 'worker' ? user?._id : workerId;
  const conversationId = `${customerId}_${actualWorkerId}`;
  
  const isWorkerOnline = onlineUsers.has(user?.role === 'customer' ? actualWorkerId : customerId);

  useEffect(() => {
    // Fetch worker or customer profile for header
    const fetchProfile = async () => {
      try {
        if (user?.role === 'customer') {
          const res = await api.get(`/workers/${actualWorkerId}`);
          setWorker(res.data.data);
        } else {
          // Worker fetching customer profile logic can be added here if there's an API for it
          setWorker({ name: 'Customer', service: 'Booking' }); 
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [actualWorkerId, user]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await api.get(`/chats/${conversationId}`);
        if (res.data.data.messages) {
          setMessages(res.data.data.messages);
        }
      } catch (err) {
        console.error('Error fetching chat history', err);
      }
    };
    if (user) {
      fetchChatHistory();
    }
  }, [conversationId, user]);

  useEffect(() => {
    if (socket) {
      socket.emit('join_chat', { conversationId });

      socket.on('receive_message', ({ conversationId: id, message }) => {
        if (id === conversationId) {
          setMessages(prev => [...prev, message]);
        }
      });

      socket.on('typing', ({ conversationId: id, userId }) => {
        if (id === conversationId && userId !== user._id) {
          setIsTyping(true);
        }
      });

      socket.on('stop_typing', ({ conversationId: id, userId }) => {
        if (id === conversationId && userId !== user._id) {
          setIsTyping(false);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('receive_message');
        socket.off('typing');
        socket.off('stop_typing');
      }
    };
  }, [socket, conversationId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  let typingTimeout = null;
  const handleTyping = (e) => {
    setInput(e.target.value);
    if (socket) {
      socket.emit('typing', { conversationId });
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.emit('stop_typing', { conversationId });
      }, 1000);
    }
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;
    
    if (socket) {
      socket.emit('send_message', { conversationId, text });
    } else {
      // Fallback
      try {
        const res = await api.post(`/chats/${conversationId}/messages`, { text });
        setMessages(prev => [...prev, res.data.data]);
      } catch (err) {
        toast.error('Failed to send message');
      }
    }
    
    setInput('');
    if (socket) {
      socket.emit('stop_typing', { conversationId });
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-130px)] flex flex-col bg-card-white border-x border-border-gray">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="hover:bg-primary-hover p-2 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        {worker?.profilePhotoUrl || worker?.photo ? (
          <img src={worker.profilePhotoUrl || worker.photo} alt={worker.name} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-300 flex items-center justify-center text-white font-bold">
            {worker?.name?.charAt(0)}
          </div>
        )}
        <div>
          <h2 className="font-bold flex items-center gap-2">
            {worker?.name} 
            {isWorkerOnline && <span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block"></span>}
          </h2>
          <p className="text-xs text-blue-100">{isWorkerOnline ? 'Online' : 'Offline'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-bg-warm flex flex-col gap-4">
        {messages.map(msg => {
          const isMe = msg.senderId === user?._id;
          return (
            <div key={msg._id || msg.id || Math.random()} className={`max-w-[80%] rounded-2xl p-3 ${isMe ? 'bg-primary text-white self-end rounded-br-none' : 'bg-card-white border border-border-gray text-navy self-start rounded-bl-none'}`}>
              <p>{msg.text}</p>
              <span className={`text-[10px] block mt-1 flex justify-between gap-4 ${isMe ? 'text-blue-200' : 'text-border-gray'}`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {isMe && msg.read && <span>Read</span>}
              </span>
            </div>
          );
        })}
        {isTyping && (
          <div className="bg-card-white border border-border-gray text-navy self-start rounded-2xl rounded-bl-none p-3 max-w-[80%]">
            <p className="text-sm italic text-gray-500">Typing...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
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
          onChange={handleTyping}
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
