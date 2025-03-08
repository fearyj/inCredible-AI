import { useState, useRef, useEffect } from 'react';
import './NewsFrame.css'; // Make sure to create this CSS file

const NewsFrame = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const frameRefs = useRef([]);
  
  // Set up refs for each frame
  useEffect(() => {
    frameRefs.current = frameRefs.current.slice(0, 3);
  }, []);
  
  // 3D card effect functions
  const handleMouseMove = (e, index) => {
    if (expandedCard !== null || !frameRefs.current[index]) return;
    
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
    if (expandedCard !== null || !frameRefs.current[index]) return;
    
    const frame = frameRefs.current[index];
    frame.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    
    // Remove glare effect
    const glare = frame.querySelector('.glare-effect');
    if (glare) {
      glare.remove();
    }
  };
  
  const handleCardClick = (index) => {
    if (expandedCard !== null) return;
    setExpandedCard(index);
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.classList.add('frame-overlay');
    document.body.appendChild(overlay);
    
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    
    // Animate overlay
    setTimeout(() => {
      overlay.classList.add('active');
    }, 10);
  };
  
  const handleCloseCard = () => {
    setExpandedCard(null);
    
    // Remove overlay
    const overlay = document.querySelector('.frame-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
      }, 300);
    } else {
      document.body.style.overflow = '';
    }
  };
  
  // Close expanded card on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && expandedCard !== null) {
        handleCloseCard();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedCard]);
  
  // Handle overlay click
  useEffect(() => {
    const handleOverlayClick = (e) => {
      if (e.target.classList.contains('frame-overlay')) {
        handleCloseCard();
      }
    };
    
    window.addEventListener('click', handleOverlayClick);
    return () => window.removeEventListener('click', handleOverlayClick);
  }, [expandedCard]);
  
  // Frame data
  const frames = [
    {
      title: "Building AI Interfaces",
      subtitle: "Design Principles",
      imageSrc: "assets/frame1.jpg",
      content: `
        <h2>Building Effective AI Interfaces</h2>
        <p>The intersection of artificial intelligence and user interface design presents unique challenges and opportunities. Effective AI interfaces need to be intuitive, transparent, and provide meaningful interactions.</p>
        
        <h3>Key Design Principles</h3>
        <p>When designing interfaces for AI systems, consider these fundamental principles:</p>
        
        <ul>
          <li><strong>Transparency:</strong> Users should understand what the AI is doing and why</li>
          <li><strong>User Control:</strong> Provide options to override or guide AI decisions</li>
          <li><strong>Progressive Disclosure:</strong> Reveal complexity as needed, not all at once</li>
          <li><strong>Error Recovery:</strong> Make it easy to correct AI mistakes</li>
          <li><strong>Feedback Loops:</strong> Allow users to improve the AI through interaction</li>
        </ul>
        
        <h3>Technical Considerations</h3>
        <p>The technical implementation of AI interfaces should account for:</p>
        
        <ul>
          <li>Response time and perceived performance</li>
          <li>Handling uncertainty in AI predictions</li>
          <li>Appropriate use of visualization for complex data</li>
          <li>Accessibility concerns specific to AI interactions</li>
          <li>Progressive enhancement for different capabilities</li>
        </ul>
        
        <p>By following these principles, developers can create AI interfaces that are both powerful and usable, enabling users to harness the capabilities of artificial intelligence without being overwhelmed by its complexity.</p>
      `
    },
    {
      title: "Machine Learning Models",
      subtitle: "Implementation Strategies",
      imageSrc: "assets/frame2.jpg",
      content: `
        <h2>Effective ML Model Implementation</h2>
        <p>Implementing machine learning models in production environments requires careful planning and robust architecture. The journey from experimental notebook to production system involves numerous considerations.</p>
        
        <h3>Model Lifecycle Management</h3>
        <p>A comprehensive approach to ML implementation includes:</p>
        
        <ul>
          <li><strong>Version Control:</strong> Tracking model iterations and parameters</li>
          <li><strong>Evaluation Metrics:</strong> Consistent performance measurement</li>
          <li><strong>Monitoring:</strong> Detecting model drift and performance degradation</li>
          <li><strong>Retraining Pipelines:</strong> Automated processes for model updates</li>
          <li><strong>A/B Testing:</strong> Methodical deployment of model improvements</li>
        </ul>
        
        <h3>Infrastructure Considerations</h3>
        <p>The technical foundation for ML models must address:</p>
        
        <ul>
          <li>Scalable inference capabilities</li>
          <li>Batch vs. real-time prediction needs</li>
          <li>Resource optimization for cost efficiency</li>
          <li>Data pipeline integration</li>
          <li>Security and privacy requirements</li>
        </ul>
        
        <p>Successful ML implementation bridges the gap between data science experimentation and software engineering discipline, creating systems that deliver consistent value while adapting to changing conditions.</p>
      `
    },
    {
      title: "Natural Language Processing",
      subtitle: "Advanced Techniques",
      imageSrc: "assets/frame3.jpg",
      content: `
        <h2>Advanced Natural Language Processing</h2>
        <p>Natural Language Processing (NLP) has evolved dramatically with the advent of transformer models and large language models (LLMs). These advancements have opened new possibilities for processing and generating human language.</p>
        
        <h3>Modern NLP Architectures</h3>
        <p>The current landscape of NLP technology is shaped by:</p>
        
        <ul>
          <li><strong>Attention Mechanisms:</strong> The foundation of modern language understanding</li>
          <li><strong>Transfer Learning:</strong> Leveraging pre-trained models for specific tasks</li>
          <li><strong>Few-shot Learning:</strong> Adapting models with minimal examples</li>
          <li><strong>Multimodal Integration:</strong> Combining text with images, audio, and other data</li>
          <li><strong>Ethical Considerations:</strong> Addressing bias and fairness in language models</li>
        </ul>
        
        <h3>Implementation Challenges</h3>
        <p>Deploying advanced NLP solutions requires addressing:</p>
        
        <ul>
          <li>Computational efficiency and optimization</li>
          <li>Handling context limitations in large models</li>
          <li>Evaluation beyond traditional metrics</li>
          <li>Domain adaptation for specialized applications</li>
          <li>Responsible AI deployment practices</li>
        </ul>
        
        <p>As NLP continues to advance, the ability to effectively harness these technologies while understanding their limitations will be crucial for creating valuable and responsible language-based applications.</p>
      `
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {frames.map((frame, index) => (
        <div 
          key={index}
          ref={el => frameRefs.current[index] = el}
          className={`frame-card relative overflow-hidden rounded-xl transition-all duration-500 ${expandedCard === index ? 'expanded-frame' : ''}`}
          onMouseMove={(e) => handleMouseMove(e, index)}
          onMouseLeave={() => handleMouseLeave(index)}
          onClick={() => expandedCard === null && handleCardClick(index)}
        >
          <div className="frame-border absolute inset-0 border border-white/10 rounded-xl pointer-events-none z-10"></div>
          
          <div className="frame-image absolute inset-0 z-0">
            <img 
              src={frame.imageSrc} 
              alt={frame.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                e.target.src = "/api/placeholder/400/320";
              }}
            />
          </div>
          
          <div className="frame-content relative z-[5] flex flex-col h-full p-6">
            <div className="frame-header transform-gpu" style={{ transform: 'translateZ(25px)' }}>
              <p className="frame-subtitle text-center text-sm opacity-80 transform-gpu" style={{ transform: 'translateZ(20px)' }}>
                {frame.subtitle}
              </p>
              
              <h3 className="frame-title text-xl md:text-2xl font-bold text-center mt-2 relative transform-gpu" style={{ transform: 'translateZ(30px)' }}>
                {frame.title}
              </h3>
            </div>
            
            {/* Article content - only visible when expanded */}
            <div className={`article-content mt-8 ${expandedCard === index ? 'block' : 'hidden'}`}
              dangerouslySetInnerHTML={{ __html: frame.content }}
            />
            
            {/* Read more button - only visible when not expanded */}
            <div className={`frame-footer mt-auto transform-gpu opacity-90 transition-all duration-300 ease-out ${expandedCard !== null ? 'hidden' : 'block'}`} 
              style={{ transform: 'translateZ(25px)' }}
            >
              <button className="read-more-btn w-full py-2 mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-medium">
                Read Article
              </button>
            </div>
          </div>
          
          {/* Close button - only visible when expanded */}
          {expandedCard === index && (
            <button 
              className="close-button absolute top-4 right-4 z-50 bg-white/10 text-white w-8 h-8 rounded-full flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                handleCloseCard();
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default NewsFrame;