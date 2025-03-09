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
    <main className="max-w-7xl mx-auto relative">
      <Navbar onNavigate={handleNavigation} currentSection={currentSection} />
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
          <NewsFrame />
          <Contact />
        </>
      )}
      <Footer />
    </main>
  );
};

export default App;