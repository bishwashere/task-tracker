import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

const Home: NextPage = () => {
  return (
    <>

      {/* Dark top section */}
      {/* <div className='top-bg min-h-screen z-10 object-fill'> */}
      <div className="text-white flex items-center justify-center relative">
        <div className='absolute top-0 left-0 w-full h-full top-bg' />
        <div className='z-10 py-20 md:py-28 px-4 flex flex-col'>
          <div className='flex flex-col items-center'>
            <div className='flex flex-col'>
              <p className="text-blue-600 text-sm md:text-xl lg:text-2xl xl:text-3xl mb-3">Welcome to</p>
              <h1 className="text-5xl md:text-6xl xl:text-8xl font-extrabold mb-2 text-white">TaskMentor.io</h1>
            </div>
          </div>
          <p className="text-blue-600 font-bold text-xl md:text-4xl xl:text-6xl mb-4 text-center">Your Personal Productivity Mentor</p>
          <p className="text-base md:text-lg xl:text-xl mb-8 text-center">A task manager so clear and simple, it feels like it reads your mind.</p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-5 place-items-center mt-10 md:mt-16'>
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-left">Master Your Day in 60 <br />Seconds</h2>
              <hr className='size-2 border-0 my-8 bg-blue-600 w-24 rounded' />
              <p className="mb-2 text-left md:text-lg">No clutter. No meetings. Just pure focus.</p>
              <p className="mb-8 text-left md:text-lg">Capture. Prioritize. Succeed.</p>
              <Link href="/login">
                <button className="bg-blue-600 w-fit text-white px-8 py-3 rounded-full text-lg hover:bg-blue-700 transition mb-8 text-center">
                  Get Started Free →
                </button>
              </Link>
            </div>
            <Image src="/tmplqbv4u4a.webp" width={450} height={450} alt="NextPost AI" />

          </div>
        </div>
      </div>

      {/* Full-width white section */}
      <div className="w-full bg-white text-gray-900 py-12">
        <main className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row items-center justify-between">
          {/* Left text block */}
          <div className="lg:w-1/2">
            <h1 className="text-8xl font-extrabold mb-2 text-gray-900">Why</h1>
            <h2 className="text-5xl font-bold mb-4 text-blue-600">TaskMentor.io?</h2>

            <ul className="text-left mb-4">
              <li className="mb-4 flex items-start">
                <span className="text-blue-600 mr-2 mt-1">🔵</span>
                <div>
                  <strong>Instant Task Capture</strong><br />
                  Open the app, jot it down, and move on—no overload, no distractions.
                </div>
              </li>
              <li className="mb-4 flex items-start">
                <span className="text-blue-600 mr-2 mt-1">🔵</span>
                <div>
                  <strong>Priority-First Organization</strong><br />
                  Focus on what truly matters. Clear visuals help you see your top tasks at a glance.
                </div>
              </li>
              <li className="mb-4 flex items-start">
                <span className="text-blue-600 mr-2 mt-1">🔵</span>
                <div>
                  <strong>One-Click Completion</strong><br />
                  Satisfying. Simple. Structured. Complete your tasks and stay on track.
                </div>
              </li>
            </ul>

            <p className="text-gray-600 italic text-left">
              &quot;It&apos;s a simple tool to organize tasks fast and keep you productive.&quot;
            </p>
          </div>

          {/* Right image block (placeholder or background image) */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
            <Image width={400} height={400} src="/tmpahonxzug.webp" alt="Why illustration" className="max-w-full h-auto" />
          </div>
        </main>
      </div>

      <div className="w-full bg-gray-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-12">
            <span className="text-white">How It Works</span>
            <span className="text-gray-300"> (3 Simple Steps)</span>
          </h2>

          <div className="bg-white rounded-2xl p-8 flex flex-col lg:flex-row justify-around items-center text-gray-900 shadow-md">
            {/* Step 1 */}
            <div className="flex flex-col items-center mb-12 lg:mb-0">
              <Image width={400} height={400} src="/tmpt9c0taeg.webp" alt="Add a Task" className="h-48 w-auto mb-4" />
              <h3 className="text-lg font-semibold">Add a Task</h3>
              <p className="text-sm text-center">Quick input box—no learning curve.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center mb-12 lg:mb-0">
              <Image width={400} height={400} src="/tmpg65gi3gp.webp" alt="Prioritize" className="h-48 w-auto mb-4" />
              <h3 className="text-lg font-semibold">Prioritize</h3>
              <p className="text-sm text-center">Drag-and-drop in your daily queue.</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <Image width={400} height={400} src="/tmpbjyre81k.webp" alt="Finish & Repeat" className="h-48 w-auto mb-4" />
              <h3 className="text-lg font-semibold">Finish & Repeat</h3>
              <p className="text-sm text-center">Tap done. Celebrate progress. Repeat.</p>
            </div>
          </div>

          <Link href="/login">
            <button className="mt-12 bg-blue-600 text-white px-8 py-3 rounded-full text-lg hover:bg-blue-700 transition">
              Start For Free →
            </button>
          </Link>
        </div>
      </div>


      <div className="w-full bg-white text-gray-900 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Top Title */}
          <h2 className="text-5xl font-bold text-center mb-12">How It Works</h2>

          {/* Use Cases */}
          <div className="flex flex-col lg:flex-row justify-between text-center mb-16">
            <div className="mb-8 lg:mb-0 lg:w-1/3 px-4">
              <div className="text-blue-600 text-xl mb-2">🔵</div>
              <h3 className="font-semibold text-lg">Freelancers & Creators</h3>
              <p className="text-sm text-gray-600">Keep side hustles and client projects organized.</p>
            </div>
            <div className="mb-8 lg:mb-0 lg:w-1/3 px-4">
              <div className="text-blue-600 text-xl mb-2">🔵</div>
              <h3 className="font-semibold text-lg">Students & Busy Learners</h3>
              <p className="text-sm text-gray-600">Simplify assignments and study timelines.</p>
            </div>
            <div className="lg:w-1/3 px-4">
              <div className="text-blue-600 text-xl mb-2">🔵</div>
              <h3 className="font-semibold text-lg">Solo Professionals & Founders</h3>
              <p className="text-sm text-gray-600">Manage your schedule without bloat.</p>
            </div>
          </div>

          {/* Action Section */}
          <div className="flex flex-col lg:flex-row items-center justify-between">
            {/* Text Side */}
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h3 className="text-5xl font-bold mb-4 leading-tight">See<br /><span className="text-blue-600">TaskMentor</span><br />in Action</h3>
              <hr className='size-2 border-0 my-4 bg-blue-600 w-24 rounded' />
              <ul className="list-disc list-inside text-gray-800 mt-6 space-y-2 text-lg">
                <li>Instant task addition</li>
                <li>Natural drag-and-drop reordering</li>
                <li>Crisp priority and timeline views</li>
                <li>Light and dark themes</li>
                <li>Fully mobile-responsive</li>
              </ul>
            </div>

            {/* Image Side */}
            <div className="lg:w-1/2">
              <Image width={600} height={600} src="/tmp7h6h4fdn.webp" alt="TaskMentor Dashboard" className="w-full max-w-md mx-auto" />
            </div>
          </div>
        </div>
      </div>


      <div className="w-full bg-gray-900 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Section Header */}
          <p className="uppercase text-sm tracking-widest text-gray-400 mb-2">Testimonials</p>
          <h2 className="text-5xl font-bold text-blue-500 mb-12">Loved by Real Users</h2>

          {/* Testimonials */}
          <div className="flex flex-col lg:flex-row justify-center gap-8 mb-16">
            {/* Testimonial 1 */}
            <div className="bg-white text-gray-900 p-6 rounded-2xl shadow-md w-full max-w-md mx-auto lg:mx-0">
              <div className="flex items-center mb-4">
                <Image width={40} height={40} src="/tmpwi_05qpn.webp" alt="David Kim" className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <p className="font-bold">David Kim</p>
                  <p className="text-sm text-gray-600">(Startup Founder)</p>
                </div>
              </div>
              <p className="text-yellow-500 text-lg mb-2">★★★★★</p>
              <p className="italic">“Simple, clean, and super effective!”</p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white text-gray-900 p-6 rounded-2xl shadow-md w-full max-w-md mx-auto lg:mx-0">
              <div className="flex items-center mb-4">
                <Image width={40} height={40} src="/tmpzvgbpbe9.webp" alt="Sara Michaels" className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <p className="font-bold">Sara Michaels</p>
                  <p className="text-sm text-gray-600">(Product Manager)</p>
                </div>
              </div>
              <p className="text-yellow-500 text-lg mb-2">★★★★★</p>
              <p className="italic">
                &quot;Azent.io transformed the way I handle my daily workflow. It&apos;s fast, beautiful, and makes my life easier.&quot;
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <p className="text-gray-400 mb-4 text-lg">Ready to get started?</p>
          <Link href="/login">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg hover:bg-blue-700 transition">
              Start Using TaskMentor →
            </button>
          </Link>
        </div>
      </div>


      <div className="w-full bg-white text-gray-900 py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-24">
          {/* Privacy Section */}
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <Image width={600} height={600} src="/tmpytgzqchf.webp" alt="Privacy Shield" className="w-full max-w-sm mx-auto" />
            </div>
            <div className="lg:w-1/2 px-4">
              <h3 className="text-4xl font-bold mb-4 leading-tight">
                Privacy & Security<br /><span className="text-blue-600">You Can Trust</span>
              </h3>
              <ul className="list-disc list-inside text-lg text-gray-800 space-y-2">
                <li>Encrypted storage</li>
                <li>No ads, no tracking</li>
                <li>Data stays with you – forever</li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Growth Section */}
          <div className="flex flex-col-reverse lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 px-4">
              <h3 className="text-4xl font-bold mb-4 leading-tight">
                Start for Free<br /><span className="text-blue-600">& Grow at Your Pace</span>
              </h3>
              <ul className="list-disc list-inside text-lg text-gray-800 space-y-2">
                <li>100% free to start – no credit card required</li>
                <li>Upgrade later for pro features</li>
                <li>Stay with the free version if that’s all you need</li>
                <li>30-second signup, full productivity support</li>
              </ul>
            </div>
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <Image width={600} height={600} src="/tmpshl6lia9.webp" alt="Rocket Launch" className="w-full max-w-sm mx-auto" />
            </div>
          </div>
        </div>
      </div>


      {/* Bonus Resources Section */}
      <div className="w-full bg-gray-900 text-white py-20 px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">Bonus Productivity Resources</h2>
        <ul className="text-white text-lg list-disc list-inside space-y-2 mb-10">
          <li>Free Starter Guide (PDF)</li>
          <li>Weekly planning template</li>
          <li>30-day task completion challenge</li>
        </ul>
        <p className="text-gray-400 mb-4 text-lg">Ready to get started?</p>
        <Link href="/login">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg hover:bg-blue-700 transition">
            Start Using TaskMentor →
          </button>
        </Link>
      </div>

      {/* FAQ Section */}
      <div className="w-full bg-white text-gray-900 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-10">Frequently<br />Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-gray-700 text-white rounded-md px-4 py-3">
              <summary className="cursor-pointer font-medium">
                Question 1: Do I need to install anything?
              </summary>
              <p className="mt-2 text-sm text-gray-200">Nope! TaskMentor is fully web-based and works on any modern browser.</p>
            </details>
            <details className="bg-gray-700 text-white rounded-md px-4 py-3">
              <summary className="cursor-pointer font-medium">
                Question 2: What makes TaskMentor different from Todoist or Notion?
              </summary>
              <p className="mt-2 text-sm text-gray-200">Simplicity, instant task capture, and focus-first layout. It&apos;s built to reduce friction and save time.</p>
            </details>
            <details className="bg-gray-700 text-white rounded-md px-4 py-3">
              <summary className="cursor-pointer font-medium">
                Question 3: Are team features available?
              </summary>
              <p className="mt-2 text-sm text-gray-200">Team functionality is coming soon! Right now, it&apos;s perfect for personal or solo professional use.</p>
            </details>
          </div>
        </div>
      </div>


      {/* CTA Blue Box Section */}
      <div className="w-full bg-gray-900 py-20 px-4">
        <div className="max-w-3xl mx-auto bg-blue-600 text-white text-center py-12 px-6 rounded-2xl shadow-lg">
          <p className="text-xl mb-2">Don&apos;t Spend Another Day</p>
          <p className="text-xl mb-4">Managing Your Tasks, Instead of Doing Them</p>
          <p className="font-semibold mb-6">Find your flow. Get stuff done.</p>
          <Link href="/login">
            <button className="bg-white text-blue-700 px-8 py-3 rounded-full text-lg hover:bg-gray-100 transition font-medium">
              👉 Try TaskMentor Free →
            </button>
          </Link>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="w-full bg-gray-900 text-white py-7 md:py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row justify-between gap-12">
          {/* Branding */}
          <div className="text-center lg:text-left">
            <h3 className="text-2xl font-bold mb-2">
              <span className="text-blue-500">TaskMentor.io</span> - Your Productivity, Mentored
            </h3>
            <p className="text-sm text-gray-400">Less clutter. More clarity. More done</p>
          </div>

          {/* Newsletter Form */}
          <div className="text-center lg:text-left">
            <h4 className="text-md mb-2">STAY UP TO DATE</h4>
            <form className="flex flex-col items-center lg:items-start space-y-2">
              <input
                type="email"
                placeholder="Email"
                className="w-64 px-3 py-2 rounded-md bg-white text-gray-900"
                required
              />
              <button
                type="submit"
                className="w-64 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition"
              >
                SUBMIT
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="text-center lg:text-left">
            <h4 className="text-md mb-2">STAY IN TOUCH</h4>
            <p className="text-sm">📧 bishwas@unclesamstech.com</p>
            <p className="text-sm">📞 +1 (223) 279-9248</p>
            <p className="text-sm">📍 Mechanicsburg, PA, USA</p>
          </div>
        </div>

        <hr className="my-6 border-gray-700" />

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row justify-between items-center text-sm text-gray-500">
          <div className="mb-4 lg:mb-0 space-x-4">
            <a href="#" className="hover:underline">PRIVACY POLICY</a>
            <a href="#" className="hover:underline">TERMS & CONDITIONS</a>
          </div>
          <p>Copyright © 2025. All rights reserved. Taskmentor.io</p>
          <div className="space-x-3 mt-4 lg:mt-0">
            {/* Replace with real social links if needed */}
            {/* <a href="#" className="hover:text-white">📘</a>
            <a href="#" className="hover:text-white">📸</a>
            <a href="#" className="hover:text-white">🐦</a> */}
          </div>
        </div>
      </footer>

    </>
  );
};

export default Home;
