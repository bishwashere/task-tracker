"use client";
import Head from "next/head";
import { useState, useEffect } from "react";
import { FaList, FaPen, FaEye, FaCheckSquare, FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function Home() {
  const [activePhoto, setActivePhoto] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const photos = ["ss-1.png", "ss-2.png", "ss-3.png"];

  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setActivePhoto((prev) => (prev + 1) % photos.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [isPaused, photos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "ArrowRight") {
        setActivePhoto((prev) => (prev + 1) % photos.length);
        setIsPaused(true);
      } else if (e.key === "ArrowLeft") {
        setActivePhoto((prev) => (prev - 1 + photos.length) % photos.length);
        setIsPaused(true);
      } else if (isExpanded && e.key === "Escape") {
        setIsExpanded(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, photos.length]);

  const handleImageClick = () => {
    setIsExpanded(true);
    setIsPaused(true);
  };

  const handleExpandedClick = (direction: "left" | "right") => {
    if (direction === "left") {
      setActivePhoto((prev) => (prev - 1 + photos.length) % photos.length);
    } else {
      setActivePhoto((prev) => (prev + 1) % photos.length);
    }
    setIsPaused(true);
  };

  const handleCloseExpanded = () => {
    setIsExpanded(false);
    setIsPaused(false);
  };

  return (
    <>
      <Head>
        <title>Azent.io | Streamlined Task Mastery</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="bg-gray-50 min-h-screen font-inter text-gray-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #10B981 1px, transparent 1px)",
            backgroundSize: "25px 25px",
          }}
          aria-hidden="true"
        />

        <header className="py-28 px-6 text-center bg-white/90 backdrop-blur-sm relative z-10">
          <div className="absolute top-0 left-1/2 w-20 h-1 bg-emerald-200 transform -translate-x-1/2" />
          <h1 className="text-5xl md:text-6xl font-bold text-emerald-600 animate-fade-in">
            Azent.io
          </h1>
          <p className="text-xl md:text-2xl mt-4 text-gray-700 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Master your tasks with elegant simplicity.
          </p>
          <a href="./login" className="mt-10 inline-block animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <button className="px-8 py-3 bg-emerald-500 text-white font-semibold rounded-full hover:bg-emerald-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300">
              🚀 Get Started
            </button>
          </a>
          <div className="mt-12 max-w-md mx-auto animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div
              className="bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-md"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => !isExpanded && setIsPaused(false)}
            >
              <img
                src={photos[activePhoto]}
                alt={`Azent.io Screenshot ${activePhoto + 1}`}
                className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-95 transition-all duration-300"
                onClick={handleImageClick}
              />
              <div className="flex justify-center space-x-2 mt-2">
                {photos.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${activePhoto === index ? "bg-emerald-500" : "bg-emerald-200"}`}
                  />
                ))}
              </div>
              <p className="text-gray-600 text-sm mt-2">
                Preview. Click to explore.
              </p>
            </div>
          </div>
        </header>

        {/* Expanded Image Overlay with Arrows */}
        {isExpanded && (
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={handleCloseExpanded}
          >
            <div className="relative max-w-[90%] max-h-[90%] flex items-center justify-center">
              <img
                src={photos[activePhoto]}
                alt={`Azent.io Screenshot ${activePhoto + 1} Expanded`}
                className="w-full h-full object-contain rounded-xl shadow-xl"
              />
              {/* Left Arrow */}
              <div
                className="absolute left-0 top-0 h-full w-1/2 flex items-center justify-start opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExpandedClick("left");
                }}
              >
                <FaArrowLeft className="text-white text-4xl ml-4 drop-shadow-md" />
              </div>
              {/* Right Arrow */}
              <div
                className="absolute right-0 top-0 h-full w-1/2 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExpandedClick("right");
                }}
              >
                <FaArrowRight className="text-white text-4xl mr-4 drop-shadow-md" />
              </div>
            </div>
          </div>
        )}

        <section className="py-16 px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-emerald-600 mb-6 animate-slide-in relative">
              <span className="absolute -left-8 top-1/2 w-6 h-0.5 bg-emerald-200 transform -translate-y-1/2" />
              Sharp & Serene
              <span className="absolute -right-8 top-1/2 w-6 h-0.5 bg-emerald-200 transform -translate-y-1/2" />
            </h2>
            <p className="text-lg text-gray-600 bg-white/60 backdrop-blur-sm p-4 rounded-xl animate-slide-in" style={{ animationDelay: "0.2s" }}>
              Organize tasks with precision and peace.
            </p>
          </div>
        </section>

        <section className="py-20 px-6 bg-gray-50 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-12">
              <div className="md:w-1/3 bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in relative">
                <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-300 rounded-full" />
                <FaList className="text-emerald-500 text-3xl mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">Seamless Tracking</h3>
                <p className="text-gray-600 text-center">
                  Manage tasks effortlessly in seconds.
                </p>
              </div>
              <div className="md:w-2/3 space-y-8">
                <div className="flex items-center space-x-4 animate-slide-in" style={{ animationDelay: "0.2s" }}>
                  <FaPen className="text-emerald-400 text-2xl flex-shrink-0" />
                  <p className="text-gray-700 relative">
                    Jot down tasks without the clutter.
                    <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-emerald-200/50" />
                  </p>
                </div>
                <div className="flex items-center space-x-4 animate-slide-in" style={{ animationDelay: "0.4s" }}>
                  <FaEye className="text-emerald-400 text-2xl flex-shrink-0" />
                  <p className="text-gray-700 relative">
                    See your priorities at a glance.
                    <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-emerald-200/50" />
                  </p>
                </div>
                <div className="flex items-center space-x-4 animate-slide-in" style={{ animationDelay: "0.6s" }}>
                  <FaCheckSquare className="text-emerald-400 text-2xl flex-shrink-0" />
                  <p className="text-gray-700 relative">
                    Mark tasks done with ease.
                    <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-emerald-200/50" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 text-center bg-white/70 backdrop-blur-sm relative z-10">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold text-emerald-600 mb-6 animate-fade-in">
              Elevate Your Workflow
            </h2>
            <p className="text-lg text-gray-600 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Azent.io brings clarity to your day. Begin today.
            </p>
            <a href="./login">
              <button className="px-8 py-3 bg-emerald-500 text-white font-semibold rounded-full hover:bg-emerald-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                Start Now
              </button>
            </a>
          </div>
          <div className="absolute bottom-0 left-1/2 w-20 h-1 bg-emerald-200 transform -translate-x-1/2" />
        </section>

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