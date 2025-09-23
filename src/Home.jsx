import { useState } from 'react'

import './Styles/Home.css'
import Navbar from './Components/Navbar'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="page">
      <Navbar />
      <main>
        <section className="hero">
          <div className="hero-inner">
            <span className="hero-kicker">Environmental Intelligence</span>
            <h1 className="hero-title">BloomGuard 🌱</h1>
            <p className="hero-subtitle">
              Determine environmental conditions that lead to cyanobacteria blooms in lakes.
              <br />
              <strong>Use case:</strong> Researchers and lake managers can explore historical trends, run
              what-if scenarios, and consult an assistant to interpret risk factors.
            </p>

            <div className="hero-actions">
              <Link className="btn btn-primary" to="/graphs">📊 Explore Graphs</Link>
              <Link className="btn btn-secondary" to="/assistant">🤖 Open Assistant</Link>
              <Link className="btn" to="/about" style={{borderColor: 'rgba(255,255,255,.15)'}}>About</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home

