import Head from "next/head";
import { FaRocket, FaBrain, FaEye, FaBolt } from "react-icons/fa";

export default function Home() {
  return (
    <>
      <Head>
        <title>Task Tracker | Unleash Your Workflow</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="bg-black text-white min-h-screen font-inter overflow-hidden">
        {/* Hero Section with Transparent Overlay */}
        <header className="relative h-screen flex items-center justify-center bg-gradient-to-r from-purple-900 to-blue-900">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              background: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 200\"%3E%3Cpath fill=\"none\" stroke=\"%23FFFFFF30\" stroke-width=\"1\" d=\"M40 40h120M40 80h120M40 120h120M40 160h120M40 40v120M80 40v120M120 40v120M160 40v120\"/%3E%3C/svg%3E') repeat",
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 text-center">
            <h1 className="text-6xl md:text-8xl font-orbitron animate-gradient-text">
              Task Tracker
            </h1>
            <p className="text-xl md:text-3xl mt-6 max-w-2xl mx-auto animate-fade-in">
              Amplify your productivity with a planner that’s light-years ahead.
            </p>
            <a href="./login" className="mt-10 inline-block">
              <button className="px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300">
                Ignite Your Flow
              </button>
            </a>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
        </header>

        {/* Core Concept Section with Transparent Wave */}
        <section className="relative py-24 px-6">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 1440 320" fill="none">
              <path
                d="M0 160C240 80 480 240 720 160C960 80 1200 240 1440 160"
                stroke="cyan"
                strokeWidth="4"
                className="animate-wave"
              />
            </svg>
          </div>
          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-orbitron text-cyan-300 mb-8 animate-fade-in">
              Beyond the Basics
            </h2>
            <p className="text-lg md:text-xl text-gray-300 backdrop-blur-sm bg-white/5 p-6 rounded-lg">
              Forget rigid tools. Nexlify bends time and tasks into a seamless, electrifying experience.
            </p>
          </div>
        </section>

        {/* Dynamic Strengths Section */}
        <section className="py-24 px-6 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              {/* Left: Stacked Strength Cards */}
              <div className="space-y-8 md:w-1/2">
                <div className="backdrop-blur-lg bg-white/10 p-6 rounded-xl flex items-center space-x-4 hover:bg-white/20 transition-all duration-300 animate-slide-in">
                  <FaRocket className="text-blue-400 text-4xl" />
                  <div>
                    <h3 className="text-xl font-orbitron text-white">Hyper Speed</h3>
                    <p className="text-gray-300">Plan fast, act faster.</p>
                  </div>
                </div>
                <div className="backdrop-blur-lg bg-purple-900/20 p-6 rounded-xl flex items-center space-x-4 hover:bg-purple-900/30 transition-all duration-300 animate-slide-in" style={{ animationDelay: "0.2s" }}>
                  <FaBrain className="text-purple-400 text-4xl" />
                  <div>
                    <h3 className="text-xl font-orbitron text-white">Smart Sync</h3>
                    <p className="text-gray-300">Your mind, our magic.</p>
                  </div>
                </div>
              </div>
              {/* Right: Floating Orb with Text */}
              <div className="md:w-1/2 text-center animate-float">
                <div className="relative w-64 h-64 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-20 animate-spin-slow" />
                  <div className="absolute inset-4 rounded-full backdrop-blur-md bg-white/10 flex items-center justify-center">
                    <p className="text-lg font-orbitron text-cyan-300">
                      Flow Without Limits
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-orbitron text-white mb-6 animate-fade-in">
              Ready to Transcend?
            </h2>
            <p className="text-lg text-gray-400 mb-10">
              Leave the old ways behind. Step into a workflow that’s alive.
            </p>
            <a href="./login">
              <button className="px-10 py-4 bg-transparent border-2 border-cyan-300 text-cyan-300 rounded-full backdrop-blur-md bg-white/5 hover:bg-cyan-300 hover:text-black transition-all duration-500">
                Join the Future
              </button>
            </a>
          </div>
        </section>

        {/* Inline Styles */}
        <style>{`
          @keyframes gradientText {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
          @keyframes spinSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes wave {
            0% { d: path("M0 160C240 80 480 240 720 160C960 80 1200 240 1440 160"); }
            50% { d: path("M0 160C240 240 480 80 720 160C960 240 1200 80 1440 160"); }
            100% { d: path("M0 160C240 80 480 240 720 160C960 80 1200 240 1440 160"); }
          }
          .animate-gradient-text {
            background: linear-gradient(90deg, #00FFFF, #FF00FF, #00FFFF);
            background-size: 200% 200%;
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            animation: gradientText 6s ease infinite;
          }
          .animate-fade-in {
            animation: fadeIn 1s ease-out forwards;
            opacity: 0;
          }
          .animate-slide-in {
            animation: slideIn 0.8s ease-out forwards;
            opacity: 0;
          }
          .animate-float {
            animation: float 5s infinite ease-in-out;
          }
          .animate-spin-slow {
            animation: spinSlow 30s linear infinite;
          }
          .animate-wave {
            animation: wave 8s infinite ease-in-out;
          }
          .font-orbitron {
            font-family: 'Orbitron', sans-serif;
          }
          .font-inter {
            font-family: 'Inter', sans-serif;
          }
        `}</style>
      </div>
    </>
  );
}