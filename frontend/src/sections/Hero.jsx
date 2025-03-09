import { useMediaQuery } from 'react-responsive';
import Button from '../components/Button.jsx';

const Hero = () => {
  // Use media queries to determine screen size
  const isSmall = useMediaQuery({ maxWidth: 440 });
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });

  return (
    <section className="min-h-screen w-full flex flex-col relative" id="home">
      <div className="w-full mx-auto flex flex-col sm:mt-20 mt-16 c-space gap-3">
        <p className="sm:text-3xl text-xl font-medium text-white text-center font-generalsans">
          Check everything! <span className="waving-hand"></span>
        </p>
        <p className="hero_tag text-gray_gradient">All in 1 Credibility Tool</p>
      </div>

      {/* New image container instead of Canvas */}
      <div className="w-full flex justify-center items-center mt-2">
        <div className="max-w-md w-full">
          <img 
            src="assets/logo.png" 
            alt="Credibility Tool" 
            className="w-full object-contain mx-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;