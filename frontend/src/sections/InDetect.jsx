// src/sections/InDetect.jsx
import { useState, useRef, useCallback, useEffect } from 'react'; // Added useEffect
import Button from '../components/Button.jsx';
import Loading from '../components/Loading.jsx';

const InDetect = ({ onBack }) => {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log('Render triggered, file:', file ? file.name : null, 'url:', url);
  }); // Log render to debug

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
    console.log('Drop event triggered, URL:', url);
    if (!url && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.match('image/*') || droppedFile.type.match('video/*')) {
        console.log('Setting file:', droppedFile.name);
        setFile(droppedFile);
        setUrl('');
      }
    } else if (url) {
      console.log('Drop ignored due to URL presence');
    }
  }, [url]);

  const handleFileSelect = (e) => {
    console.log('File select event triggered, URL:', url);
    if (!url && e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      console.log('Setting file:', selectedFile.name);
      setFile(selectedFile);
      setUrl('');
    }
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    if (newUrl) setFile(null);
    console.log('URL changed to:', newUrl, 'File cleared:', !newUrl);
  };

  const handleBrowseClick = () => {
    if (!url) {
      fileInputRef.current.click();
    }
  };

  const handleClearFile = () => {
    setFile(null);
    console.log('File cleared');
  };

  const handleAnalyze = async () => {
    if (!file && !url) return;
    console.log('Analyze clicked, setting isAnalyzing to true');
    setIsAnalyzing(true);
  };

  const handleAnalysisComplete = () => {
    console.log('Analysis complete, setting isAnalyzing to false');
    try {
      const mockResult = {
        type: file ? 'file' : 'url',
        name: file ? file.name : url,
        confidence: Math.floor(Math.random() * 100) + '%',
        classification: Math.random() > 0.5 ? 'AI Generated' : 'Authentic',
        details: [
          { label: 'Manipulation Score', value: Math.floor(Math.random() * 100) + '%' },
          { label: 'Consistency Score', value: Math.floor(Math.random() * 100) + '%' },
          { label: 'Noise Pattern', value: Math.random() > 0.5 ? 'Suspicious' : 'Normal' },
        ],
      };
      setResult(mockResult);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="c-space my-10">
      {isAnalyzing && <Loading onLoadingComplete={handleAnalysisComplete} />}
      <div className="grid-container max-w-4xl mx-auto">
        <div className="mb-6">
          <button onClick={onBack} className="text-blue-500 underline hover:text-blue-700">
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
            key={url} // Force re-render when URL changes
          />
          {file ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <span className="text-lg font-medium text-green-600">File selected:</span>
              </div>
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
              <p className="text-lg">Drag and drop your image or video here</p>
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
              {url && (
                <p className="text-sm text-red-500 mt-2">
                  Note: URL is entered. Drag-and-drop and Browse Files are disabled until the URL is cleared.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="mb-2 font-medium">OR enter a URL:</p>
          <input
            type="text"
            placeholder="https://example.com/image.jpg"
            className={`w-full p-3 border rounded-lg ${file ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
            value={url}
            onChange={handleUrlChange}
            disabled={!!file}
          />
          {file && (
            <p className="text-sm text-gray-500 mt-1">Clear the file selection above to enter a URL</p>
          )}
        </div>

        <Button
          name={isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
          isBeam={!isAnalyzing}
          containerClass="w-full mb-8"
          onClick={handleAnalyze}
          disabled={isAnalyzing || (!file && !url)}
        />

        {result && !isAnalyzing && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-center">Analysis Results</h2>
            <div className="mb-6">
              <p className="text-gray-500 mb-1">Analyzed {result.type}:</p>
              <p className="font-medium truncate">{result.name}</p>
            </div>
            <div className="mb-6 text-center">
              <div
                className={`text-3xl font-bold mb-2 ${
                  result.classification === 'AI Generated' ? 'text-red-500' : 'text-green-500'
                }`}
              >
                {result.classification}
              </div>
              <p className="text-gray-600">Confidence: {result.confidence}</p>
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