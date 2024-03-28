import React, { useState, useEffect } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

import PdfTextDisplay from "../components/annotation/PdfTextDisplay";
import axios from "axios";
import Sidebar from "../components/annotation/Sidebar";
import { useParams } from "react-router-dom";

const Annotator = () => {
  const [pdfTexts, setPdfTexts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { fileId } = useParams(); 
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchTexts = async () => {
      setLoading(true);
      try {
        let url = "http://localhost:5000/pdf_texts";
        if (fileId) {
          url += `/${fileId}`; // Fetch specific file if fileId is present
        }
        const response = await axios.get(url);
        setPdfTexts(fileId ? [response.data] : response.data);
      } catch (error) {
        console.error("Error fetching texts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTexts();
  }, [fileId]);




  

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-grow bg-black">
        <div className="flex flex-row">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}  />
          <div className="flex flex-col w-full p-4">
            {/* Container for PDF Text Display */}
            <div className="flex-1 bg-white shadow-lg rounded-lg p-4">
              <PdfTextDisplay pdfTexts={pdfTexts}  />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Annotator;