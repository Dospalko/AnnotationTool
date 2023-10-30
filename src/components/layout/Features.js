import React, { useEffect } from 'react';
import { faUpload, faPencilAlt, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Features = () => {
    
  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true,
      mirror: false
    });
  }, []);

  function createIcon(iconName, labelText, animation, delay = 0) {
    return (
      <div data-aos={animation} data-aos-delay={delay} className="flex flex-col items-center p-8">
        <div className="relative w-[105px] h-[105px]">
          {/* Outer Circle */}
          <div className="absolute w-full h-full bg-pink-500 rounded-full"></div>
          {/* Inner Circle with Icon */}
          <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center">
          <FontAwesomeIcon className='text-black' icon={iconName} />
          </div>
        </div>
        <div className="mt-2 text-lg">{labelText}</div>
      </div>
    );
  }

  return (
    <div className="bg-cover bg-center bg-no-repeat flex flex-col font-base items-center text-white justify-center min-h-screen bg-black" style={{ backgroundImage: `url('/bg3.jpg')` }}>
      {/* Headline */}
      <h1 data-aos="fade-down" className="text-4xl font-bold mb-4 bg-white text-black p-2">MAIN FEATURES</h1>
      <h2 data-aos="fade-up" data-aos-delay="200" className='text-2xl font-bold mb-16 bg-white text-black p-2'>Everything you need</h2>

      {/* First Row - 3 Icons */}
      <div className="flex justify-center space-x-16 mb-10 w-full max-w-6xl">
        {createIcon(faArrowRight, "User-Friendly Interface", "zoom-in", 0)}
        {createIcon(faArrowRight, "Multiple types of import", "zoom-in", 200)}
        {createIcon(faArrowRight, "Multiple types of export", "zoom-in", 400)}
      </div>

      {/* Second Row - 2 Icons */}
      <div className="flex justify-center space-x-16 w-full max-w-4xl">
        {createIcon(faArrowRight, "Customizable Annotations", "zoom-in", 600)}
        {createIcon(faArrowRight, "Multi-language Support", "zoom-in", 800)}
      </div>
    </div>
  );
}

export default Features;
