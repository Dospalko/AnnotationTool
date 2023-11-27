import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import AOS from 'aos';
import 'aos/dist/aos.css';
import Card1 from "../components/layout/ChooserComponents/Card1";
import Card2 from "../components/layout/ChooserComponents/Card2";
import Heading from "../components/layout/ChooserComponents/Heading";
const Chooser = () => {

  React.useEffect(() => {
    AOS.init({
      duration: 1200, // Customize as needed
      once: true,
    });
  }, []);
  return (
    <div className="font-base">
      <Header />
      <div className="flex flex-col mt-0 justify-center items-center h-screen bg-gray-900">
        <Heading/>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-8">
        <Card1 />
        <Card2 />
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default Chooser;
