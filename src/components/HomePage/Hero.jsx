import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';

const Hero = () => {
  
  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true, // Animacia sa zobrazi len raz pri prvom nacitani
      mirror: false // Animacia sa nezopakuje pri spatnom skrolovani
    });
  }, []);

  return (
    <div
      className=" bg-cover bg-center bg-no-repeat font-base text-white h-screen flex flex-col justify-center items-center"
      style={{ backgroundImage: `url('/bg.png')` }}
    >
      <h1 data-aos="fade-down" className="text-6xl p-4 bg-black mb-4 mt-0">
        Your go-to Annotation Tool <br /> for the Slovak Language
      </h1>

      <h2 data-aos="fade-up" data-aos-delay="200" className="text-3xl bg-black mb-8 p-4">
        Effortless manual annotation, accurate results.
      </h2>
      <div className="flex gap-[100px] text-xl">
        {/* First Button */}
        <div className="relative group p-1 " data-aos="zoom-in" data-aos-delay="400">
          <Link
            to="/features"
            className="relative z-10 bg-white text-black py-4 px-12 uppercase border-black border-2 flex items-center"
          >
            Get Started <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </Link>
          <div className="absolute top-[8px] left-[16px] w-[95%] h-[95%] bg-black group-hover:bg-[#53F541] transition-colors"></div>
        </div>

        {/* Second Button */}
        <div className="relative group p-1 " data-aos="zoom-in" data-aos-delay="600">
          <button className="relative z-10 bg-white text-black py-4 px-12 uppercase border-black border-2">
            GitHub <FontAwesomeIcon icon={faGithub} />{" "}
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
          <div className="absolute top-[8px] left-[13px] w-[95%] h-[95%] bg-black group-hover:bg-[#53F541] transition-colors"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
