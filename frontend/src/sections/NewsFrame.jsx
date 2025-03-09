import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './NewsFrame.css'; // Using your provided CSS file

const DebunkedMythViewer = () => {
  const [myths, setMyths] = useState([]);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const frameRefs = useRef([]);

  // Fetch debunked myths from Flask backend
  useEffect(() => {
    fetchDebunkedMyths();
  }, []);

  const fetchDebunkedMyths = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/get-debunked-myths');
      const { status, message, myths } = response.data;

      if (status === 'error') {
        setError(message);
        setMyths([]);
        return;
      }

      // Map the API data to the expected format
      const formattedMyths = myths.map((myth) => ({
        title: myth.myth,
        description: 'This myth has been debunked by Snopes.',
        debunkUrl: myth.debunk_url
      }));

      // Remove duplicates
      const uniqueMyths = removeDuplicates(formattedMyths, 'title');
      setMyths(uniqueMyths);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch debunked myths:', err);
      setError('Failed to load debunked myths. Please try again later.');
      setMyths([]);
    }
  };

  // Helper function to remove duplicates based on a key
  const removeDuplicates = (array, key) => {
    return Array.from(new Map(array.map(item => [item[key], item])).values());
  };

  // Set up refs for each frame
  useEffect(() => {
    frameRefs.current = frameRefs.current.slice(0, myths.length);
  }, [myths]);

  // 3D card effect functions
  const handleMouseMove = (e, index) => {
    if (expandedIndex !== null || !frameRefs.current[index]) return;

    const frame = frameRefs.current[index];
    const rect = frame.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const moveX = (x - centerX) / centerX * 10;
    const moveY = (y - centerY) / centerY * -10;

    frame.style.transform = `perspective(1200px) rotateX(${moveY}deg) rotateY(${moveX}deg) scale3d(1.03, 1.03, 1.03)`;

    // Add glare effect
    updateGlareEffect(frame, x, y);
  };

  const updateGlareEffect = (frame, x, y) => {
    let glare = frame.querySelector('.glare-effect');

    if (!glare) {
      glare = document.createElement('div');
      glare.classList.add('glare-effect');
      glare.style.position = 'absolute';
      glare.style.top = '0';
      glare.style.left = '0';
      glare.style.right = '0';
      glare.style.bottom = '0';
      glare.style.zIndex = '4';
      glare.style.pointerEvents = 'none';
      frame.appendChild(glare);
    }

    glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 50%)`;
  };

  const handleMouseLeave = (index) => {
    if (expandedIndex !== null || !frameRefs.current[index]) return;

    const frame = frameRefs.current[index];
    frame.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';

    // Remove glare effect
    const glare = frame.querySelector('.glare-effect');
    if (glare) {
      glare.remove();
    }
  };

  // Toggle expanded state for a card
  const toggleExpand = (index) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
      </div>
    );
  }

  if (myths.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        <p>No debunked myths available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {expandedIndex !== null && (
        <div 
          className={`frame-overlay ${expandedIndex !== null ? 'active' : ''}`}
          onClick={() => setExpandedIndex(null)}
        ></div>
      )}
      
      {myths.map((frame, index) => (
        <div key={index} className="flex flex-col">
          <div
            ref={(el) => (frameRefs.current[index] = el)}
            className={`frame-card rounded-xl ${expandedIndex === index ? 'expanded-frame' : ''}`}
            onMouseMove={(e) => handleMouseMove(e, index)}
            onMouseLeave={() => handleMouseLeave(index)}
            onClick={() => toggleExpand(index)}
          >
            <div className="frame-border absolute inset-0 border border-gray-700 rounded-xl pointer-events-none z-10"></div>

            <div className="frame-content relative z-5 flex flex-col h-full p-6">
              <div className="frame-header" style={{ transform: 'translateZ(25px)' }}>
                <h3
                  className="frame-title text-xl md:text-2xl font-bold text-center mt-2 relative"
                  style={{ transform: 'translateZ(30px)' }}
                >
                  {frame.title}
                </h3>
              </div>

              {/* Description text - always visible */}
              <div 
                className="description-text mt-4 text-center opacity-90"
                style={{ transform: 'translateZ(25px)' }}
              >
                <p>{frame.description}</p>
              </div>

              {/* Expanded content */}
              {expandedIndex === index && (
                <div className="article-content mt-4">
                  <p>Learn more about this debunked claim by visiting the source article at Snopes.</p>
                  <div className="mt-4">
                    <button 
                      className="close-button absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 p-2 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedIndex(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Read Article button - completely outside the frame */}
          <a 
            href={frame.debunkUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="read-more-btn w-full py-2 mt-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-medium text-center"
            onClick={(e) => e.stopPropagation()}
          >
            Read Article
          </a>
        </div>
      ))}
    </div>
  );
};

export default DebunkedMythViewer;