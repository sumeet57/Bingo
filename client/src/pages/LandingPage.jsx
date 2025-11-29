import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaTrophy,
  FaGithub,
  FaSyncAlt,
  FaGamepad,
  FaRegCheckCircle,
  FaShieldAlt,
  FaInstagram,
  FaLinkedin,
  FaGlobe,
  FaBolt,
  FaChartLine,
} from "react-icons/fa";
import { MdLiveTv, MdOutlineGridView } from "react-icons/md";

/* =========================================================
                    LANDING PAGE
=========================================================*/
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-zinc-950 text-white overflow-x-hidden selection:bg-orange-400/40 relative">
      {/* ==== Background Grid ==== */}
      <div
        className="fixed inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem]
      [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20 pointer-events-none"
      ></div>

      {/* =========================================================
                         HERO SECTION
      =========================================================*/}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 md:px-6 overflow-hidden gap-4 md:gap-6">
        {/* Static Glow */}
        <div className="absolute top-20 left-10 h-96 w-96 bg-orange-500/20 blur-[140px] rounded-full"></div>
        <div className="absolute -bottom-10 right-10 h-96 w-96 bg-orange-400/20 blur-[140px] rounded-full"></div>

        {/* Bingo Orbs */}
        <Orb txt="B5" pos="top-32 right-20" size="16" />
        <Orb txt="O72" pos="bottom-40 left-16" size="20" />
        <Orb txt="N38" pos="top-1/2 right-32" size="12" />

        {/* Hero Title */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span className="inline-block px-4 py-2 bg-orange-500/10 border border-orange-400/30 rounded-full text-orange-400 text-sm font-semibold">
            🎮 Built with MERN + Socket.IO
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-orange-400 drop-shadow-[0_0_35px_#e47f1a80]"
        >
          Bingo Arena
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed">
            Experience futuristic Bingo with{" "}
            <span className="text-orange-400 font-semibold">
              real-time sync + secure claim rules.
            </span>
          </p>
          <p className="text-sm md:text-lg text-zinc-400 max-w-xl mx-auto mt-2">
            Live draw • Anti-cheat logic • Smart reconnect • Zero-lag UI
          </p>
        </motion.div>

        {/* Stats */}
        <div className="flex gap-4 flex-wrap justify-center mt-6">
          <Stat icon={<FaUsers />} label="Multiplayer" value="Live" />
          <Stat icon={<FaShieldAlt />} label="Anti-Cheat" value="Secure" />
          <Stat icon={<FaBolt />} label="Realtime" value="Fast" />
        </div>

        {/* Hero Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-4 justify-center mt-6"
        >
          <ButtonPrimary
            onClick={() => navigate("/home")}
            icon={<FaGamepad />}
            text="Play Now"
          />
          <ButtonOutline
            onClick={() => scrollToId("about")}
            text="Learn More"
          />
          <ButtonDark
            href="https://github.com/sumeet57/Bingo"
            text="Star on GitHub"
            icon={<FaGithub />}
          />
        </motion.div>
      </section>

      {/* =========================================================
                          ABOUT SECTION
      =========================================================*/}
      <Section
        id="about"
        label="About The Project"
        title="Built for Speed, Fairness & Scale"
      >
        <p className="text-base md:text-lg text-zinc-300 max-w-4xl mx-auto leading-relaxed">
          A realtime multiplayer Bingo platform powered by{" "}
          <span className="text-orange-400">MERN + Socket.IO</span>
          ensuring secure claim validation, smooth reconnections & automated
          memory cleanup.
        </p>
        <p className="text-sm md:text-lg text-zinc-400 max-w-3xl mx-auto mt-4">
          Designed for production-scale matchmaking — fast, recoverable &
          cheat-proof.
        </p>

        <TechList
          items={[
            "React",
            "Node.js",
            "MongoDB",
            "Socket.IO",
            "Express",
            "Framer Motion",
          ]}
        />

        <DeveloperCard
          name="Sumeet Umbalkar"
          role="Full Stack Developer"
          links={[
            ["GitHub", "https://github.com/sumeet57", <FaGithub />],
            [
              "Instagram",
              "https://instagram.com/sumeet.codes",
              <FaInstagram />,
            ],
            [
              "LinkedIn",
              "https://linkedin.com/in/sumeet-umbalkar",
              <FaLinkedin />,
            ],
            ["Portfolio", "https://sumeet.live", <FaGlobe />],
          ]}
        />
      </Section>

      {/* =========================================================
                          FEATURES
      =========================================================*/}
      <SectionDark label="Why Choose Bingo Arena?" title="Powerful Features">
        <FeatureGrid
          list={[
            [
              <FaUsers />,
              "Realtime Multiplayer",
              "Instant sync across all devices",
            ],
            [
              <MdLiveTv />,
              "Live Draw Streaming",
              "Executed with zero desync delay",
            ],
            [
              <FaSyncAlt />,
              "Smart Reconnect",
              "Auto restore game context instantly",
            ],
            [
              <FaTrophy />,
              "Pattern Detection",
              "Server-auth claims only — no cheating",
            ],
            [
              <FaShieldAlt />,
              "Anti-Cheat Logic",
              "All claims verified backend-side",
            ],
            [
              <MdOutlineGridView />,
              "Unique Tickets",
              "Never repeating — always random",
            ],
          ]}
        />
      </SectionDark>

      {/* =========================================================
                         HOW TO PLAY + RULES
      =========================================================*/}
      <Section id="howToPlay" label="Getting Started" title="How To Play">
        <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
          <Card title="Game Steps" icon={<FaGamepad />}>
            <PlayStep number="1" text="Join or create a room" />
            <PlayStep number="2" text="Host starts the draw sequence" />
            <PlayStep number="3" text="Numbers stream to all players" />
            <PlayStep number="4" text="Tap numbers on your ticket" />
            <PlayStep number="5" text="Select 5 in a line & claim" />
            <PlayStep number="6" text="Valid claim wins the round" />
          </Card>

          <Card title="Rules & Winning" icon={<FaTrophy />}>
            <Rule valid text="Must select exactly 5 cells" />
            <Rule valid text="Must form line (Row/Column/Diag)" />
            <Rule valid text="FREE center auto-counts" />
            <Rule text="Scattered pattern invalid" />
            <Rule text="Duplicate line claims rejected" />
          </Card>
        </div>
      </Section>

      {/* =========================================================
                      TECH ARCHITECTURE
      =========================================================*/}
      <SectionDark label="Technical Excellence" title="Architecture Highlights">
        <ArchGrid
          list={[
            [
              "Real-time Engine",
              "Socket.IO with reconnect fallback",
              <FaBolt />,
            ],
            [
              "State Management",
              "Server-auth state + client preview",
              <FaChartLine />,
            ],
            [
              "Scalable Design",
              "Memory auto-cleanup + scale-ready",
              <FaSyncAlt />,
            ],
          ]}
        />
      </SectionDark>

      {/* =========================================================
                         CTA SECTION
      =========================================================*/}
      <Section id="" title="Ready to Play?" center>
        <p className="text-zinc-300 max-w-xl mx-auto text-lg mb-8">
          Join thousands experiencing real-time Bingo like never before.
        </p>

        <ButtonPrimary
          large
          onClick={() => navigate("/auth")}
          icon={<FaGamepad />}
          text="Start Playing Now"
        />
      </Section>

      {/* =========================================================
                           FOOTER
      =========================================================*/}
      <footer className="py-12 border-t border-zinc-800 text-center text-zinc-500">
        <p>
          © {new Date().getFullYear()} Bingo Arena — Built by{" "}
          <a
            className="text-orange-400 font-semibold"
            href="https://sumeet.live"
            target="_blank"
          >
            Sumeet
          </a>
        </p>
        <p className="text-xs mt-2">Powered by MERN Stack + Socket.IO</p>
      </footer>
    </div>
  );
};
export default LandingPage;

/* =========================================================
  UI COMPONENTS — CLEANED + NO WARNINGS
=========================================================*/

const scrollToId = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

const ButtonPrimary = ({ text, icon, onClick, large }) => (
  <button
    onClick={onClick}
    className={`px-8 py-${
      large ? 5 : 4
    } bg-orange-500 text-black font-bold rounded-xl shadow-xl hover:scale-105 transition flex items-center gap-2`}
  >
    {icon} {text}
  </button>
);

const ButtonOutline = ({ text, onClick }) => (
  <button
    onClick={onClick}
    className="px-8 py-4 border border-zinc-700 rounded-xl hover:border-orange-400 transition"
  >
    {text}
  </button>
);

const ButtonDark = ({ href, icon, text }) => (
  <a
    href={href}
    className="px-8 py-4 bg-black/40 border border-zinc-700 rounded-xl hover:border-orange-400 transition flex items-center gap-2"
  >
    {icon} {text}
  </a>
);

const Stat = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 px-6 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl">
    <span className="text-2xl text-orange-400">{icon}</span>
    <div>
      <div className="font-bold">{value}</div>
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  </div>
);

