import React, { useEffect } from 'react'
import HowItWorksCard from './HowItWorksCard'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faPencilAlt, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Works = () => {

  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true,
      mirror: false
    });
  }, []);

  return (
    <div className="bg-cover bg-no-repeat flex flex-col items-center font-base text-white justify-center min-h-screen bg-black" style={{ backgroundImage: `url('/bg4.png')` }}>
      {/* Headline */}
      <div data-aos="fade-up" className="relative group p-1">
        <h1 className="relative z-10 bg-white text-4xl font-bold mb-16 p-2 text-black py-4 px-12 uppercase border-black border-2">
          HOW IT WORKS?
        </h1>
        <div className="absolute top-[15px] left-[12px] w-[98%] h-[50%] bg-black transition-colors"></div>
      </div>
      {/* First Row - 3 Cards */}
      <div data-aos="zoom-in" className="flex w-full justify-around mb-4">
        <HowItWorksCard 
          title="UPLOAD"
          step="Step 1: Upload it!"
          content="Begin your annotation journey 
          by easily uploading the text 
          you want to work with. 
          Our platform supports multiple file formats 
          including .txt,.pdf"
          icon={<FontAwesomeIcon icon={faArrowRight} />} 
        />
        <HowItWorksCard 
          title="ANNOTATE"
          step="Step 2: Annotate it!"
          content="Once your text is uploaded, the real fun begins. Utilize our intuitive and user-friendly annotation interface to highlight terms, phrases, or sentences. Choose from predefined tags or create your own to annotate the text exactly the way you want"
          icon={<FontAwesomeIcon icon={faArrowRight} />} 
        />
        <HowItWorksCard 
          title="REVIEW"
          step="Step 3: Review it!"
          content="After you've completed the annotation, it's time to collect your hard work. Export your annotated text along with the tags in various formats like .csv, .json, or .xml for easy sharing and further analysis."
          icon={<FontAwesomeIcon icon={faArrowRight} />} 
        />
      </div>
      {/* Second Row - 1 Card */}
      <div className="flex w-full justify-center">
      </div>
    </div>
  );
}

export default Works;
  