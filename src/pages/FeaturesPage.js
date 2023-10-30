import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AnnotationForm from "../components/annotation/AnnotationForm";
import PdfUpload from "../components/annotation/PdfUpload";
import FileUploader from "../components/annotation/FileUploader";
import PdfTextDisplay from "../components/annotation/PdfTextDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
function FeaturesPage() {
  const [pdfTexts, setPdfTexts] = useState([]);

  const fetchPdfTexts = async () => {
    try {
      const res = await axios.get("/pdf_texts");
      setPdfTexts(res.data);
    } catch (error) {
      console.error("Failed to fetch PDF texts:", error);
    }
  };

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const particlesInit = async (main) => {
    console.log(main);

    // you can initialize the tsParticles instance (main) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(main);
  };
  return (
    <section className="bg-gray-800 relative z-10 font-base text-white">
      <Particles
      id="tsparticles"
      init={particlesInit}

      options={{
        "fullScreen": {
            "enable": true,
            "zIndex": -1
        },
        "fpsLimit": 120,
        "particles": {
            "number": {
                "value": 10,
                "density": {
                    "enable": false,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#fff"
            },
            "shape": {
                "type": "star",
                "options": {
                    "sides": 5
                }
            },
            "opacity": {
                "value": 0.8,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 10,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "rotate": {
                "value": 0,
                "random": true,
                "direction": "clockwise",
                "animation": {
                    "enable": true,
                    "speed": 5,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 600,
                "color": "black",
                "opacity": 0.4,
                "width": 2
            },
            "move": {
                "enable": true,
                "speed": 1,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": ["repulse"]
                },
              
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 400,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true,
  
    }}
    />
      <Header className="z-20 relative group" />
      {/* Heading */}
      <div className="relative group p-1 mt-10 mx-auto w-full sm:w-2/3 md:w-1/2 lg:w-1/3">
        <h1 className="relative z-20 bg-white text-4xl font-bold mb-16 p-2 text-black flex items-center justify-center py-4 px-12 uppercase border-black border-2">
          FEATURES PAGE
        </h1>
        <div className="absolute z-10 top-[15px] left-[12px] w-[98%] h-[50%] bg-[#F700C6] lg:block hidden transition-colors"></div>
      </div>
      {/* Search Bar */}
      <div className="relative group z-10 p-1 mx-auto w-full sm:w-2/3 md:w-1/2 lg:w-1/3 ">
        <div className="relative z-20 flex w-full items-center bg-white border-2 border-black">
         <FontAwesomeIcon className="ml-5 text-black" icon={faSearch}/>
          <input
            type="text"
            placeholder="Search through your imports or annotations"
            className="flex-grow p-2 placeholder-gray-500 outline-none"
          />
        </div>
        <div className="absolute top-[10px] z-10 left-[12px] w-[98%] h-[90%] bg-[#F700C6] lg:block hidden transition-colors"></div>
      </div>
    
      {/* <AnnotationForm/> */}
      <div className="z-10">
        <PdfUpload onUploadSuccess={handleUploadSuccess} />

        <PdfTextDisplay pdfTexts={pdfTexts} onDelete={deletePdfText} />
      </div>
      <Footer />
    </section>
  );
}

export default FeaturesPage;
