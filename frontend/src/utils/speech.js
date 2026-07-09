import toast from 'react-hot-toast';
export const speakText = (text) => {
  if (!window.speechSynthesis) {
    toast.error("Audio support is not available in this browser.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "hi-IN";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};