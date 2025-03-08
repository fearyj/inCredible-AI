import { useState } from 'react';

import Button from '../components/Button.jsx';

const About = () => {
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
        {/* First Contact Me container */}
        <div className="grid-container">
          <img src="assets/grid4.png" alt="contact" className="w-full h-[276px] object-cover object-top" />

          <div className="space-y-4">
            <p className="grid-subtext text-center">Contact me</p>
            <div className="copy-container" onClick={handleCopy}>
              <img src={hasCopied ? 'assets/tick.svg' : 'assets/copy.svg'} alt="copy" />
              <p className="lg:text-2xl md:text-xl font-medium text-gray_gradient text-white">adrian@jsmastery.pro</p>
            </div>
            <Button name="Send Email" isBeam containerClass="w-full mt-6" />
          </div>
        </div>

        {/* Second Contact Me container */}
        <div className="grid-container">
          <img src="assets/grid4.png" alt="contact" className="w-full h-[276px] object-cover object-top" />

          <div className="space-y-4">
            <p className="grid-subtext text-center">Contact me</p>
            <div className="copy-container">
              <img src="assets/copy.svg" alt="copy" />
              <p className="lg:text-2xl md:text-xl font-medium text-gray_gradient text-white">Your custom text here</p>
            </div>
            <Button name="Custom Button" isBeam containerClass="w-full mt-6" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;