const Orb = ({ txt, pos, size }) => (
  <div
    className={`hidden lg:flex absolute ${pos} w-${size} h-${size} rounded-full bg-orange-500/10 border border-orange-400/30 text-xl justify-center items-center`}
  >
    {txt}
  </div>
);

const Section = ({ id, label, title, children, center }) => (
  <section id={id} className="py-24 px-6 text-center">
    <span className="px-4 py-2 bg-orange-500/10 border border-orange-400/30 rounded-full text-orange-400 text-sm font-semibold">
      {label}
    </span>
    <h2 className="text-5xl font-bold mt-6 mb-12 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
      {title}
    </h2>
    <div className={`${center ? "flex flex-col items-center" : ""}`}>
      {children}
    </div>
  </section>
);

const SectionDark = ({ label, title, children }) => (
  <section className="py-24 px-6 bg-zinc-900/40 border-y border-zinc-800 text-center">
    <span className="px-4 py-2 bg-orange-500/10 border border-orange-400/30 rounded-full text-orange-400 text-sm font-semibold">
      {label}
    </span>
    <h2 className="text-5xl font-bold mt-6 mb-12 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
      {title}
    </h2>
    {children}
  </section>
);

const TechList = ({ items }) => (
  <div className="flex flex-wrap justify-center gap-2 mt-8">
    {items.map((i) => (
      <span
        key={i}
        className="px-4 py-2 border border-zinc-700 rounded-full text-sm text-zinc-300 hover:text-orange-400 hover:border-orange-400 transition"
      >
        {i}
      </span>
    ))}
  </div>
);

