import React, { useState, useRef, useEffect } from 'react';
import Button from '../components/Button.jsx';

const InFact = ({ onBack }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Fact Check with InFact", sender: "bot" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const hasText = inputValue.trim() !== "";
    const hasImage = selectedImage !== null;
    
    // Don't send if there's nothing to send
    if (!hasText && !hasImage) return;

    // Don't allow sending while already analyzing
    if (isAnalyzing) return;

    // Create message content
    let messageContent = hasText ? inputValue : "Image uploaded for analysis";
    
    // Add image to message if one is selected
    const newUserMessage = {
      id: messages.length + 1,
      text: messageContent,
      sender: "user",
      image: hasImage ? previewUrl : null
    };

    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputValue("");
    
    // Clear image preview after sending
    if (hasImage) {
      setSelectedImage(null);
      setPreviewUrl(null);
    }

    // Send to backend for analysis
    setIsAnalyzing(true);
    
    try {
      // Create form data for backend
      const formData = new FormData();
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      if (hasText) {
        formData.append('text', inputValue.trim());
      }
      
      // Replace with your API endpoint
      const response = await fetch('http://your-flask-api-endpoint/analyze', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      // Create bot response with the API response
      const botResponse = {
        id: messages.length + 2,
        sender: "bot",
        falsehood: data.falsehood,
        sources: data.sources,
        reasoning: data.reasoning,
        storyboard: data.storyboard
      };
      
      setMessages(prevMessages => [...prevMessages, botResponse]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message to chat
      const errorResponse = {
        id: messages.length + 2,
        text: "Sorry, there was an error analyzing your content. Please try again.",
        sender: "bot"
      };
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setSelectedImage(file);
    
    // Create preview URL
    const imageUrl = URL.createObjectURL(file);
    setPreviewUrl(imageUrl);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <section className="c-space my-10">
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
              {message.sender === 'bot' && message.storyboard ? (
                // Enhanced bot response layout with structured analysis fields
                <div className="flex w-full space-x-4">
                  {/* Left side: Analysis content */}
                  <div className="flex-1 bg-gray-700 text-gray-100 rounded-lg rounded-bl-none px-4 py-3">
                    {/* Falsehood score */}
                    <div className="mb-3">
                      <div className="text-sm font-semibold mb-1">Falsehood Score</div>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-600 rounded-full h-2.5">
                          <div 
                            className="bg-red-500 h-2.5 rounded-full" 
                            style={{ width: `${message.falsehood}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm">{message.falsehood}%</span>
                      </div>
                    </div>
                    
                    {/* Sources */}
                    <div className="mb-3">
                      <div className="text-sm font-semibold mb-1">Sources</div>
                      <a 
                        href={message.sources} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline text-sm break-all"
                      >
                        {message.sources}
                      </a>
                    </div>
                    
                    {/* Reasoning */}
                    <div className="mb-2">
                      <div className="text-sm font-semibold mb-1">Reasoning</div>
                      <p className="text-sm">{message.reasoning}</p>
                    </div>
                  </div>
                  
                  {/* Right side: Storyboard image */}
                  <div className="w-32 sm:w-48">
                    <div className="text-sm font-semibold mb-1 text-center">Storyboard</div>
                    <img 
                      src={message.storyboard} 
                      alt="Analysis storyboard" 
                      className="w-full h-auto rounded-md object-cover" 
                    />
                  </div>
                </div>
              ) : (
                // Standard message display (user messages or simple bot messages)
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
                      <img 
                        src={message.image} 
                        alt="Uploaded content" 
                        className="max-w-full rounded-md" 
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {isAnalyzing && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-700 text-gray-100 rounded-lg rounded-bl-none px-4 py-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-1 animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-1 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Image Preview */}
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

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-700 p-4 bg-gray-800 rounded-lg">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
              disabled={isAnalyzing}
            />
            
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
              disabled={isAnalyzing}
            />
            
            {/* Image upload button */}
            <button
              type="button"
              onClick={triggerFileInput}
              className={`bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Upload image"
              disabled={isAnalyzing}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            
            <Button 
              name="Send"
              isBeam
              containerClass="px-4 py-2"
              onClick={handleSendMessage}
              disabled={isAnalyzing || (inputValue.trim() === "" && !selectedImage)}
            />
          </div>
        </form>
      </div>
    </section>
  );
};

export default InFact;