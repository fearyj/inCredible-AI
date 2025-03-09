import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full pt-7 pb-3 border-t border-black-300 bg-[#111] z-10 mt-auto">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center flex-wrap gap-5 px-4">
        <div className="text-white-500 flex gap-2">
          <p>Terms & Conditions</p>
          <p>|</p>
          <p>Privacy Policy</p>
        </div>

        <div className="flex gap-3">
          <div className="social-icon">
            <img src="/assets/github.svg" alt="github" className="w-1/2 h-1/2" />
          </div>
          <div className="social-icon">
            <img src="/assets/twitter.svg" alt="twitter" className="w-1/2 h-1/2" />
          </div>
          <div className="social-icon">
            <img src="/assets/instagram.svg" alt="instagram" className="w-1/2 h-1/2" />
          </div>
        </div>

        <p className="text-white-500">© 2025 inCredible AI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;