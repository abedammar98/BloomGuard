import "./Styles/About.css";
import Navbar from "./Components/Navbar";

import abed from "./abed.jpg";
import Basel from "./Basel.jpg";
import Adam from "./Adam.png";

export default function About() {
  return (
    <div className="about-page">
      <Navbar />

      {/* ── Hero ── */}
      <section className="about-hero section">
        <div className="container">
          <header className="section-header">
            <span className="eyebrow" aria-hidden="true">
              About
            </span>
            <h1 className="section-title">About BloomGuard</h1>
            <p className="section-kicker">
              We’re Software Engineering students at <b>Braude College</b>,
              working with the{" "}
              <b>
                Israel Oceanographic &amp; Limnological Research (IOLR) –
                Kinneret Limnological Laboratory
              </b>
              .
            </p>
          </header>

          <div className="mission-card">
            <div className="mission-icon" aria-hidden="true">
              📘
            </div>
            <div className="mission-content">
              <p>
                <b>Purpose of the app:</b> BloomGuard supports lake managers and
                researchers by
                <b> monitoring cyanobacteria bloom risk</b> in Lake Kinneret and
                nearby systems.&nbsp; It merges field datasets into a single
                advisory view (CDI), reveals likely
                <b> environmental drivers</b> (temperature, pH, DO, nutrients,
                turbidity), and provides
                <b> actionable messages</b> when risk increases. A built-in{" "}
                <b>RAG assistant</b> answers science questions using the lab’s
                paper library, helping teams make faster, evidence-based
                decisions for monitoring, early warnings, and communication with
                stakeholders.
              </p>
            </div>
          </div>

          <ul className="bullets" aria-label="Key points">
            <li>
              <span className="dot" aria-hidden="true" />
              <span>
                One dashboard: CDI trends with clear green/yellow/red zones.
              </span>
            </li>
            <li>
              <span className="dot" aria-hidden="true" />
              <span>
                Driver-aware advice: what to watch and what actions to consider.
              </span>
            </li>
            <li>
              <span className="dot" aria-hidden="true" />
              <span>
                Research chat assistant: cite-aware answers from curated papers.
              </span>
            </li>
            <li>
              <span className="dot" aria-hidden="true" />
              <span>
                Secure API for your web app—same endpoint used by the graphs and
                chat pages.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="team-section section" aria-labelledby="team-title">
        <div className="container">
          <div className="team-wrap">
            <div className="team-head">
              <h2 id="team-title" className="team-title">
                Our Team
              </h2>
            </div>
            <p className="team-sub">
              BloomGuard • Braude College × IOLR — Kinneret Limnological
              Laboratory
            </p>

            <div className="divider" aria-hidden="true" />

            <div className="team-grid">
              <TeamCard
                name="Abed Ammar"
                role="Backend & Data Pipelines"
                img={abed}
                bio="Leads the FastAPI/ngrok service, CDI pipelines, and dataset integration."
                links={{
                  github: "https://github.com/abedammar98",
                  linkedin: "https://www.linkedin.com/in/abed-ammar-757aa5254/",
                }}
              />
              <TeamCard
                name="Adam Hasarmi"
                role="Frontend & UX"
                img={Adam}
                bio="Owns the React dashboard, charts, and interaction design."
                links={{ github: "#", linkedin: "#" }}
              />
              <TeamCard
                name="Basel Haddad"
                role="RAG / LLM Integration"
                img={Basel}
                bio="Implements the research assistant and vector search pipeline."
                links={{ github: "#", linkedin: "#" }}
              />
            </div>

            <p className="credit">
              Data collaboration: <b>IOLR – Kinneret Limnological Laboratory</b>
              . Supervision &amp; guidance: <b>Braude College</b>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function TeamCard({ name, role, img, bio, links = {} }) {
  return (
    <article className="card">
      <div className="avatar">
        <img
          src={img}
          alt={`${name} — ${role}`}
          loading="lazy"
          decoding="async"
        />
      </div>
      <h3 className="name">{name}</h3>
      <div className="role">{role}</div>
      <p className="bio">{bio}</p>
      <nav className="links" aria-label={`${name} links`}>
        {links.github && (
          <a
            href={links.github.trim()}
            target="_blank"
            rel="noreferrer"
            aria-label={`${name} on GitHub`}
            title="GitHub"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.24c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.73.08-.73 1.2.08 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.13 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.47 5.92.43.37.81 1.1.81 2.23v3.3c0 .32.21.7.82.58A12 12 0 0 0 12 .5z" />
            </svg>
          </a>
        )}
        {links.linkedin && (
          <a
            href={links.linkedin.trim()}
            target="_blank"
            rel="noreferrer"
            aria-label={`${name} on LinkedIn`}
            title="LinkedIn"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20.45 20.45h-3.55v-5.4c0-1.29-.02-2.96-1.8-2.96-1.8 0-2.08 1.4-2.08 2.85v5.51H9.47V9h3.4v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.11 20.45H3.57V9h3.54v11.45z" />
            </svg>
          </a>
        )}
      </nav>
    </article>
  );
}
