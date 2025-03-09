import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Button from '../components/Button.jsx';

const InFact = ({ onBack }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const hasText = inputValue.trim() !== "";
    const hasImage = selectedImage !== null;

    if (!hasText && !hasImage) return;
    if (isAnalyzing) return;

    let messageContent = hasText ? inputValue : "Image uploaded for analysis";
    const newUserMessage = {
      id: messages.length + 1,
      text: messageContent,
      sender: "user",
      image: hasImage ? previewUrl : null,
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue("");
    if (hasImage) {
      setSelectedImage(null);
      setPreviewUrl(null);
    }
    setIsAnalyzing(true);

    try {
      const endpoint = hasImage ? "/api/check_image" : "/api/check_text";
      const url = `http://localhost:5001${endpoint}`;
      
      let response;
      if (hasImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);
        response = await axios.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await axios.post(url, { text: inputValue.trim() }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      const data = response.data;

      const botResponse = {
        id: messages.length + 2,
        sender: "bot",
        falsehood_percentage: data.falsehood_percentage,
        sources: data.sources,
        fact_checks: data.fact_checks,
        reasoning: data.reasoning,
        summary: data.summary,
        storyboard_image: data.storyboard_image,
        storyboard_description: data.storyboard_description,
        tips: data.tips,
      };

      setMessages((prevMessages) => [...prevMessages, botResponse]);
    } catch (error) {
      console.error("Error:", error);
      const errorResponse = {
        id: messages.length + 2,
        text: `Sorry, there was an error analyzing your content: ${
          error.response?.data?.error || error.message
        }`,
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validImageTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, GIF, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setSelectedImage(file);
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
    <div className="flex flex-col h-screen bg-black text-white w-full">
      {/* Messages Area - full width container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 w-full pt-24">
        {messages.map((message) => {
          return (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
            >
              {message.sender === "bot" && message.falsehood_percentage !== undefined ? (
                <div className="flex w-full space-x-4">
                  <div className="w-1/2 bg-gray-800 text-gray-100 rounded-lg rounded-bl-none px-4 py-3">
                    <div className="mb-3">
                      <div className="text-sm font-semibold mb-1">Falsehood Score</div>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-600 rounded-full h-2.5">
                          <div
                            className="bg-red-500 h-2.5 rounded-full"
                            style={{ width: `${message.falsehood_percentage}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm">{message.falsehood_percentage}%</span>
                      </div>
                    </div>

                    {message.sources && message.sources.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-semibold mb-1">Sources</div>
                        {message.sources.map((source, index) => (
                          <div key={index} className="text-sm">
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline break-all"
                            >
                              {source.title}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}

                    {message.fact_checks && message.fact_checks.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-semibold mb-1">Fact Checks</div>
                        {message.fact_checks.map((check, index) => (
                          <div key={index} className="text-sm">
                            <a
                              href={check.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline break-all"
                            >
                              {check.title || check.url}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mb-2">
                      <div className="text-sm font-semibold mb-1">Summary</div>
                      <p className="text-sm">{message.summary}</p>
                    </div>

                    <div className="mb-2">
                      <div className="text-sm font-semibold mb-1">Reasoning</div>
                      <p className="text-sm">{message.reasoning}</p>
                    </div>

                    {message.tips && message.tips.length > 0 && (
                      <div className="mb-2">
                        <div className="text-sm font-semibold mb-1">Tips</div>
                        <ul className="list-disc pl-4 text-sm">
                          {message.tips.map((tip, index) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="w-1/2 bg-gray-800 rounded-lg p-3">
                    <div className="text-sm font-semibold mb-2 text-center">Storyboard</div>
                    {message.storyboard_image ? (
                      <>
                        <img
                          src={message.storyboard_image}
                          alt={message.storyboard_description || "Analysis storyboard"}
                          className="w-full h-auto rounded-md object-cover"
                        />
                        {message.storyboard_description ? (
                          <div className="text-xs mt-2">
                            {(Array.isArray(message.storyboard_description) ? message.storyboard_description : message.storyboard_description.split('\n'))
                              .filter(line => line.trim() && line.trim() !== "### Generated Storyboard Prompt")
                              .map((line, index) => {
                                const parts = line.split(/(\*\*[^\*]+\*\*)/g);
                                return (
                                  <p key={index} className="mb-1">
                                    {parts.map((part, i) => {
                                      if (part.startsWith('**') && part.endsWith('**')) {
                                        return <strong key={i}>{part.slice(2, -2)}</strong>;
                                      }
                                      return part;
                                    })}
                                  </p>
                                );
                              })}
                          </div>
                        ) : (
                          <p className="text-xs mt-2">No description available</p>
                        )}
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        No storyboard available
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-gray-900 text-gray-100 rounded-bl-none"
                  }`}
                >
                  {message.text}
                  {message.image && (
                    <div className="mt-2">
                      <img src={message.image} alt="Uploaded content" className="max-w-full rounded-md" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        
        {isAnalyzing && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-700 text-gray-100 rounded-lg rounded-bl-none px-4 py-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-1 animate-pulse"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full mr-1 animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview Area */}
      {previewUrl && (
        <div className="px-4 pb-2">
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

      {/* Input Area - now full width */}
      <div className="sticky bottom-0 left-0 right-0 z-20 bg-black w-full">
        <form onSubmit={handleSendMessage} className="bg-black px-4 py-3 border-t border-gray-800 w-full">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
              disabled={isAnalyzing}
            />

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
              disabled={isAnalyzing}
            />

            <button
              type="button"
              onClick={triggerFileInput}
              className={`bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isAnalyzing ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Upload image"
              disabled={isAnalyzing}
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

            <div className="flex items-center">
              <button
                type="button"
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default InFact;