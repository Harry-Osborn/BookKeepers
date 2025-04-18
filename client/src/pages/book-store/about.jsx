import React from "react";
import { Link } from "react-router-dom";

function About() {
  return (
    <div className="relative z-10 px-4 py-10 sm:px-6 lg:px-10 text-white min-h-screen bg-transparent from-gray-900 via-gray-800 to-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-playfair italic mb-6 text-zinc-200">About BookManager</h1>

        <p className="text-gray-300 text-lg font-diphylleia leading-relaxed mb-6">
          BookManager is your personal digital library, designed to help you
          track, organize, and enjoy your reading journey like never before.
          Built for book lovers, this platform allows you to manage your
          collection, mark your reading progress, and revisit favorites anytime.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold font-diphylleia text-white mb-3">📚 Your Library</h2>
            <p className="text-gray-400 text-sm font-diphylleia">
              Add books, categorize them by status (Read, Unread, Reading), and
              track your reading progress seamlessly. It’s your bookshelf, your way.
            </p>
          </div>

          <div className="bg-gray-800/70 border border-gray-700 rounded-xl font-diphylleia p-6 shadow-lg">
            <h2 className="text-2xl font-semibold font-diphylleia text-white mb-3">🧠 Smart Insights</h2>
            <p className="text-gray-400 text-sm font-diphylleia">
              Get personalized insights into your reading habits, favorite genres,
              and more with our analytics-driven dashboard.
            </p>
          </div>

          <div className="bg-gray-800/70 border border-gray-700 font-diphylleia rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-white mb-3 font-diphylleia">🔒 Private & Secure</h2>
            <p className="text-gray-400 text-sm font-diphylleia">
              Your reading data is yours alone. All your books and notes are
              securely stored and accessible only to you.
            </p>
          </div>

          <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-6 shadow-lg font-diphylleia">
            <h2 className="text-2xl font-semibold text-white mb-3 font-diphylleia">📖 Intuitive Reader</h2>
            <p className="text-gray-400 text-sm font-diphylleia">
              Enjoy a minimal, distraction-free reading experience within our
              built-in book reader, designed for comfort.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/books/home"
            className="flex-shrink-0 flex px-6 py-3 items-center justify-center text-white text-sm font-medium rounded-lg transition"
            // className="inline-block  w-[200px]  justify-center snap-start"
          >
            Go to Home
            <span className="text-2xl p-2 group w-fit grid" style={{ clipPath: 'inset(0 0 0 0)' }}>
              <span className="[grid-area:1/1] flex items-center justify-center h-10 w-10 transition ease-in-out group-hover:delay-300 -translate-x-10 group-hover:translate-x-0">➝</span>
              <span className="[grid-area:1/1] flex items-center justify-center h-10 w-10 transition ease-in-out delay-300 group-hover:delay-[0s] duration-300 group-hover:translate-x-10">➝</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;
