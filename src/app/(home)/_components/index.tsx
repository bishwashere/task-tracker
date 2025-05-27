"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  FaList,
  FaPen,
  FaEye,
  FaCheckSquare,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

export default function Home() {
  // const [activePhoto, setActivePhoto] = useState(0);
  // const [isPaused, setIsPaused] = useState(false);
  // const [isExpanded, setIsExpanded] = useState(false);
  // const photos = ["ss-1.png", "ss-2.png", "ss-3.png"];

  // useEffect(() => {
  //   if (!isPaused) {
  //     const timer = setInterval(() => {
  //       setActivePhoto((prev) => (prev + 1) % photos.length);
  //     }, 3000);
  //     return () => clearInterval(timer);
  //   }
  // }, [isPaused, photos.length]);

  // useEffect(() => {
  //   const handleKeyDown = (e: KeyboardEvent): void => {
  //     if (e.key === "ArrowRight") {
  //       setActivePhoto((prev) => (prev + 1) % photos.length);
  //       setIsPaused(true);
  //     } else if (e.key === "ArrowLeft") {
  //       setActivePhoto((prev) => (prev - 1 + photos.length) % photos.length);
  //       setIsPaused(true);
  //     } else if (isExpanded && e.key === "Escape") {
  //       setIsExpanded(false);
  //     }
  //   };

  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => window.removeEventListener("keydown", handleKeyDown);
  // }, [isExpanded, photos.length]);

  // const handleImageClick = () => {
  //   setIsExpanded(true);
  //   setIsPaused(true);
  // };

  // const handleExpandedClick = (direction: "left" | "right") => {
  //   if (direction === "left") {
  //     setActivePhoto((prev) => (prev - 1 + photos.length) % photos.length);
  //   } else {
  //     setActivePhoto((prev) => (prev + 1) % photos.length);
  //   }
  //   setIsPaused(true);
  // };

  // const handleCloseExpandedlots = () => {
  //   setIsExpanded(false);
  //   setIsPaused(false);
  // };

  return (
    <>
      <div className="bg-gray-50 min-h-screen font-inter text-gray-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #10B981 1px, transparent 1px)",
            backgroundSize: "25px 25px",
          }}
          aria-hidden="true"
        />

        {/* Revised Hero Section with Added Text */}
        <header className="py-20 px-6 text-center bg-white/90 backdrop-blur-sm relative z-10">
          <div className="absolute top-0 left-1/2 w-20 h-1 bg-emerald-200 transform -translate-x-1/2" />
          <div className="flex flex-col items-center justify-center gap-4">
            <Image src="/logo.png" width="90" height="90" alt="Logo" />
            <h1 className="text-5xl md:text-6xl font-bold text-emerald-600 animate-fade-in">
              Azent.io
            </h1>
          </div>
          <p
            className="text-xl md:text-2xl mt-4 text-gray-700 max-w-xl mx-auto animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Task Tracking with ease and clarity.
          </p>
          <p
            className="text-md text-gray-600 mt-2 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            Master your day in 60 seconds or less.
          </p>
          <a
            href="./login"
            className="mt-10 inline-block animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <button className="px-8 py-3 bg-emerald-500 text-white font-semibold rounded-full hover:bg-emerald-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300">
              🚀 Try Azent.io Free
            </button>
          </a>
          <p
            className="text-sm text-gray-500 mt-4 animate-fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            (7-day free trial. No Stripe info needed upfront.)
          </p>
          <div
            className="mt-12 w-full lg:max-w-4xl mx-auto animate-fade-in"
            style={{ animationDelay: "0.6s" }}
          >
              <iframe
                src="https://drive.google.com/file/d/1VBNiIiKyKx_4o4u1xKHBrAROhfdIfnKu/preview"
                allow="autoplay"
                className="rounded-2xl mx-auto w-full h-[300px] md:h-[600px]"
              />
            {/* <div
              className="bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-md"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => !isExpanded && setIsPaused(false)}
            >
              <Image
                src={`/${photos[activePhoto]}`}
                width={1920}
                height={880}
                alt={`Azent.io Screenshot ${activePhoto + 1}`}
                className="w-full h-48 lg:h-[36rem] object-cover rounded-lg cursor-pointer hover:opacity-95 transition-all duration-300"
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
            </div> */}
          </div>
        </header>

        {/* Expanded Image Overlay with Arrows */}
        {/* {isExpanded && (
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={handleCloseExpandedlots}
          >
            <div className="relative max-w-[90%] max-h-[90%] flex items-center justify-center">
              <Image
                src={`/${photos[activePhoto]}`}
                width={1920}
                height={880}
                alt={`Azent.io Screenshot ${activePhoto + 1} Expanded`}
                className="w-full h-full object-contain rounded-xl shadow-xl"
              />
              <div
                className="absolute left-0 top-0 h-full w-1/2 flex items-center justify-start opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExpandedClick("left");
                }}
              >
                <FaArrowLeft className="text-black text-4xl ml-4 drop-shadow-md" />
              </div>
              <div
                className="absolute right-0 top-0 h-full w-1/2 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExpandedClick("right");
                }}
              >
                <FaArrowRight className="text-black text-4xl mr-4 drop-shadow-md" />
              </div>
            </div>
          </div>
        )} */}

        {/* Revised Features Section */}
        <section className="py-20 px-6 bg-gray-50 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-emerald-600 mb-6 animate-fade-in">
              Why Choose Azent.io?
            </h2>
            <p
              className="text-lg text-gray-600 mb-12 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Streamline your workflow with tools designed for clarity and ease.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div
                className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <FaPen className="text-emerald-500 text-3xl mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Capture Tasks Instantly
                </h3>
                <p className="text-gray-600">
                  Jot down ideas without the clutter.
                </p>
              </div>
              <div
                className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                <FaEye className="text-emerald-500 text-3xl mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Focus on Priorities
                </h3>
                <p className="text-gray-600">See what matters at a glance.</p>
              </div>
              <div
                className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: "0.6s" }}
              >
                <FaCheckSquare className="text-emerald-500 text-3xl mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Finish with Ease
                </h3>
                <p className="text-gray-600">Mark tasks done in one click.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Optional Testimonials Section - Uncomment to Use */}

        <section className="py-20 px-6 text-center bg-white/70 backdrop-blur-sm relative z-10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold text-emerald-600 mb-12 animate-fade-in">
              What Our Users Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Sara Michaels",
                  title: "Product Manager",
                  image: "/avatars/avatar1.jpg",
                  quote:
                    "Azent.io transformed the way I handle my daily workflow. It's fast, beautiful, and makes my life easier.",
                },
                {
                  name: "David Kim",
                  title: "Startup Founder",
                  image: "/avatars/avatar2.jpg",
                  quote:
                    "I tried many task tools, but nothing clicked until Azent.io. Simple, clean, and super effective!",
                },
                {
                  name: "Emily Rodriguez",
                  title: "UX Designer",
                  image: "/avatars/avatar3.jpg",
                  quote:
                    "The UI is fantastic! I love how intuitive and snappy everything feels. Huge productivity boost.",
                },
              ].map((testimonial, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${0.2 + i * 0.2}s` }}
                >
                  <p className="text-gray-600 italic">“{testimonial.quote}”</p>
                  <div className="text-center mt-5">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500">{testimonial.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* Revised Final Call-to-Action */}
        <section className="py-20 px-6 text-center bg-white/70 backdrop-blur-sm relative z-10">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold text-emerald-600 mb-6 animate-fade-in">
              Take Control Today
            </h2>
            <p
              className="text-lg text-gray-600 mb-8 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Start now and simplify your tasks with Azent.io’s elegant design.
            </p>
            <div
              className="flex justify-center gap-4 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <a href="./login">
                <button className="px-8 py-3 bg-emerald-500 text-white font-semibold rounded-full hover:bg-emerald-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300">
                  Get Started Free
                </button>
              </a>
              <a href="./features">
                <button className="px-8 py-3 bg-transparent text-emerald-600 font-semibold rounded-full border border-emerald-500 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300">
                  Learn More
                </button>
              </a>
            </div>
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