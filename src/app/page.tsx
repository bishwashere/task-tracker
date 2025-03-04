import Head from "next/head";
import { FaTasks, FaUsers, FaCheckCircle, FaAngry } from "react-icons/fa";

export default function Home() {
  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Lobster&family=Quicksand&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen">
        <style>
          {`
            @keyframes fadeIn {
              0% {
                opacity: 0;
              }
              100% {
                opacity: 1;
              }
            }

            .animate-title {
              animation: fadeIn 5s ease-in-out forwards;
              font-family: "Lobster", cursive;
            }

            .animate-subtitle {
              animation: fadeIn 6s ease-in-out forwards;
              font-family: "Quicksand", sans-serif;
            }

            .animate-button {
              animation: fadeIn 7s ease-in-out forwards;
            }

            .wave-background {
              background: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%230099ff" fill-opacity="1" d="M0,0L60,16C120,32,240,64,360,85.3C480,107,600,117,720,112C840,107,960,85,1080,69.3C1200,53,1320,43,1380,37.3L1440,32L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path></svg>') no-repeat;
              background-size: cover;
              background-position: top;
            }
          `}
        </style>

        {/* Header Section */}
        <header
          className="relative text-center py-12 text-white"
          style={{ backgroundColor: "#0099ff" }}
        >
          <h1 className="text-5xl font-bold animate-title">
            Task Management, Finally Done Right.
          </h1>
          <h2 className="text-2xl mt-4 animate-subtitle">
            Other task planners overwhelm you with complexity? We keep it
            simple, effective, and fun.
          </h2>
          <a href="./login" className="animate-button">
            <button className="mt-6 px-6 py-3 bg-yellow-400 text-gray-900 text-lg rounded shadow-lg hover:bg-yellow-500 transition">
              Try Now
            </button>
          </a>
        </header>

        {/* "Tired of These Common Issues?" Section with Wave Background */}
        <section className="py-16 px-8 text-center wave-background">
          <h2 className="text-3xl font-semibold text-white mb-6">
            Tired of These Common Issues?
          </h2>
          <ul className="space-y-4 text-lg text-gray-700">
            <li className="bg-white shadow-md p-4 rounded-lg flex items-center space-x-4 max-w-lg mx-auto">
              <FaAngry className="text-red-500 text-2xl" />
              <span>Too many features you will never use.</span>
            </li>
            <li className="bg-white shadow-md p-4 rounded-lg flex items-center space-x-4 max-w-lg mx-auto">
              <FaAngry className="text-red-500 text-2xl" />
              <span>Confusing interfaces that slow you down.</span>
            </li>
            <li className="bg-white shadow-md p-4 rounded-lg flex items-center space-x-4 max-w-lg mx-auto">
              <FaAngry className="text-red-500 text-2xl" />
              <span>Overpriced tools with no real value.</span>
            </li>
            <li className="bg-white shadow-md p-4 rounded-lg flex items-center space-x-4 max-w-lg mx-auto">
              <FaAngry className="text-red-500 text-2xl" />
              <span>Lack of motivation to stay on track.</span>
            </li>
          </ul>
        </section>

        {/* "A Task Planner That Works for You" Section */}
        <section className="py-16 px-8">
          <h2 className="text-4xl font-semibold text-center text-gray-800 mb-10">
            A Task Planner That Works for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tile 1 */}
            <div className="bg-white shadow-lg rounded-lg p-8 text-center">
              <FaTasks className="text-blue-500 text-6xl mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Gamification
              </h3>
              <p className="text-lg text-gray-600">
                Earn points, climb leaderboards, and make progress fun.
              </p>
            </div>

            {/* Tile 2 */}
            <div className="bg-white shadow-lg rounded-lg p-8 text-center">
              <FaUsers className="text-green-500 text-6xl mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Intuitive Design
              </h3>
              <p className="text-lg text-gray-600">
                A clean, modern interface that makes planning enjoyable.
              </p>
            </div>

            {/* Tile 3 */}
            <div className="bg-white shadow-lg rounded-lg p-8 text-center">
              <FaCheckCircle className="text-yellow-500 text-6xl mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Flexibility
              </h3>
              <p className="text-lg text-gray-600">
                Perfect for individuals, teams, or families.
              </p>
            </div>

            {/* Tile 4 */}
            <div className="bg-white shadow-lg rounded-lg p-8 text-center">
              <FaCheckCircle className="text-purple-500 text-6xl mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Tracking Progress
              </h3>
              <p className="text-lg text-gray-600">
                See exactly where you stand at a glance.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}