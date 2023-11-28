import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import FeaturesPage from "./pages/FeaturesPage";
import AOS from 'aos';
import 'aos/dist/aos.css';
import Annotator from "./pages/Annotator";
import Chooser from "./pages/Chooser";
import LayoutLM from "./pages/LayoutLM";


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
        <Route path="/select" element={<Chooser />}  />
        <Route path="/layoutlm-annotation" element={<LayoutLM />}  />
      </Routes>
    </Router>
  );
}

export default App;
