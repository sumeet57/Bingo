import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaGamepad,
  FaGithub,
  FaTrophy,
  FaUsers,
  FaShieldAlt,
} from "react-icons/fa";
import { MdLiveTv } from "react-icons/md";
import { IoMdStarOutline } from "react-icons/io";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      {/* ================= HERO ================= */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 right-[-80px] w-80 h-80 bg-orange-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-80px] left-[-60px] w-72 h-72 bg-orange-400/10 blur-[120px] rounded-full pointer-events-none" />

        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-1.5 rounded-full border border-orange-500/40 bg-orange-500/10 text-xs md:text-sm text-orange-300 font-medium"
        >
          Realtime Multiplayer • MERN + Socket.IO
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-4 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-orange-400 drop-shadow-[0_0_20px_#f973161f]"
        >
          Online Multiplayer Bingo
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-3 max-w-xl text-sm md:text-base text-zinc-300 leading-relaxed"
        >
          Fast, fair and secure multiplayer Bingo. Unique tickets, live draws,
          strict claim validation and smooth reconnection — built for real
          games, not just demos.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-7 flex flex-wrap gap-3 justify-center"
        >
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-orange-500 text-black text-sm font-semibold hover:bg-orange-400 transition"
          >
            <FaGamepad size={16} />
            Play Now
          </button>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById("about-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-zinc-700 text-sm text-zinc-200 hover:border-orange-400 hover:text-orange-300 transition"
          >
            Learn More
          </button>

          <a
            href="https://github.com/sumeet57/Bingo"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 hover:border-orange-400 hover:text-orange-300 transition"
          >
            Github
            <IoMdStarOutline color="yellow" size={16} />
          </a>
        </motion.div>
      </section>

      {/* ================= ABOUT + FEATURES ================= */}
      <section
        id="about-section"
        className="py-16 md:py-20 px-6 max-w-6xl mx-auto"
      >
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* About text */}
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-orange-400">
              Built for real-time play, not static demos.
            </h2>
            <p className="mt-3 text-sm md:text-base text-zinc-300 leading-relaxed">
              Bingo Arena is a production-style Bingo engine using MongoDB,
              Express, React, Node, and Socket.IO. It focuses on correctness,
              game security, and robustness: strict server-side validation,
              memory-efficient room stores, and clean match teardown.
            </p>
            <p className="mt-3 text-xs md:text-sm text-zinc-500">
              Designed and developed by{" "}
              <a
                href="https://sumeet.live"
                target="_blank"
                rel="noreferrer"
                className="text-orange-400 hover:underline"
              >
                Sumeet
              </a>
              .
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            <FeatureCard
              icon={<FaUsers size={18} />}
              title="Realtime Multiplayer"
              text="Sockets keep all players in sync with minimal latency."
            />
            <FeatureCard
              icon={<MdLiveTv size={18} />}
              title="Live Draws"
              text="Numbers are broadcast instantly to everyone in the room."
            />
            <FeatureCard
              icon={<FaShieldAlt size={18} />}
              title="Secure Claims"
              text="Server ensures only valid patterns and drawn numbers win."
            />
            <FeatureCard
              icon={<FaTrophy size={18} />}
              title="Pattern Wins"
              text="Straight-line Bingo with multi-winner support per room."
            />
          </div>
        </div>
      </section>

      {/* ================= HOW TO PLAY + RULES ================= */}
      <section className="py-16 md:py-20 px-6 bg-zinc-900/40 border-y border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-center text-orange-400">
            How it works
          </h2>
          <p className="mt-2 text-xs md:text-sm text-center text-zinc-400">
            Simple flow for players, strict logic under the hood.
          </p>

          <div className="mt-10 grid md:grid-cols-2 gap-10">
            {/* Steps */}
            <div className="space-y-3">
              <Step number="1" text="Create or join a room from the lobby." />
              <Step
                number="2"
                text="Host starts the game and numbers begin to draw."
              />
              <Step
                number="3"
                text="Tap the numbers on your ticket as they are called."
              />
              <Step
                number="4"
                text="Once you have 5 in a straight line, press Claim."
              />
            </div>

            {/* Rules card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 md:p-6">
              <h3 className="text-lg md:text-xl font-semibold text-orange-300 flex items-center gap-2">
                <FaTrophy />
                Rules & Claim Logic
              </h3>
              <ul className="mt-4 space-y-2 text-xs md:text-sm text-zinc-300 text-left">
                <RuleItem text="You must select exactly 5 cells to claim." />
                <RuleItem text="Those cells must form a straight row, column, or diagonal." />
                <RuleItem text="FREE center counts automatically when part of a valid line." />
                <RuleItem text="All claimed numbers must already be drawn." />
                <RuleItem text="Same line cannot be claimed by the same player twice." />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-orange-400">
          Ready to try it?
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Jump into the lobby, create a room, and start drawing.
        </p>
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="mt-6 px-7 py-2.5 rounded-lg bg-orange-500 text-black text-sm font-semibold hover:bg-orange-400 transition inline-flex items-center gap-2"
        >
          <FaGamepad size={16} />
          Go to Lobby
        </button>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-8 border-t border-zinc-800 text-center text-[11px] md:text-xs text-zinc-500">
        <p>
          © {new Date().getFullYear()} Bingo Arena • Built by{" "}
          <a
            href="https://sumeet.live"
            target="_blank"
            rel="noreferrer"
            className="text-orange-400 hover:underline"
          >
            Sumeet
          </a>
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;

/* =========== Small Reusable Components =========== */

const FeatureCard = ({ icon, title, text }) => (
  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-left hover:border-orange-400/70 transition">
    <div className="flex items-center gap-2 text-orange-300 mb-1.5">
      <span>{icon}</span>
      <span className="text-sm font-semibold">{title}</span>
    </div>
    <p className="text-xs md:text-sm text-zinc-400">{text}</p>
  </div>
);

const Step = ({ number, text }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-[11px] font-semibold text-orange-300 border border-orange-500/60">
      {number}
    </div>
    <p className="text-xs md:text-sm text-zinc-300 text-left">{text}</p>
  </div>
);

const RuleItem = ({ text }) => (
  <li className="flex items-start gap-2">
    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-orange-400" />
    <span>{text}</span>
  </li>
);
