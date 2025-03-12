import { useState } from 'react';
import Button from '../components/Button.jsx';
import NewsFrame from '../sections/NewsFrame.jsx'; // Import the NewsFrame component

const About = ({ onDetectClick, onFactClick }) => {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('adrian@jsmastery.pro');
    setHasCopied(true);

    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <section className="c-space my-20" id="tools">
      {/* First section: inDetect and inFact tools */}
      <div className="mt-16"> {/* Added margin-top to push content down */}
        <h2 className="text-3xl font-bold mb-12 text-center text-white">Tools</h2> {/* Added Tools title */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full mb-20">
          {/* First container - inDetect */}
          <div className="grid-container">
            <img src="assets/fake_face.svg" alt="contact" className="w-full h-64 object-contain" />
            <div className="space-y-4">
              <p className="grid-subtext text-center">inDetect</p>
              <div className="copy-container" onClick={handleCopy}>
                <img src={hasCopied ? 'assets/tick.svg' : 'assets/copy.svg'} alt="copy" />
                <p className="lg:text-2xl md:text-xl font-medium text-gray_gradient text-white">AI Detection Tool</p>
              </div>
              <div onClick={onDetectClick} className="cursor-pointer">
                <Button name="Detect now" isBeam containerClass="w-full mt-6" />
              </div>
            </div>
          </div>

          {/* Second container - inFact */}
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
      </div>

      {/* Second section: 3D Frames */}
      <div className="mt-24" id='myths'>
        <h2 className="text-3xl font-bold mb-12 text-center text-white">Debunked News</h2>
        <NewsFrame />
      </div>
    </section>
  );
};

export default About;