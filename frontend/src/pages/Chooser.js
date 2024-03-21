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
    <section>  <Header />
    <div className="font-base bg-cover h-screen bg-black bg-left bg-repeat-x" style={{ backgroundImage: `url('/bgfg.svg')` }}>
    
      <div className="flex flex-row my-auto m-auto justify-center items-center">
      {/* #  <Heading /> */}
        <div className=" grid-flow-row hidden md:grid auto-rows-max w-max  xl:w-[50%] gap-12 p-8">
          <Card1 />
          <Card2 />
        </div>
      </div>
    
    </div>
      <Footer />
      </section>
  );
};

export default Chooser;
