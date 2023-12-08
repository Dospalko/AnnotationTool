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
    AOS.init({ duration: 1200, once: true });
  }, []);

  return (
    <div className="font-base bg-cover bg-black bg-left bg-repeat-x" style={{ backgroundImage: `url('/bgfg.svg')` }}>
      <Header />
      <div className="flex flex-row mt-0 justify-center items-center">
      {/* #  <Heading /> */}
        <div className="grid grid-flow-row auto-rows-max w-[50%] gap-12 p-8">
          <Card1 />
          <Card2 />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Chooser;
