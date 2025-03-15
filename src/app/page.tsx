"use client";
import Head from "next/head";
import { useState, useEffect } from "react";
import { FaList, FaPen, FaEye, FaCheckSquare } from "react-icons/fa";

export default function Home() {
  const [activePhoto, setActivePhoto] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  // Placeholder image paths - replace with your actual screenshot paths
  const photos = [
    "ss-1.png",
    "ss-2.png",
    "ss-3.png",
  ];

  // Auto-move slideshow every 3 seconds unless paused
  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setActivePhoto((prev) => (prev + 1) % photos.length);
      }, 3000); // 3 seconds
      return () => clearInterval(timer); // Cleanup on unmount or pause
    }
  }, [isPaused, photos.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "ArrowRight") {
        setActivePhoto((prev) => (prev + 1) % photos.length);
        setIsPaused(true); // Pause on manual interaction
      } else if (e.key === "ArrowLeft") {
        setActivePhoto((prev) => (prev - 1 + photos.length) % photos.length);
        setIsPaused(true); // Pause on manual interaction
      } else if (isExpanded && e.key === "Escape") {
        setIsExpanded(false); // Close expanded view with Escape
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, photos.length]);

  // Handle image click to expand
  const handleImageClick = () => {
    setIsExpanded(true);
    setIsPaused(true); // Pause on expand
  };

  // Handle click on expanded image for navigation
  const handleExpandedClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const halfWidth = rect.width / 2;

    if (clickX < halfWidth) {
      // Left side: Previous image
      setActivePhoto((prev) => (prev - 1 + photos.length) % photos.length);
      setIsPaused(true);
    } else {
      // Right side: Next image
      setActivePhoto((prev) => (prev + 1) % photos.length);
      setIsPaused(true);
    }
  };


  // Close expanded view
  const handleCloseExpanded = () => {
    setIsExpanded(false);
    setIsPaused(false); // Resume slideshow
  };

  return (
    <>
      <Head>
        <title>Task Tracker | Simple Task Management</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="bg-blue-50 min-h-screen font-inter text-gray-900 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #60A5FA 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden="true"
        />

        {/* Hero Section */}
        <header className="py-28 px-6 text-center bg-white/80 backdrop-blur-sm relative z-10">
          <div className="absolute top-0 left-1/2 w-24 h-1 bg-blue-200 transform -translate-x-1/2" />
          <h1 className="text-5xl md:text-6xl font-bold text-blue-600 animate-fade-in">
            Task Tracker
          </h1>
          <p className="text-xl md:text-2xl mt-4 text-gray-700 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Effortless task management, beautifully simple.
          </p>
          <a href="./login" className="mt-10 inline-block animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <button className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300">
              🧱 Build together
            </button>
          </a>
          {/* Enhanced Photo Gallery */}
          <div className="mt-12 max-w-md mx-auto animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div
              className="bg-white/70 backdrop-blur-md p-4 rounded-lg shadow-sm"
              onMouseEnter={() => setIsPaused(true)} // Pause on hover
              onMouseLeave={() => !isExpanded && setIsPaused(false)} // Resume if not expanded
            >
              <img
                src={photos[activePhoto]}
                alt={`Task Tracker Screenshot ${activePhoto + 1}`}
                className="w-full h-48 object-cover rounded-md cursor-pointer hover:opacity-90 transition-all duration-300"
                onClick={handleImageClick} // Click to expand
              />
              <div className="flex justify-center space-x-2 mt-2">
                {photos.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${activePhoto === index ? "bg-blue-500" : "bg-blue-200"
                      }`}
                  />
                ))}
              </div>
              <p className="text-gray-600 text-sm mt-2">
                Demo. Click to expand.
              </p>
            </div>
          </div>
        </header>

        {/* Expanded Image Overlay */}
        {isExpanded && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={handleCloseExpanded} // Click outside to close
          >
            <div className="relative max-w-[90%] max-h-[90%]">
              <img
                src={photos[activePhoto]}
                alt={`Task Tracker Screenshot ${activePhoto + 1} Expanded`}
                className="w-full h-full object-contain rounded-lg shadow-lg cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent closing when clicking image
                  handleExpandedClick(e); // Navigate with left/right clicks
                }}
              />
              {/* Left/Right Click Indicators */}
              <div className="absolute inset-0 flex justify-between pointer-events-none">
                <div className="w-1/2 h-full bg-transparent hover:bg-gray-200/20 transition-all duration-300" />
                <div className="w-1/2 h-full bg-transparent hover:bg-gray-200/20 transition-all duration-300" />
              </div>
            </div>
          </div>
        )}

        {/* Purpose Section */}
        <section className="py-16 px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-blue-600 mb-6 animate-slide-in relative">
              <span className="absolute -left-8 top-1/2 w-6 h-0.5 bg-blue-200 transform -translate-y-1/2" />
              Clear & Calm
              <span className="absolute -right-8 top-1/2 w-6 h-0.5 bg-blue-200 transform -translate-y-1/2" />
            </h2>
            <p className="text-lg text-gray-600 bg-white/50 backdrop-blur-sm p-4 rounded-lg animate-slide-in" style={{ animationDelay: "0.2s" }}>
              Track tasks without the mess—clean design, pure focus.
            </p>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-20 px-6 bg-blue-50 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-10">
              {/* Right: Transparent Highlight Card */}
              <div className="md:w-1/3 bg-white/70 backdrop-blur-md p-6 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in relative">
                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-300 rounded-full" />
                <FaList className="text-blue-500 text-3xl mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">Track with Ease</h3>
                <p className="text-gray-600 text-center">
                  Add and manage tasks in moments.
                </p>
              </div>
              {/* Left: Stacked Benefits */}
              <div className="md:w-2/3 space-y-8">
                <div className="flex items-center space-x-4 animate-slide-in" style={{ animationDelay: "0.2s" }}>
                  <FaPen className="text-blue-400 text-2xl flex-shrink-0" />
                  <p className="text-gray-700 relative">
                    Capture tasks without complexity.
                    <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-blue-200/50" />
                  </p>
                </div>
                <div className="flex items-center space-x-4 animate-slide-in" style={{ animationDelay: "0.4s" }}>
                  <FaEye className="text-blue-400 text-2xl flex-shrink-0" />
                  <p className="text-gray-700 relative">
                    View your day with crystal clarity.
                    <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-blue-200/50" />
                  </p>
                </div>
                <div className="flex items-center space-x-4 animate-slide-in" style={{ animationDelay: "0.6s" }}>
                  <FaCheckSquare className="text-blue-400 text-2xl flex-shrink-0" />
                  <p className="text-gray-700 relative">
                    Complete tasks with a single click.
                    <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-blue-200/50" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Closing Section */}
        <section className="py-20 px-6 text-center bg-white/60 backdrop-blur-sm relative z-10">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold text-blue-600 mb-6 animate-fade-in">
              Simplify Your Tasks
            </h2>
            <p className="text-lg text-gray-600 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Task Tracker keeps it light and easy. Start now.
            </p>
            <a href="./login">
              <button className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                Try It Now
              </button>
            </a>
          </div>
          <div className="absolute bottom-0 left-1/2 w-24 h-1 bg-blue-200 transform -translate-x-1/2" />
        </section>

        {/* Inline Styles */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-15px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
            opacity: 0;
          }
          .animate-slide-in {
            animation: slideIn 0.8s ease-out forwards;
            opacity: 0;
          }
          .font-inter {
            font-family: 'Inter', sans-serif;
          }
        `}</style>
      </div>
    </>
  );
}