import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobeEurope, faGlobeAmericas } from '@fortawesome/free-solid-svg-icons';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [activeLang, setActiveLang] = useState(i18n.language);

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    setActiveLang(language);
  };

  return (
    <div className="flex justify-center gap-4">
      <button
        onClick={() => changeLanguage('en')}
        className={`  flex items-center  ${activeLang === 'en' ? ' bg-blue-500 text-white' : ' text-gray-700'}`}
      >
        <FontAwesomeIcon icon={faGlobeAmericas} className="" />
      </button>
      <button
        onClick={() => changeLanguage('sk')}
        className={` flex items-center ${activeLang === 'sk' ? ' bg-blue-500 text-white' : ' text-gray-700'}`}
      >
        <FontAwesomeIcon icon={faGlobeEurope} className="" />
      </button>
    </div>
  );
};

export default LanguageSwitcher;
