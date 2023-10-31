import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/layout/Header";
import Hero from "./components/layout/Hero";
import Features from "./components/layout/Features";
import Works from "./components/layout/Works";
import Footer from "./components/layout/Footer";
import AnnotationForm from "./components/annotation/AnnotationForm";
import PdfUpload from "./components/annotation/PdfUpload";
import HomePage from "./pages/HomePage";
import FeaturesPage from "./pages/FeaturesPage";
import AOS from 'aos';
import 'aos/dist/aos.css';
import Annotator from "./pages/Annotator";


AOS.init({
  duration: 1200,  // Délka animace v milisekundách
  // Můžete přidat další možnosti zde
});

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />}  />
        <Route path="/annotator" element={<Annotator />}  />
      </Routes>
    </Router>
  );
}

export default App;
