// src/sections/InFact.jsx
import React, { useState, useRef, useEffect } from 'react';
import Button from '../components/Button.jsx';
import Loading from '../components/Loading.jsx';

const InFact = ({ onBack }) => {
  const [messages, setMessages] = useState([{ id: 1, text: 'Fact Check with InFact', sender: 'bot' }]);
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Renamed for consistency
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const hasText = inputValue.trim() !== '';
    const hasImage = selectedImage !== null;
    if (!hasText && !hasImage) return;

    const newUserMessage = {
      id: messages.length + 1,
      text: hasText ? inputValue : '',
      sender: 'user',
      image: hasImage ? previewUrl : null,
    };

    setMessages([...messages, newUserMessage]);
    setInputValue('');
    if (hasImage) {
      setSelectedImage(null);
      setPreviewUrl(null);
    }

    setIsAnalyzing(true);
  };

  const handleAnalysisComplete = () => {
    let responseText = 'This is an AI-powered media analysis assistant. ';
    responseText += selectedImage
      ? 'Analysing text from image?'
      : 'Please provide details about your content or upload an image to analyze.';
    const botResponse = {
      id: messages.length + 2,
      text: responseText,
      sender: 'bot',
    };
    setMessages((prevMessages) => [...prevMessages, botResponse]);
    setIsAnalyzing(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setSelectedImage(file);
    const imageUrl = URL.createObjectURL(file);
    setPreviewUrl(imageUrl);
  };

  const triggerFileInput = () => fileInputRef.current.click();

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <section className="c-space my-10">
      {isAnalyzing && <Loading onLoadingComplete={handleAnalysisComplete} />}
      <div className="grid-container max-w-4xl mx-auto">
        <h1 className="grid-headtext text-center mb-6">InFact - AI Chat Assistant</h1>
        <p className="grid-subtext text-center mb-8">
          Chat with our AI-powered assistant for insights on media analysis.
        </p>

        <div className="border-2 border-gray-300 rounded-lg p-6 mb-6 bg-gray-900 text-white overflow-y-auto max-h-96">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-gray-700 text-gray-100 rounded-bl-none'
                }`}
              >
                {message.text}
                {message.image && (
                  <div className="mt-2">
                    <img src={message.image} alt="Uploaded content" className="max-w-full rounded-md" />
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {previewUrl && (
          <div className="mb-4 relative">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Selected image"
                className="max-h-32 rounded-lg border border-gray-600"
              />
              <button
                onClick={removeSelectedImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="border-t border-gray-700 p-4 bg-gray-800 rounded-lg">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={triggerFileInput}
              className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Upload image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
            <Button
              name="Send"
              isBeam={!isAnalyzing}
              containerClass="px-4 py-2"
              onClick={handleSendMessage}
              disabled={isAnalyzing || (inputValue.trim() === '' && !selectedImage)}
            />
          </div>
        </form>
      </div>
    </section>
  );
};

export default InFact;