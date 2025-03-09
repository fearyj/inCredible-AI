// src/App.jsx
import { useState } from 'react';
import Hero from './sections/Hero.jsx';
import About from './sections/About.jsx';
import Footer from './sections/Footer.jsx';
import Navbar from './sections/Navbar.jsx';
import Contact from './sections/Contact.jsx';
import Clients from './sections/Clients.jsx';
import Projects from './sections/Projects.jsx';
import WorkExperience from './sections/Experience.jsx';
import InDetect from './sections/InDetect.jsx';
import InFact from './sections/InFact.jsx';
import NewsFrame from './sections/NewsFrame.jsx';



const App = () => {
  const [showInDetect, setShowInDetect] = useState(false);
  const [showInFact, setShowInFact] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');

  const handleShowInDetect = () => setShowInDetect(true);
  const handleShowInFact = () => {
    setShowInFact(true);
    setShowInDetect(false);
  };
  const handleBackToMain = () => {
    setShowInDetect(false);
    setShowInFact(false);
  };

  const handleNavigation = (sectionId) => {
    setShowInDetect(false);
    setShowInFact(false);
    setCurrentSection(sectionId);
    if (sectionId === 'indetect') {
      setShowInDetect(true);
    } else if (sectionId === 'infact') {
      setShowInFact(true);
    } else {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };
  return (
    <div className="flex flex-col min-h-screen bg-[#111] w-full">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#111]">
        <div className="max-w-7xl mx-auto">
          <Navbar onNavigate={handleNavigation} currentSection={currentSection} />
        </div>
      </header>
      
      <main className={`flex-grow pt-1 mb-16 ${showInFact ? 'w-full' : 'max-w-5xl mx-auto'} relative`}>
        {showInDetect ? (
          <InDetect onBack={handleBackToMain} />
        ) : showInFact ? (
          <InFact onBack={handleBackToMain} />
        ) : (
          <>
            <Hero />
            <About onDetectClick={handleShowInDetect} onFactClick={handleShowInFact} />
            <Projects />
            {/* <Clients /> */}
            {/* <WorkExperience /> */}
            <Contact />
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default App;