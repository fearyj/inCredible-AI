import { useState } from 'react';
import Hero from './sections/Hero.jsx';
import About from './sections/About.jsx';
import Footer from './sections/Footer.jsx';
import Navbar from './sections/Navbar.jsx';
import Contact from './sections/Contact.jsx';
import Clients from './sections/Clients.jsx';
import Projects from './sections/Projects.jsx';
import WorkExperience from './sections/Experience.jsx';
import InDetect from './sections/InDetect.jsx'; // Import InDetect
import InFact from './sections/InFact.jsx';

const App = () => {
  const [showInDetect, setShowInDetect] = useState(false); // State to toggle InDetect
  const [showInFact, setShowInFact] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');

  // Function to show InDetect
  const handleShowInDetect = () => {
    setShowInDetect(true);
  };
  // Function to show InFact
  const handleShowInFact = () => {
    setShowInFact(true);
    setShowInDetect(false); // Ensure InDetect is hidden when showing InFact
  };
  // Function to go back to main content
  const handleBackToMain = () => {
    setShowInDetect(false);
  };

  // Navigation handler for navbar
  const handleNavigation = (sectionId) => {
    // Reset tool views
    setShowInDetect(false);
    setShowInFact(false);
    
    // Set current section
    setCurrentSection(sectionId);
    
    // Handle special sections
    if (sectionId === 'indetect') {
      setShowInDetect(true);
    } else if (sectionId === 'infact') {
      setShowInFact(true);
    } else {
      // For normal sections, scroll to them if in main view
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <main className="max-w-7xl mx-auto relative">
      <Navbar onNavigate={handleNavigation} currentSection={currentSection}/>
      {showInDetect ? (
        <InDetect onBack={handleBackToMain} /> // Pass a back function to InDetect
      ) : showInFact ? (
        <InFact onBack={handleBackToMain} /> // Render InFact component when showInFact is true
      ) : (
        <>
          <Hero />
          <About 
            onDetectClick={handleShowInDetect} 
            onFactClick={handleShowInFact}
          /> {/* Pass the handler to About */}
          <Projects />
          {/* <Clients /> */}
          <WorkExperience />
          <Contact />
        </>
      )}
      <Footer />
    </main>
  );
};

export default App;