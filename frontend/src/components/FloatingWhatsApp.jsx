import React from 'react';
import { MessageCircle } from 'lucide-react';

const FloatingWhatsApp = () => {
  return (
    <a
      href="https://wa.me/918503996575?text=Hi,%20I%20need%20help%20with%20KaamMitra."
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 z-50 flex items-center justify-center animate-bounce"
      aria-label="WhatsApp Support"
    >
      <MessageCircle size={32} />
    </a>
  );
};

export default FloatingWhatsApp;
