import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import PdfUpload from "../../components/annotation/PdfUpload";

import PdfTextDisplay from "../../components/annotation/PdfTextDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faSearch } from "@fortawesome/free-solid-svg-icons";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
function FeaturesPage() {
  const [pdfTexts, setPdfTexts] = useState([]);
  const [annotations, setAnnotations] = useState([]);

  const fetchAnnotations = async () => {
    try {
      const res = await axios.get("/annotations"); // Adjust URL if needed
      setAnnotations(res.data);
    } catch (error) {
      console.error("Could not fetch annotations:", error);
    }
  };

  useEffect(() => {
    fetchAnnotations();
  }, []);

  const fetchPdfTexts = async () => {
    try {
      const res = await axios.get("localhost:5000/pdf_texts");
      setPdfTexts(res.data);
    } catch (error) {
      console.error("Failed to fetch PDF texts:", error);
    }
  };
  const { t } = useTranslation();
  const deletePdfText = async (id) => {
    try {
      await axios.delete(`/delete_pdf_text/${id}`);
      await fetchPdfTexts();
    } catch (error) {
      console.error("Failed to delete PDF text:", error);
    }
  };
  const handleUploadSuccess = (updatedPdfTexts) => {
    setPdfTexts(updatedPdfTexts);
  };
  useEffect(() => {
    fetchPdfTexts();
  }, []);
  const [searchTerm, setSearchTerm] = useState("");

  const particlesInit = async (main) => {
    console.log(main);

    // you can initialize the tsParticles instance (main) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(main);
  };
  

  return (
    <section className="bg-gray-700 relative z-10 font-base text-white">
  <Particles
  id="tsparticles"
  init={particlesInit}
  options={{
    fullScreen: {
      enable: true,
      zIndex: -1,
    },
    fpsLimit: 60,
    particles: {
      number: {
        value: 30,
        density: {
          enable: true,
          area: 800,
        },
      },
      color: {
        value: "#5bc0de", // A color that's easy on the eyes and represents the annotation theme.
      },
      shape: {
        type: "circle",
      },
      opacity: {
        value: 0.5,
        random: false,
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: true,
          speed: 2,
          size_min: 0.3,
          sync: false,
        },
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#ffffff",
        opacity: 0.4,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "bounce",
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200,
        },
      },
    },
    interactivity: {
      detectsOn: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "repulse",
        },
        onclick: {
          enable: true,
          mode: "push",
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 140,
          line_linked: {
            opacity: 1,
          },
        },
        bubble: {
          distance: 400,
          size: 40,
          duration: 2,
          opacity: 0.8,
          speed: 3,
        },
        repulse: {
          distance: 200,
          duration: 0.4,
        },
        push: {
          particles_nb: 4,
        },
        remove: {
          particles_nb: 2,
        },
      },
    },
    retina_detect: true,
  }}
/>

      <Header className="z-20 relative group" />
      {/* Heading */}
      <div className="relative group p-1 mt-10 mx-auto w-full  sm:w-2/3 md:w-1/2 lg:w-1/3">
        <h1 className="relative z-20 bg-white text-4xl font-bold mb-16 p-2 text-black flex items-center justify-center py-4 px-12 uppercase border-black border-2">
          {t('features')}
        </h1>
        <div className="absolute z-10 top-[15px] left-[12px] w-[98%] h-[50%] bg-[#F700C6] lg:block hidden transition-colors"></div>
      </div>
      
      {/* <AnnotationForm/> */}
      <div className="z-10">
        <PdfUpload onUploadSuccess={handleUploadSuccess} />

        {/* <PdfTextDisplay pdfTexts={pdfTexts} onDelete={deletePdfText} /> */}
        <div className="relative flex mb-10 justify-center items-center m-auto  group z-20 p-1 ">
          <Link
            to="/select"
            className="relative z-10 bg-white text-black py-4 px-12 uppercase border-black border-2 flex items-center"
          >
            {t('continue')} <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </Link>
          </div>
      </div>

      <Footer />
    </section>
  );
}

export default FeaturesPage;
