import { useState } from 'react';
import Button from '../components/Button.jsx';

const About = ({ onDetectClick, onFactClick }) => { // Accept onDetectClick as a prop
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('adrian@jsmastery.pro');
    setHasCopied(true);

    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <section className="c-space my-20" id="about">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
        {/* First container - inDetect */}
        <div className="grid-container">
          <img src="assets/fake.png" alt="contact" className="w-full h-64 object-contain" />
          <div className="space-y-4">
            <p className="grid-subtext text-center">inDetect</p>
            <div className="copy-container" onClick={handleCopy}>
              <img src={hasCopied ? 'assets/tick.svg' : 'assets/copy.svg'} alt="copy" />
              <p className="lg:text-2xl md:text-xl font-medium text-gray_gradient text-white">AI Detection Tool</p>
            </div>
            <div onClick={onDetectClick} className="cursor-pointer"> {/* Use onDetectClick */}
              <Button name="Detect now" isBeam containerClass="w-full mt-6" />
            </div>
          </div>
        </div>

        {/* Second container - ~ */}
        <div className="grid-container">
          <img src="assets/question_mark.png" alt="contact" className="w-full h-64 object-contain" />
          <div className="space-y-4">
            <p className="grid-subtext text-center">inFact</p>
            <div className="copy-container">
              <img src="assets/copy.svg" alt="copy" />
              <p className="lg:text-2xl md:text-xl font-medium text-gray_gradient text-white">Fact Checking Tool</p>
            </div>
            <div onClick={onFactClick} className="cursor-pointer">
              <Button name="Check now" isBeam containerClass="w-full mt-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;