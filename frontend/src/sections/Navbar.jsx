import { useState } from 'react';
import { navLinks } from '../constants/index.js';

const NavItems = ({ onClick = () => {}, currentSection, onNavigate }) => (
  <ul className="nav-ul">
    {navLinks.map((item) => (
      <li key={item.id} className="nav-li">
        <a
          href={item.href}
          className={`nav-li_a ${currentSection === item.id ? 'text-white font-bold' : 'text-neutral-400'}`}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(item.id);
            onClick(); // This is for mobile menu closing
          }}
        >
          {item.name}
        </a>
      </li>
    ))}
  </ul>
);

const Navbar = ({ onNavigate, currentSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  
  // Default handler if no external handler is provided
  const handleNavigation = (sectionId) => {
    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      // Fallback behavior - just scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90">
      {/* Container without max-width constraint for left alignment */}
      <div className="px-8 sm:px-18">
        <div className="flex justify-between items-center py-4"> 
          <a
            href="#home"
            className="flex items-center text-neutral-400 font-bold text-xl hover:text-white transition-colors"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('home');
            }}
          >
            {/* Logo image */}
            <img 
              src="assets/logo.png" 
              alt="inCredible AI Logo" 
              className="h-16 w-auto mr-2" 
            />
          <span className="text-2xl sm:text-3xl">inCredible AI</span>
          </a>
          <button
            onClick={toggleMenu}
            className="text-neutral-400 hover:text-white focus:outline-none sm:hidden flex"
            aria-label="Toggle menu">
            <img src={isOpen ? 'assets/close.svg' : 'assets/menu.svg'} alt="toggle" className="w-6 h-6" />
          </button>
          <nav className="sm:flex hidden">
            <NavItems onNavigate={handleNavigation} currentSection={currentSection}/>
          </nav>
        </div>
      </div>
      <div className={`nav-sidebar ${isOpen ? 'max-h-screen' : 'max-h-0'} px-8 sm:px-16`}>
        <nav className="p-5">
          <NavItems onClick={closeMenu} onNavigate={handleNavigation} currentSection={currentSection}/>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;