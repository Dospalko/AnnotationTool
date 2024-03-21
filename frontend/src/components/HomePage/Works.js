import React, { useEffect } from 'react'
import HowItWorksCard from './HowItWorksCard'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faHighlighter,  faMagnifyingGlassMinus } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useTranslation } from 'react-i18next';

const Works = () => {

  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true,
      mirror: false
    });
  }, []);
  const { t } = useTranslation();
  return (
    <div className="bg-cover bg-no-repeat flex flex-col items-center font-base text-white justify-center min-h-screen bg-black" style={{ backgroundImage: `url('/bg4.png')` }}>
      {/* Headline */}
      <div data-aos="fade-up" className="relative group p-1">
        <h1 className="relative z-10 bg-white text-4xl font-bold my-8 p-2  text-black py-4 px-12 uppercase border-black border-2">
          {t('howItWorks')}
        </h1>
        <div className="absolute top-[50px] left-[12px] w-[98%] h-[50%] bg-black transition-colors"></div>
      </div>
      {/* First Row - 3 Cards */}
      <div data-aos="zoom-in" className="flex  w-full xl:flex-row flex-col justify-around mb-4">
        <HowItWorksCard 
          title={t('upload')}
          step={t('upload1')}
          content={t('upload2')}
          icon={<FontAwesomeIcon icon={faUpload} />} 
        />
        <HowItWorksCard 
          title={t('annotate')}
          step={t('annotate1')}
          content={t('annotate2')}
          icon={<FontAwesomeIcon icon={faHighlighter} />} 
        />
        <HowItWorksCard 
          title={t('review')}
          step={t('review1')}
          content={t('review2')}
          icon={<FontAwesomeIcon icon={faMagnifyingGlassMinus} />} 
        />
      </div>
      {/* Second Row - 1 Card */}
      <div className="flex w-full justify-center">
      </div>
    </div>
  );
}

export default Works;
  