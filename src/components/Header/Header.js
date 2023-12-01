import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi"; // Import icons from react-icons
import { Link } from "react-router-dom";

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="font-base bg-slate-950  text-white py-4  px-6">
      
      <nav className="flex lg:flex-row text-2xl uppercase leading-6 flex-col shadow-2xl w-full">
        <div className="flex items-center justify-between w-full lg:w-full lg:justify-between">
          <span className="bg-white px-2"><h1 className="text-2xl  w-full font-semibold text-transparent bg-gradient-to-r bg-clip-text from-blue-500 to-purple-500 ">
          Annotator
        </h1></span>
        
      <div className="flex w-full items-end justify-end lg:justify-center">
        </div>
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white flex items-center focus:outline-none"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <FiX className="text-2xl animate-pulse" />
            ) : (
              <FiMenu className="text-2xl animate-pulse" />
            )}
          </button>
       </div>
        {/* Mobile Menu */}
        <div className="flex md:w-[50%] w-full  md:m-auto sm:m-0">
            <ul
          className={`${
            isMobileMenuOpen ? "h-auto" : "hidden"
          } overflow-hidden w-full lg:p-0 lg:m-0 lg:justify-end md:justify-center    lg:divide-none divide-y  p-4 py-2 my-4 border-2 lg:border-none  lg:h-auto lg:flex  left-0 lg:gap-4 lg:ml-4 transition-all ease-in-out duration-300`}
        >
      
          <li>
            <Link
              to="/features"
              className="text-white py-1  hover:text-[#53F541]  transition duration-300 block lg:inline-block"
            >
              GET STARTED
            </Link>
          </li>
          <li>
            <a
              href="/contact"
              className="text-black bg-white p-2 hover:text-[#53F541]     py-1 transition duration-300 block lg:inline-block"
            >
              Login
            </a>
          </li>
        </ul>
         </div>
      </nav>
    </header>
  );
}

export default Header;
