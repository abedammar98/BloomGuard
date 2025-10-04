import "./Styles/Home.css";
import Navbar from "./Components/Navbar";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="page">
      <Navbar />

      <main id="main" aria-labelledby="hero-title">
        <section className="hero" aria-label="BloomGuard overview">
          <div className="hero-inner">
            {/* ── النص ── */}
            <div className="hero-copy">
              <span className="hero-kicker">Environmental Intelligence</span>

              <h1 className="hero-title" id="hero-title">
                BloomGuard{" "}
                <span className="sprout" aria-hidden>
                  🌱
                </span>
              </h1>

              <p className="hero-subtitle">
                Determine environmental conditions that lead to cyanobacteria
                blooms in lakes.
                <br />
                <strong>Use case:</strong> Researchers and lake managers can
                explore historical trends, run what-if scenarios, and consult an
                assistant to interpret risk factors.
              </p>

              <div className="hero-actions">
                <Link
                  className="btn btn-primary"
                  to="/graphs"
                  aria-label="Open graphs"
                >
                  📊 Explore Graphs
                </Link>
                <Link
                  className="btn btn-secondary"
                  to="/assistant"
                  aria-label="Open assistant"
                >
                  🤖 Open Assistant
                </Link>
                <Link className="btn" to="/about" aria-label="About BloomGuard">
                  About
                </Link>
              </div>

              <div className="stats" aria-label="Quick metrics">
                <div className="stat">
                  <div className="ico" aria-hidden>
                    📚
                  </div>
                  <div className="num">10+ yrs</div>
                  <div className="label">Historical data</div>
                </div>
                <div className="stat">
                  <div className="ico" aria-hidden>
                    📡
                  </div>
                  <div className="num">25+</div>
                  <div className="label">Monitoring stations</div>
                </div>
                <div className="stat">
                  <div className="ico" aria-hidden>
                    🔎
                  </div>
                  <div className="num">120+</div>
                  <div className="label">Cited papers in RAG</div>
                </div>
              </div>
            </div>

            {/* ── الجانب المرئي الهادىء ── */}
            <div className="hero-visual" aria-hidden="true">
              {/* SVG ناعم يعبّر عن الماء/الموج + ورقة */}
              <svg
                viewBox="0 0 540 340"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
              >
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--primary-2)" />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#22b37f" />
                    <stop offset="100%" stopColor="#36c794" />
                  </linearGradient>
                </defs>

                <path
                  d="M0,220 C120,190 180,250 300,220 C420,190 480,250 600,220 L600,360 L0,360 Z"
                  fill="url(#g1)"
                  opacity="0.18"
                />
                <path
                  d="M0,240 C120,210 180,270 300,240 C420,210 480,270 600,240 L600,360 L0,360 Z"
                  fill="url(#g1)"
                  opacity="0.12"
                />

                <ellipse
                  cx="270"
                  cy="220"
                  rx="22"
                  ry="10"
                  fill="#b48a7a"
                  opacity=".9"
                />
                <rect
                  x="265"
                  y="170"
                  width="10"
                  height="50"
                  rx="4"
                  fill="#b48a7a"
                />

                <path
                  d="M270 165 C300 150 320 145 335 155 C320 160 300 170 270 165 Z"
                  fill="url(#g2)"
                />
                <path
                  d="M270 165 C240 150 220 145 205 155 C220 160 240 170 270 165 Z"
                  fill="url(#g2)"
                />
              </svg>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
