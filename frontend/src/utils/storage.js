// This file is deprecated. 
// All data is now managed directly through standard API endpoints (MongoDB).
// Remaining utility functions that don't belong to API can be placed here if needed.

export const clearLocalSessionData = () => {
  localStorage.removeItem('kaammitra_user');
  localStorage.removeItem('kaammitra_bookings');
  localStorage.removeItem('kaammitra_complaints');
  localStorage.removeItem('kaammitra_chats');
  localStorage.removeItem('kaammitra_leads');
  localStorage.removeItem('kaammitra_emergency_leads');
  localStorage.removeItem('kaammitra_callback_requests');
  localStorage.removeItem('simpleMode');
  localStorage.removeItem('language');
  // keep token
};
