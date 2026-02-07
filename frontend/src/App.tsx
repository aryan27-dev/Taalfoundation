import { useState } from 'react'
import './App.css'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleNavClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <div className="app">
      <header className="header">
        <nav className="nav">
          <a className="brand" href="#home" onClick={handleNavClick}>
            <span className="brand-logo" aria-hidden="true">
              TF
            </span>
            <span className="brand-text">Taal Foundation</span>
          </a>

          <button
            className="hamburger"
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
            <a href="#home" onClick={handleNavClick}>
              Home
            </a>
            <a href="#about" onClick={handleNavClick}>
              About Us
            </a>
            <a href="#events" onClick={handleNavClick}>
              Event History
            </a>
            <a href="#reviews" onClick={handleNavClick}>
              Reviews
            </a>
            <a href="#contact" onClick={handleNavClick}>
              Contact Us
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section id="home" className="section hero">
          <div className="hero-content">
            <p className="eyebrow">Dance Academy</p>
            <h1>Taal Foundation</h1>
            <p className="lead">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <div className="hero-actions">
              <a className="btn primary" href="#contact">
                Enroll Now
              </a>
              <a className="btn ghost" href="#about">
                Explore Classes
              </a>
            </div>
          </div>
          <div className="hero-card">
            <h3>Why dance with us?</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore.
            </p>
            <ul>
              <li>Lorem ipsum dolor sit amet.</li>
              <li>Consectetur adipiscing elit.</li>
              <li>Sed do eiusmod tempor.</li>
            </ul>
          </div>
        </section>

        <section id="about" className="section">
          <div className="section-heading">
            <h2>About Us</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
              aute irure dolor in reprehenderit in voluptate velit esse cillum
              dolore eu fugiat nulla pariatur.
            </p>
          </div>
          <div className="grid two-col">
            <div className="card">
              <h3>Our Mission</h3>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
            <div className="card">
              <h3>Our Vision</h3>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          </div>
        </section>

        <section id="events" className="section alt">
          <div className="section-heading">
            <h2>Event History</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div className="timeline">
            <div className="timeline-item">
              <h3>2025 - Annual Showcase</h3>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
            <div className="timeline-item">
              <h3>2024 - Community Dance Fest</h3>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
            <div className="timeline-item">
              <h3>2023 - Cultural Exchange</h3>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          </div>
        </section>

        <section id="reviews" className="section">
          <div className="section-heading">
            <h2>Reviews</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div className="grid three-col">
            <div className="card">
              <p>
                “Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                do eiusmod tempor.”
              </p>
              <span>— Student A</span>
            </div>
            <div className="card">
              <p>
                “Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                do eiusmod tempor.”
              </p>
              <span>— Parent B</span>
            </div>
            <div className="card">
              <p>
                “Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                do eiusmod tempor.”
              </p>
              <span>— Performer C</span>
            </div>
          </div>
        </section>

        <section id="contact" className="section alt contact">
          <div className="section-heading">
            <h2>Contact Us</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div className="grid two-col">
            <div className="card">
              <h3>Visit the studio</h3>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore.
              </p>
              <p>Monday - Saturday | 9:00 AM - 7:00 PM</p>
            </div>
            <div className="card">
              <h3>Get in touch</h3>
              <p>Email: hello@taalfoundation.com</p>
              <p>Phone: +91 90000 00000</p>
              <p>
                Address: Lorem ipsum dolor sit amet, consectetur adipiscing
                elit.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© 2026 Taal Foundation. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
