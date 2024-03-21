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
        className={`  flex items-cente p-2  ${activeLang === 'en' ? ' bg-white text-black' : ' text-gray-700'}`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('sk')}
        className={` flex items-center p-2 ${activeLang === 'sk' ? ' bg-white text-black' : ' text-gray-700'}`}
      >
        SK
      </button>
    </div>
  );
};

export default LanguageSwitcher;
