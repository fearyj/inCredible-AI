import { useState, useRef, useCallback, useEffect } from 'react';
import Button from '../components/Button.jsx';
import axios from "axios";

const InDetect = ({ onBack }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const fileInputRef = useRef(null);
  const resultsSectionRef = useRef(null);

  useEffect(() => {
    console.log('Render triggered, file:', file ? file.name : null);
  }, [file]);

  useEffect(() => {
    if (result && resultsSectionRef.current && showResults) {
      setTimeout(() => {
        resultsSectionRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    }
  }, [result, showResults]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.match('image/') || droppedFile.type.match('video/')) {
        setFile(droppedFile);
      }
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleClearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const analyzeWithApi = async () => {
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      
      const response = await axios.post('http://127.0.0.1:5001/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 90000,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      });
      
      const apiResult = response.data;
      console.log('API Response:', apiResult);
      
      if (apiResult.error) {
        throw new Error(apiResult.error);
      }
      
      if (apiResult.deepfake_result === undefined) {
        throw new Error('Invalid API response format');
      }
      
      return apiResult;
    } catch (error) {
      console.error("API error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error.response?.data?.error || error.message || "Failed to analyze content";
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setShowResults(false);
    setShowSharePopup(false);

    try {
      const analysisResult = await analyzeWithApi();
      setResult(analysisResult);
      setShowResults(true);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setShowResults(false);
    setShowSharePopup(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = (platform) => {
    const text = `I just analyzed this content with inDetect! ${result.deepfake_result ? 'It appears to be AI-generated.' : 'It appears to be real content.'}`;
    const shareUrlBase = result.s3_url || window.location.href;
    
    let shareUrl = '';
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrlBase)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrlBase)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrlBase)}&text=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrlBase)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=550,height=450');
    }
    setTimeout(() => setShowSharePopup(false), 500);
  };

  const showInputSection = !isLoading && !showResults;

  return (
    <section className="c-space my-10 pt-20">
      <div className="grid-container max-w-4xl mx-auto">
        <h1 className="grid-headtext text-center mb-6">inDetect - Media Analysis Tool</h1>
        <p className="grid-subtext text-center mb-8">
          Analyze images and videos to detect AI-generated content
        </p>

        {isLoading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <p className="text-xl font-medium text-gray-700">Analyzing your content...</p>
            <p className="text-gray-500 mt-2">This may take a few moments</p>
          </div>
        )}

        {showInputSection && (
          <>
            <div
              className={`border-2 border-dashed rounded-lg p-6 mb-6 text-center transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              } ${file ? 'bg-green-50 border-green-500' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                className="hidden"
              />
              {file ? (
                <div className="space-y-4">
                  <span className="text-lg font-medium text-green-600">File selected:</span>
                  <div className="bg-white p-3 rounded-lg shadow-sm inline-block">
                    {file.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(file)} alt="Preview" className="max-h-48 mx-auto rounded" />
                    ) : (
                      <video src={URL.createObjectURL(file)} controls className="max-h-48 mx-auto rounded" />
                    )}
                  </div>
                  <p className="font-medium">{file.name}</p>
                  <button onClick={handleClearFile} className="text-red-500 underline hover:text-red-700">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-lg text-gray-700">Drag and drop your image or video here</p>
                  <p className="text-sm text-gray-500">Supports: JPG, PNG, GIF, MP4, MOV</p>
                  <button
                    onClick={handleBrowseClick}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Browse Files
                  </button>
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <Button
              name={isLoading ? 'Analyzing...' : 'Analyze Content'}
              isBeam={true}
              containerClass="w-full mb-8"
              onClick={handleAnalyze}
              disabled={isLoading || !file}
            />
          </>
        )}

        {showResults && result && (
          <div 
            ref={resultsSectionRef}
            className="bg-white p-8 rounded-lg shadow-lg transition-all animate-fadeIn"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">Analysis Results</h2>
            
            {result.type && result.name && (
              <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-1">Analyzed {result.type}:</p>
                <p className="font-medium truncate">{result.name}</p>
              </div>
            )}
            
            {result.s3_url && (
              <div className="mb-6 text-center">
                {result.name.toLowerCase().match(/\.(mp4|mov)$/i) ? (
                  <video 
                    src={result.s3_url} 
                    controls 
                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-md" 
                  />
                ) : (
                  <img 
                    src={result.s3_url} 
                    alt="Analyzed content" 
                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-md" 
                  />
                )}
                <p className="text-sm text-gray-500 mt-2">Analyzed content</p>
              </div>
            )}
            
            {result.deepfake_result !== undefined && (
              <div className="mb-8 text-center">
                <div
                  className={`text-4xl font-bold mb-4 ${
                    result.deepfake_result ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {result.deepfake_result ? 'AI Generated' : 'Real Content'}
                </div>
              </div>
            )}
            
            {result.message && (
              <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg">
                <p>{result.message}</p>
              </div>
            )}
            
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button
                name="Analyze Another"
                isBeam={false}
                containerClass="min-w-32"
                onClick={handleReset}
              />
              
              <Button
                name="Share Results"
                isBeam={true}
                containerClass="min-w-32"
                onClick={() => setShowSharePopup(true)}
              />
            </div>
          </div>
        )}

        {showSharePopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Share Results</h3>
                <button
                  onClick={() => setShowSharePopup(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button onClick={() => handleShare('facebook')} className="flex flex-col items-center p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                  </svg>
                  <span>Facebook</span>
                </button>
                
                <button onClick={() => handleShare('twitter')} className="flex flex-col items-center p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                  <span>Twitter</span>
                </button>
                
                <button onClick={() => handleShare('telegram')} className="flex flex-col items-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.05.01-.23-.08-.32-.08-.10-.25-.07-.36-.04-.20.05-2.35 1.49-3.58 2.27-.51.33-.96.5-1.77.5-.58 0-1.14-.15-1.62-.32-.67-.23-1.13-.35-1.09-.79.03-.17.31-.35 1.14-.59C14.01 7.66 15.72 7.07 15.1 7c.52-.1 1.2-.31 1.54-.2z" />
                  </svg>
                  <span>Telegram</span>
                </button>
                
                <button onClick={() => handleShare('whatsapp')} className="flex flex-col items-center p-3 bg-green-500 text-white rounded-lg hover:bg-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.26h.47c.15 0 .36-.06.55.45l.69 1.87c.06.13.1.28.01.44-.1.16-.16.25-.3.38-.14.13-.29.29-.42.41-.13.14-.27.28-.12.54.15.26.68 1.19 1.42 1.88.96.9 1.73 1.19 1.99 1.31.25.12.39.09.53-.06.14-.15.6-.7.76-.94.16-.25.31-.21.52-.11l1.62.84z M12.2 21.7c-3.21 0-6.22-1.27-8.48-3.56L0 21.51l3.39-3.4A10.41 10.41 0 0 1 12.2 1.73c5.71 0 10.36 4.67 10.37 10.39 0 5.73-4.64 10.4-10.37 10.4zm0-19.31A8.91 8.91 0 0 0 3.32 12.2a8.94 8.94 0 0 0 1.69 5.3l-.72.72 1.86-1.86.65.51a8.86 8.86 0 0 0 5.4 1.84 8.95 8.95 0 0 0 0-17.9z" />
                  </svg>
                  <span>WhatsApp</span>
                </button>
              </div>
              
              <button 
                onClick={() => setShowSharePopup(false)}
                className="w-full py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default InDetect;