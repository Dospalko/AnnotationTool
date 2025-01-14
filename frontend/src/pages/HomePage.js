import React from "react";
import Header from "../components/Header/Header";
import Hero from "../components/HomePage/Hero";
import Features from "../components/HomePage/Features";
import Works from "../components/HomePage/Works";
import Footer from "../components/Footer/Footer";
import CreateProject from "./CreateProject";
import AssignFilesToProject from "../components/AssignFilesToProject";

const HomePage = () => {
  return (
    <section>
      <Header />
      <Hero />
      <Features />
      <Works />
      <Footer />
    </section>
  );
};

export default HomePage;
