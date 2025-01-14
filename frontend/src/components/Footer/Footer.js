function Footer() {
    return (
      <footer className="bg-black font-base text-white py-4">
        {/* Container */}
        <div className="container mx-auto flex items-center justify-between px-4">
  
          {/* Logo/Name */}
          <div className="">
            <h1 className="text-2xl font-bold">Annotation Web Tool</h1>
          </div>
          {/* Copyright */}
          <div>
            <p className="text-sm">&copy; {new Date().getFullYear()} Annotation Web Tool. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  }
  
  export default Footer;
  