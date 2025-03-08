import { useState, useRef, useCallback, useEffect } from 'react';
import Button from '../components/Button.jsx';  // Assumes you have a Button component
import axios from "axios";

const InDetect = ({ onBack }) => {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log('Render triggered, file:', file ? file.name : null, 'url:', url);
  }, [file, url]);

  const isValidYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|.+\?v=)?([^&=%\?]{11})/;
    return youtubeRegex.test(url);
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!url && (e.type === 'dragenter' || e.type === 'dragover')) {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, [url]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!url && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.match('image/') || droppedFile.type.match('video/')) {
        setFile(droppedFile);
        setUrl('');
      }
    }
  }, [url]);

  const handleFileSelect = (e) => {
    if (!url && e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setUrl('');
    }
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    if (newUrl) {
      setFile(null);
      if (!isValidYouTubeUrl(newUrl)) {
        setError('Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=xyz).');
      } else {
        setError(null);
      }
    } else {
      setError(null);
    }
  };

  const handleBrowseClick = () => {
    if (!url && fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleClearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    console.log('handleAnalyze called, file:', file ? file.name : 'none', 'url:', url); // Test log
    if (!file && !url) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      console.log("Sending request, file:", file ? file.name : "none", "url:", url); // Debug log
      if (file) {
        formData.append("file", file);
      } else {
        formData.append("url", url);
      }

      const response = await axios.post("http://127.0.0.1:5000/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      console.log("Received response from Flask:", response.data);
      setResult(response.data);
    } catch (error) {
      console.error("Error details:", error); // More detailed error logging
      setError(error.response?.data?.error || "Failed to analyze content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="c-space my-10 pt-20">
      <div className="grid-container max-w-4xl mx-auto">
        <h1 className="grid-headtext text-center mb-6">inDetect - Media Analysis Tool</h1>
        <p className="grid-subtext text-center mb-8">
          Analyze images, videos, or YouTube URLs to detect AI-generated content
        </p>

        <div
          className={`border-2 border-dashed rounded-lg p-6 mb-6 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          } ${file ? 'bg-green-50 border-green-500' : ''} ${url ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            disabled={!!url}
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
                className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ${
                  url ? 'cursor-not-allowed opacity-50' : ''
                }`}
                disabled={!!url}
              >
                Browse Files
              </button>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="mb-2 font-medium">OR enter a YouTube URL:</p>
          <input
            type="text"
            placeholder="https://www.youtube.com/watch?v=xyz"
            className={`w-full p-3 border rounded-lg ${
              file ? 'bg-gray-100 text-gray-500' : 'bg-white'
            } ${error && url ? 'border-red-500' : 'border-gray-300'}`}
            value={url}
            onChange={handleUrlChange}
            disabled={!!file}
          />
          {file && (
            <p className="text-sm text-gray-500 mt-1">Clear the file selection above to enter a URL</p>
          )}
          {error && url && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>

        {error && !url && <p className="text-red-500 text-center mb-4">{error}</p>}

        <Button
          name={isLoading ? 'Analyzing...' : 'Analyze Content'}
          isBeam={true}
          containerClass="w-full mb-8"
          onClick={handleAnalyze}
          disabled={isLoading || (!file && !url) || (url && !isValidYouTubeUrl(url))}
        />

        {result && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-center">Analysis Results</h2>
            {result.type && result.name && (
              <div className="mb-6">
                <p className="text-gray-500 mb-1">Analyzed {result.type}:</p>
                <p className="font-medium truncate">{result.name}</p>
              </div>
            )}
            {result.deepfake_result !== undefined && (
              <div className="mb-6 text-center">
                <div
                  className={`text-3xl font-bold mb-2 ${
                    result.deepfake_result ? 'text-red-500' : 'text-green-500'
                  }`}
                >
                  {result.deepfake_result ? 'AI Generated' : 'Real'}
                </div>
              </div>
            )}
            {result.message && (
              <p className="text-gray-500 text-center mt-4">{result.message}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default InDetect;