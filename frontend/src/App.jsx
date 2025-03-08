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

const App = () => {
  const [showInDetect, setShowInDetect] = useState(false); // State to toggle InDetect

  // Function to show InDetect
  const handleShowInDetect = () => {
    setShowInDetect(true);
  };

  // Function to go back to main content
  const handleBackToMain = () => {
    setShowInDetect(false);
  };

  return (
    <main className="max-w-7xl mx-auto relative">
      <Navbar />
      {showInDetect ? (
        <InDetect onBack={handleBackToMain} /> // Pass a back function to InDetect
      ) : (
        <>
          <Hero />
          <About onDetectClick={handleShowInDetect} /> {/* Pass the handler to About */}
          <Projects />
          <Clients />
          <WorkExperience />
          <Contact />
        </>
      )}
      <Footer />
    </main>
  );
};

export default App;