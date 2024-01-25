import React, { useEffect } from 'react';
import { faFileImport, faDownload, faHighlighter, faLanguage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { faUikit } from '@fortawesome/free-brands-svg-icons';
import { useTranslation } from 'react-i18next';

const Features = () => {
  const { t } = useTranslation();
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
          <FontAwesomeIcon className='text-black w-8 h-8' icon={iconName} />
          </div>
        </div>
        <div className="mt-2 text-lg">{t(`${labelText}`)}</div>
      </div>
    );
  }

  return (
    <div className="bg-cover bg-center bg-no-repeat flex flex-col font-base items-center text-white justify-center min-h-screen"style={{ backgroundImage: `url('/bg3.jpg')` }} > 

      {/* Headline */}
      <div data-aos="fade-up" className="relative group p-1">
        <h1 className="relative z-10 bg-black text-4xl font-bold my-8 p-2 text-white py-4 px-12 uppercase border-white border-4">
        {t('mainFeatures')}
        </h1>
        <div className="absolute top-[50px] left-[12px] w-[98%] h-[50%] border-black border-4 bg-green-500 transition-colors"></div>
      </div>
      <div data-aos="fade-up" className="relative group p-1">
        <h1 className="relative z-10 bg-black text-xl font-bold my-4  p-2 text-white py-4 px-12 uppercase border-white border-4">
         {t('everythingYouNeed')}
        </h1>
        <div className="absolute top-[35px] left-[12px] w-[98%] h-[60%] border-black border-4 bg-green-500 transition-colors"></div>
      </div>
      {/* First Row - 3 Icons */}
      <div className="flex justify-center space-x-16 mb-10 w-full max-w-6xl">
        {createIcon(faUikit, "userFriendlyInterface", "zoom-in", 0)}
        {createIcon(faFileImport, "multipleTypesOfImport", "zoom-in", 200)}
        {createIcon(faDownload, "multipleTypesOfExport", "zoom-in", 400)}
      </div>

      {/* Second Row - 2 Icons */}
      <div className="flex justify-center space-x-16 w-full mb-4 max-w-4xl">
        {createIcon(faHighlighter, "customizableAnnotations", "zoom-in", 600)}
        {createIcon(faLanguage, "multiLanguageSupport", "zoom-in", 800)}
      </div>
    </div>
  );
}

export default Features;