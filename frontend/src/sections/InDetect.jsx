import { useState, useRef, useCallback } from 'react';
import Button from '../components/Button.jsx';

const InDetect = ({ onBack }) => { // Accept onBack as a prop
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.match('image/*') || droppedFile.type.match('video/*')) {
        setFile(droppedFile);
        setUrl('');
      }
    }
  }, []);

  // Handle file selection via browse
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUrl('');
    }
  };

  // Handle URL input
  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    if (e.target.value) {
      setFile(null);
    }
  };

  // Trigger file input click
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  // Clear the selected file
  const handleClearFile = () => {
    setFile(null);
  };

  // Analyze the file or URL
  const handleAnalyze = async () => {
    if (!file && !url) return;
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setResult({
        type: file ? 'file' : 'url',
        name: file ? file.name : url,
        confidence: Math.floor(Math.random() * 100) + '%',
        classification: Math.random() > 0.5 ? 'AI Generated' : 'Authentic',
        details: [
          { label: 'Manipulation Score', value: Math.floor(Math.random() * 100) + '%' },
          { label: 'Consistency Score', value: Math.floor(Math.random() * 100) + '%' },
          { label: 'Noise Pattern', value: Math.random() > 0.5 ? 'Suspicious' : 'Normal' }
        ]
      });
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="c-space my-10">
      <div className="grid-container max-w-4xl mx-auto">
        {/* Add Back Button */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-blue-500 underline hover:text-blue-700"
          >
            Back to Main
          </button>
        </div>

        <h1 className="grid-headtext text-center mb-6">inDetect - Media Analysis Tool</h1>
        <p className="grid-subtext text-center mb-8">
          Analyze images and videos to detect AI-generated content
        </p>

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
              <div className="flex items-center justify-center">
                <span className="text-lg font-medium text-green-600">File selected:</span>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm inline-block">
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(file)}
                    controls
                    className="max-h-48 mx-auto rounded"
                  />
                )}
              </div>
              <p className="font-medium">{file.name}</p>
              <button
                onClick={handleClearFile}
                className="text-red-500 underline hover:text-red-700"
              >
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
              <p className="text-lg">Drag and drop your image or video here</p>
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

        <div className="mb-6">
          <p className="mb-2 font-medium">OR enter a URL:</p>
          <input
            type="text"
            placeholder="https://example.com/image.jpg"
            className={`w-full p-3 border rounded-lg ${
              file ? 'bg-gray-100 text-gray-500' : 'bg-white'
            }`}
            value={url}
            onChange={handleUrlChange}
            disabled={!!file}
          />
          {file && (
            <p className="text-sm text-gray-500 mt-1">
              Clear the file selection above to enter a URL
            </p>
          )}
        </div>

        <Button 
          name={isLoading ? "Analyzing..." : "Analyze Content"} 
          isBeam={!isLoading}
          containerClass="w-full mb-8" 
          onClick={handleAnalyze}
          disabled={isLoading || (!file && !url)}
        />
        
        {isLoading && (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {result && !isLoading && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-center">Analysis Results</h2>
            
            <div className="mb-6">
              <p className="text-gray-500 mb-1">Analyzed {result.type}:</p>
              <p className="font-medium truncate">{result.name}</p>
            </div>
            
            <div className="mb-6 text-center">
              <div className={`text-3xl font-bold mb-2 ${
                result.classification === 'AI Generated' ? 'text-red-500' : 'text-green-500'
              }`}>
                {result.classification}
              </div>
              <p className="text-gray-600">
                Confidence: {result.confidence}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {result.details.map((detail, index) => (
                <div key={index} className="text-center bg-gray-50 p-3 rounded">
                  <p className="text-gray-500 text-sm mb-1">{detail.label}</p>
                  <p className="font-bold">{detail.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default InDetect;