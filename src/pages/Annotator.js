import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AnnotationForm from "../components/annotation/AnnotationForm";
import PdfTextDisplay from "../components/annotation/PdfTextDisplay";
import axios from "axios";

const Annotator = () => {

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
 
  useEffect(() => {
    fetchPdfTexts();
  }, []);
  
  return (
    <div>
      <Header />
      <AnnotationForm />
      <PdfTextDisplay pdfTexts={pdfTexts} onDelete={deletePdfText} />

      <Footer />
    </div>
  );
};

export default Annotator;
