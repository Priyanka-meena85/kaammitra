import React from 'react';
import { FloatingWhatsApp } from 'react-floating-whatsapp';

const FloatingWhatsAppWrapper = () => {
  return (
    <FloatingWhatsApp
      phoneNumber="918503996575"
      accountName="KaamMitra Support"
      allowEsc
      allowClickAway
      notification
      notificationSound
      avatar="/logo.png"
      statusMessage="Typically replies within 1 hour"
      chatMessage="Namaste! Welcome to KaamMitra Support 🤝. How can we help you today?"
      placeholder="Type your message here..."
    />
  );
};

export default FloatingWhatsAppWrapper;
