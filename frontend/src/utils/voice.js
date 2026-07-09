// Voice Recognition Utility using Web Speech API
export const startVoiceRecognition = (onResult, onError, lang = 'hi-IN') => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    if (onError) onError("Voice search is not supported in your browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  try {
    recognition.start();
  } catch (error) {
    if (onError) onError("Failed to start voice recognition. Please check microphone permissions.");
  }
};

// Text to Speech Utility
export const speakText = (text, lang = 'hi-IN') => {
  if (!('speechSynthesis' in window)) {
    console.error("Text-to-speech not supported.");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // Slightly slower for better comprehension
  
  window.speechSynthesis.speak(utterance);
};