const DeveloperCard = ({ name, role, links }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="glass p-8 rounded-2xl border border-zinc-700 mx-auto mt-12 w-fit"
  >
    <h3 className="text-2xl text-orange-400 font-bold">{name}</h3>
    <p className="text-zinc-400">{role}</p>

    <div className="flex gap-3 mt-5 justify-center">
      {links.map(([label, url, icon]) => (
        <a
          key={label}
          href={url}
          target="_blank"
          className="p-3 bg-zinc-900/50 border border-zinc-700 rounded-xl hover:border-orange-400 hover:text-orange-400 transition"
        >
          {icon}
        </a>
      ))}
    </div>
  </motion.div>
);

const FeatureGrid = ({ list }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
    {list.map(([icon, title, text], i) => (
      <div
        key={i}
        className="p-6 glass rounded-2xl border border-zinc-800 hover:border-orange-400/50 hover:scale-105 transition"
      >
        <div className="text-4xl text-orange-400 mb-4">{icon}</div>
        <h3 className="font-bold text-xl mb-2">{title}</h3>
        <p className="text-zinc-400 text-sm">{text}</p>
      </div>
    ))}
  </div>
);

const ArchGrid = ({ list }) => (
  <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
    {list.map(([t, d, i], x) => (
      <div
        key={x}
        className="p-6 glass rounded-2xl border border-zinc-800 hover:border-orange-400/50 transition"
      >
        <div className="text-5xl text-orange-400 mb-4">{i}</div>
        <h3 className="font-bold text-xl mb-2">{t}</h3>
        <p className="text-sm text-zinc-400">{d}</p>
      </div>
    ))}
  </div>
);

const Card = ({ title, icon, children }) => (
  <div className="glass p-8 rounded-3xl border border-zinc-700 text-left hover:border-orange-400/50 transition">
    <h3 className="text-3xl font-bold text-orange-400 flex gap-2 items-center mb-6">
      {icon}
      {title}
    </h3>
    {children}
  </div>
);

const PlayStep = ({ number, text }) => (
  <div className="flex items-center gap-3 p-3 bg-zinc-900/30 border border-zinc-800 rounded-xl hover:border-orange-400/50 transition">
    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center font-bold text-black">
      {number}
    </div>
    <p className="text-zinc-200 text-sm md:text-base">{text}</p>
  </div>
);

const Rule = ({ text, valid }) => (
  <p
    className={`text-sm flex gap-2 items-center ${
      valid ? "text-green-400" : "text-red-400"
    }`}
  >
    {valid ? "✓" : "✗"} {text}
  </p>
);
