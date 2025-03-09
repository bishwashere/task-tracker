import Head from "next/head";
import { FaList, FaPen, FaEye, FaCheckSquare } from "react-icons/fa";

export default function Home() {
  return (
    <>
      <Head>
        <title>Task Tracker | Simple Task Management</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="bg-blue-50 min-h-screen font-inter text-gray-900">
        {/* Hero Section */}
        <header className="py-28 px-6 text-center bg-white/80 backdrop-blur-sm">
          <h1 className="text-5xl md:text-6xl font-bold text-blue-600 animate-fade-in">
            Task Tracker
          </h1>
          <p className="text-xl md:text-2xl mt-4 text-gray-700 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Effortless task management, beautifully simple.
          </p>
          <a href="./login" className="mt-10 inline-block animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <button className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300">
              Start Tracking
            </button>
          </a>
        </header>

        {/* Purpose Section */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-blue-600 mb-6 animate-slide-in">
              Clear & Calm
            </h2>
            <p className="text-lg text-gray-600 bg-white/50 backdrop-blur-sm p-4 rounded-lg animate-slide-in" style={{ animationDelay: "0.2s" }}>
              Track tasks without the mess—clean design, pure focus.
            </p>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-20 px-6 bg-blue-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-10">
              {/* Right: Transparent Highlight Card */}
              <div className="md:w-1/3 bg-white/70 backdrop-blur-md p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in">
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
                  <p className="text-gray-700">Capture tasks without complexity.</p>
                </div>
                <div className="flex items-center space-x-4 animate-slide-in" style={{ animationDelay: "0.4s" }}>
                  <FaEye className="text-blue-400 text-2xl flex-shrink-0" />
                  <p className="text-gray-700">View your day with crystal clarity.</p>
                </div>
                <div className="flex items-center space-x-4 animate-slide-in" style={{ animationDelay: "0.6s" }}>
                  <FaCheckSquare className="text-blue-400 text-2xl flex-shrink-0" />
                  <p className="text-gray-700">Complete tasks with a single click.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Closing Section */}
        <section className="py-20 px-6 text-center bg-white/60 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold text-blue-600 mb-6 animate-fade-in">
              Simplify Your Tasks
            </h2>
            <p className="text-lg text-gray-600 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Task Tracker keeps it light and easy. Start now.
            </p>
            <a href="./login">
              <button className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                Try It Now
              </button>
            </a>
          </div>
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