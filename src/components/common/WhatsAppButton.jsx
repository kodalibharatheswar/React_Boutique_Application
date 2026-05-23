import React from 'react';

const WhatsAppButton = () => {
  return (
    <a 
      className="whatsapp-float" 
      href="https://wa.me/919490334557" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
    >
      <i className="fab fa-whatsapp"></i>
    </a>
  );
};

export default WhatsAppButton;