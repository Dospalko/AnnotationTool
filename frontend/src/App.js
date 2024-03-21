import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import HomePage from "./pages/HomePage";
import FeaturesPage from "./pages/FeaturesPage";
import Annotator from "./pages/Annotator";
import Chooser from "./pages/Chooser";
import LayoutLM from "./pages/LayoutLM";
import AOS from 'aos';
import 'aos/dist/aos.css';
import FilesOverviewPage from "./pages/FilesOverviewPage";

AOS.init({
  duration: 1200,
});

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PageLoader><HomePage /></PageLoader>} />
        <Route path="/features" element={<PageLoader><FeaturesPage /></PageLoader>} />
        <Route path="/annotator" element={<PageLoader><Annotator /></PageLoader>} />
        <Route path="/select" element={<PageLoader><Chooser /></PageLoader>} />
        <Route path="/layoutlm-annotation" element={<PageLoader><LayoutLM /></PageLoader>} />
        <Route path="/files" element={<PageLoader><FilesOverviewPage /></PageLoader>} />
      </Routes>
    </Router>
  );
};

const PageLoader = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Trigger loading effect on location change
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000); // Simulate loading for 2 seconds
    return () => clearTimeout(timer);
  }, [location]); // Dependency on location

  return loading ? (
    <div className="flex flex-col bg-black  justify-center items-center h-screen">
        <img src="/annotatorlog.jpg" alt="img" className="w-32 h-32 animate-bounce mx-4 object-cover rounded-full" />
        <h1 className="text-white text-3xl   p-4 mt-10 font-base">ANNOTATOR</h1>
    
    </div>
  ) : (
    children
  );
};

export default App;
