import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './NewsFrame.css'; // Ensure this CSS file exists

const DebunkedMythViewer = () => {
  const [myths, setMyths] = useState([]);
  const [error, setError] = useState(null); // State to handle errors
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
        title: myth.myth, // Use the actual myth title
        subtitle: 'Debunked Myth', 
        imageSrc: `/api/placeholder/400/320`, // Placeholder image
        description: 'This myth has been debunked by Snopes.', // Brief description
        debunkUrl: myth.debunk_url // Store the debunk URL
      }));

      setMyths(formattedMyths);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch debunked myths:', err);
      setError('Failed to load debunked myths. Please try again later.');
      setMyths([]);
    }
  };

  // Set up refs for each frame
  useEffect(() => {
    frameRefs.current = frameRefs.current.slice(0, myths.length); // Adjust refs based on myths length
  }, [myths]);

  // 3D card effect functions
  const handleMouseMove = (e, index) => {
    if (!frameRefs.current[index]) return;

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
    if (!frameRefs.current[index]) return;

    const frame = frameRefs.current[index];
    frame.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';

    // Remove glare effect
    const glare = frame.querySelector('.glare-effect');
    if (glare) {
      glare.remove();
    }
  };

  // Render error message if fetching fails or no myths are available
  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
      </div>
    );
  }

  // Render a message if no myths are available but no error occurred
  if (myths.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        <p>No debunked myths available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {myths.map((frame, index) => (
        <div
          key={index}
          ref={(el) => (frameRefs.current[index] = el)}
          className="frame-card relative overflow-hidden rounded-xl transition-all duration-500"
          onMouseMove={(e) => handleMouseMove(e, index)}
          onMouseLeave={() => handleMouseLeave(index)}
        >
          <div className="frame-border absolute inset-0 border border-white/10 rounded-xl pointer-events-none z-10"></div>

          <div className="frame-image absolute inset-0 z-0">
            <img
              src={frame.imageSrc}
              alt={frame.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/api/placeholder/400/320'; // Fallback image
              }}
            />
          </div>

          <div className="frame-content relative z-[5] flex flex-col h-full p-6">
            <div className="frame-header transform-gpu" style={{ transform: 'translateZ(25px)' }}>
              <p
                className="frame-subtitle text-center text-sm opacity-80 transform-gpu"
                style={{ transform: 'translateZ(20px)' }}
              >
                {frame.subtitle}
              </p>

              <h3
                className="frame-title text-xl md:text-2xl font-bold text-center mt-2 relative transform-gpu"
                style={{ transform: 'translateZ(30px)' }}
              >
                {frame.title}
              </h3>
            </div>

            {/* Description text - always visible */}
            <div 
              className="description-text mt-4 text-center opacity-90 transform-gpu"
              style={{ transform: 'translateZ(25px)' }}
            >
              <p>{frame.description}</p>
            </div>

            {/* Read Article button - links directly to the debunk URL */}
            <div
              className="frame-footer mt-auto transform-gpu opacity-90 transition-all duration-300 ease-out"
              style={{ transform: 'translateZ(25px)' }}
            >
              <a 
                href={frame.debunkUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="read-more-btn w-full py-2 mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-medium block text-center"
              >
                Read Article
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DebunkedMythViewer;