import './App.css'
import heroImage from './assets/homeimage.jpg'

function App() {
  const events = [
    {
      year: '2022',
      title: 'Founding Showcase',
      description:
        'Our first annual recital celebrating classical roots and contemporary expression.'
    },
    {
      year: '2023',
      title: 'Rhythm & Roots',
      description:
        'A community collaboration featuring live percussion and student choreography.'
    },
    {
      year: '2024',
      title: 'Taal Utsav',
      description:
        'A full-scale production with 120+ dancers and cross-genre choreography.'
    },
    {
      year: '2025',
      title: 'Global Beats',
      description:
        'Fusion performances celebrating international dance styles and cultures.'
    }
  ]

  const branches = [
    {
      name: 'Central Studio',
      address: '12 Harmony Street, City Center',
      phone: '+91 90000 00001',
      timing: 'Mon-Sat · 7:00 AM - 9:00 PM'
    },
    {
      name: 'North Wing',
      address: '45 Rhythm Avenue, North District',
      phone: '+91 90000 00002',
      timing: 'Mon-Sat · 7:30 AM - 8:30 PM'
    },
    {
      name: 'East Studio',
      address: '88 Pulse Road, East Side',
      phone: '+91 90000 00003',
      timing: 'Tue-Sun · 8:00 AM - 8:00 PM'
    }
  ]

  return (
    <div className="app">
      <header
        className="hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.86), rgba(15, 23, 42, 0.2)), url(${heroImage})`
        }}
      >
        <nav className="nav">
          <div className="brand">Taal Foundation</div>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#events">Events</a>
            <a href="#branches">Branches</a>
            <a href="#reviews">Reviews</a>
            <a href="#enquiry" className="cta">Enquire</a>
          </div>
        </nav>

        <div className="hero-content">
          <div>
            <p className="eyebrow">Kathak Dance Academy</p>
            <h1>Where Kathak storytelling becomes a lifelong journey.</h1>
            <p className="subtitle">
              Taal Foundation nurtures graceful Kathak performers through classical
              training, mindful practice, and heritage-driven showcases.
            </p>
            <div className="hero-actions">
              <a href="#enquiry" className="primary">Book a Trial Class</a>
              <a href="#about" className="secondary">Explore Kathak Programs</a>
            </div>
            <div className="stats">
              <div>
                <h3>15+</h3>
                <span>Years of Excellence</span>
              </div>
              <div>
                <h3>1200+</h3>
                <span>Students Trained</span>
              </div>
              <div>
                <h3>40+</h3>
                <span>Showcase Events</span>
              </div>
            </div>
          </div>
          <div className="hero-card">
            <h2>Kathak programs at a glance</h2>
            <ul>
              <li>Kathak Foundations · Lucknow & Jaipur Gharana</li>
              <li>Beginner to Professional Training</li>
              <li>Footwork, Chakkars, Abhinaya, and Theory</li>
              <li>Performance & Competition Coaching</li>
            </ul>
            <div className="hero-highlight">
              <p>Next showcase:</p>
              <strong>March 21 · Taal Foundation Kathak Sandhya</strong>
            </div>
          </div>
        </div>
      </header>

      <section id="about" className="section about">
        <div className="section-header">
          <p className="eyebrow">About Us</p>
          <h2>Preserving Kathak artistry with structure, heart, and discipline.</h2>
        </div>
        <div className="about-grid">
          <div className="about-card">
            <h3>Our Mission</h3>
            <p>
              We empower dancers to express their individuality while staying rooted in
              Kathak tradition. Every class blends layakari, musicality, and wellness.
            </p>
          </div>
          <div className="about-card">
            <h3>Our Faculty</h3>
            <p>
              Award-winning gurus and accompanists guide every dancer with personalized
              attention and performance readiness.
            </p>
          </div>
          <div className="about-card">
            <h3>Our Community</h3>
            <p>
              We celebrate diversity and collaboration through showcases, outreach, and
              mentorship programs across all age groups.
            </p>
          </div>
        </div>
      </section>

      <section id="services" className="section services">
        <div className="section-header">
          <p className="eyebrow">Services Offered</p>
          <h2>Specialized training in classical performing arts.</h2>
        </div>
        <div className="services-scroll">
          <article className="service-card">
            <h3>Katthak</h3>
            <p>
              Classical Katthak training covering footwork, chakkars, abhinaya, and
              performance repertoire across gharanas.
            </p>
            <span>Beginner · Intermediate · Advanced</span>
          </article>
          <article className="service-card">
            <h3>Tabla</h3>
            <p>
              Rhythm and taal training designed for dancers and musicians to deepen
              layakari, bols, and performance confidence.
            </p>
            <span>Foundations · Accompaniment · Advanced</span>
          </article>
        </div>
      </section>

      <section id="enquiry" className="section enquiry">
        <div className="section-header">
          <p className="eyebrow">Enquiry</p>
          <h2>Start your dance journey with Taal Foundation.</h2>
        </div>
        <form className="enquiry-form">
          <div className="field">
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" placeholder="Enter your name" />
          </div>
          <div className="field">
            <label htmlFor="email">Email Address</label>
            <input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone Number</label>
            <input id="phone" type="tel" placeholder="+91 90000 00000" />
          </div>
          <div className="field">
            <label htmlFor="program">Program of Interest</label>
            <select id="program">
              <option>Beginner Foundation</option>
              <option>Intermediate Training</option>
              <option>Advanced Performance</option>
              <option>Weekend Intensive</option>
            </select>
          </div>
          <div className="field full">
            <label htmlFor="message">Tell us about your goals</label>
            <textarea id="message" rows={4} placeholder="Share your dance interests" />
          </div>
          <button type="submit" className="primary">Submit Enquiry</button>
        </form>
      </section>

      <section id="events" className="section events">
        <div className="section-header">
          <p className="eyebrow">Event History</p>
          <h2>Moments that shaped our dancers.</h2>
        </div>
        <div className="timeline">
          {events.map((event) => (
            <article key={event.year} className="timeline-item">
              <div className="timeline-year">{event.year}</div>
              <div className="timeline-content">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="branches" className="section branches">
        <div className="section-header">
          <p className="eyebrow">Branches</p>
          <h2>Find a studio near you.</h2>
        </div>
        <div className="branch-grid">
          {branches.map((branch) => (
            <article key={branch.name} className="branch-card">
              <h3>{branch.name}</h3>
              <p>{branch.address}</p>
              <p>{branch.phone}</p>
              <span>{branch.timing}</span>
            </article>
          ))}
        </div>
      </section>

      <section id="reviews" className="section reviews">
        <div className="section-header">
          <p className="eyebrow">Reviews</p>
          <h2>What our dancers and parents say.</h2>
        </div>
        <div className="reviews-grid">
          <div className="google-embed">
            <h3>Google Reviews</h3>
            <p>
              Embed your live Google Reviews here by replacing the iframe source with
              your official Google Business Profile reviews link.
            </p>
            <div className="iframe-placeholder">
              <iframe
                title="Google Reviews"
                src="https://maps.google.com"
                loading="lazy"
              />
            </div>
          </div>
          <div className="review-cards">
            <article>
              <h4>“A nurturing academy with incredible mentors.”</h4>
              <p>— Ananya S.</p>
            </article>
            <article>
              <h4>“My child gained confidence on and off stage.”</h4>
              <p>— Rakesh P.</p>
            </article>
            <article>
              <h4>“Professional training with a warm community.”</h4>
              <p>— Kavya M.</p>
            </article>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div>
          <h3>Taal Foundation</h3>
          <p>Empowering dancers through rhythm, discipline, and artistry.</p>
        </div>
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="#events">Events</a>
          <a href="#branches">Branches</a>
          <a href="#enquiry">Enquiry</a>
        </div>
      </footer>
    </div>
  )
}

export default App
