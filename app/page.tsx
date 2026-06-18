'use client'

import { useRef, useState } from 'react'
import Logo from '@/components/Logo'

export default function HomePage() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    program: 'Beginner Foundation',
    message: '',
  })

  const handleEnquirySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const phoneNumber = '919765651268'
    const messageLines = [
      'New Enquiry - Taal Foundation',
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Program: ${form.program}`,
      `Message: ${form.message}`,
    ]
    const message = encodeURIComponent(messageLines.join('\n'))
    const url = `https://wa.me/${phoneNumber}?text=${message}`
    const popup = window.open(url, '_blank', 'noopener,noreferrer')
    if (!popup) alert('Popup blocked. Please allow popups or WhatsApp +91 97656 51268 directly.')
  }

  const events = [
    { year: '2022', title: 'Founding Showcase', description: 'Our first annual recital celebrating classical roots and contemporary expression.' },
    { year: '2023', title: 'Rhythm & Roots', description: 'A community collaboration featuring live percussion and student choreography.' },
    { year: '2024', title: 'Taal Utsav', description: 'A full-scale production with 120+ dancers and cross-genre choreography.' },
    { year: '2025', title: 'Global Beats', description: 'Fusion performances celebrating international dance styles and cultures.' },
  ]

  const branches = [
    {
      name: 'Pimple Saudagar Branch',
      address: '4th Floor, Prime Square commercial complex, Kunal Icon Road, Pimple Saudagar, Pune.',
      phone: '+91 97656 51268',
      timing: 'Mon-Fri · 10:00 AM - 9:00 PM\nSat-Sun · 11:00 AM - 6:00 PM',
    },
  ]

  const reviewGalleryRef = useRef<HTMLDivElement | null>(null)

  return (
    <div className="app">
      <header
        className="hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.86), rgba(15,23,42,0.2)), url('/homepage1.jpg')`,
        }}
      >
        <nav className="nav">
          <div className="brand">
            <Logo size={52} priority />
          </div>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#events">Events</a>
            <a href="#branches">Branches</a>
            <a href="#reviews">Reviews</a>
            <a href="/login" style={{ padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', backdropFilter: 'blur(8px)' }}>
              Student Portal
            </a>
            <a href="#enquiry" className="cta">Enquire</a>
          </div>
        </nav>

        <div className="hero-content">
          <div>
            <p className="eyebrow">Kathak Dance Academy</p>
            <h1>Where Kathak storytelling becomes a lifelong journey.</h1>
            <p className="subtitle">
              Taal Foundation nurtures graceful Kathak performers through classical training, mindful practice, and heritage-driven showcases.
            </p>
            <div className="hero-actions">
              <a href="#enquiry" className="primary">Book a Trial Class</a>
              <a href="#about" className="secondary">Explore Kathak Programs</a>
            </div>
            <div className="stats">
              <div><h3>15+</h3><span>Years of Excellence</span></div>
              <div><h3>1200+</h3><span>Students Trained</span></div>
              <div><h3>40+</h3><span>Showcase Events</span></div>
            </div>
          </div>
          <div className="hero-card">
            <h2>Kathak programs at a glance</h2>
            <ul>
              <li>Kathak Foundations · Lucknow &amp; Jaipur Gharana</li>
              <li>Affiliated with Akhil Bhartiya Gandharva Vidyalay and Bharti Vidyapeeth</li>
              <li>Beginner to Professional Training</li>
              <li>Performance &amp; Competition Coaching</li>
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
            <p>We empower dancers to express their individuality while staying rooted in Kathak tradition. Every class blends layakari, musicality, and wellness.</p>
          </div>
          <div className="about-card">
            <h3>Our Faculty</h3>
            <p>Award-winning gurus and accompanists guide every dancer with personalized attention and performance readiness.</p>
          </div>
          <div className="about-card">
            <h3>Our Community</h3>
            <p>We celebrate diversity and collaboration through showcases, outreach, and mentorship programs across all age groups.</p>
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
            <h3>Kathak</h3>
            <p>Classical Kathak training covering footwork, chakkars, abhinaya, and performance repertoire across gharanas.</p>
            <span>Prarambhik - Visharad</span>
          </article>
          <article className="service-card">
            <h3>Tabla</h3>
            <p>Rhythm and taal training designed for dancers and musicians to deepen layakari, bols, and performance confidence.</p>
            <span>Prarambhik - Visharad</span>
          </article>
        </div>
      </section>

      <section id="enquiry" className="section enquiry">
        <div className="section-header">
          <p className="eyebrow">Enquiry</p>
          <h2>Start your dance journey with Taal Foundation.</h2>
        </div>
        <form className="enquiry-form" onSubmit={handleEnquirySubmit}>
          <div className="field">
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" placeholder="Enter your name" value={form.name} required onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone Number</label>
            <input id="phone" type="tel" placeholder="+91 90000 00000" value={form.phone} required pattern="[0-9+\-\s]{10,15}" inputMode="tel" onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="program">Program of Interest</label>
            <select id="program" value={form.program} required onChange={(e) => setForm({ ...form, program: e.target.value })}>
              <option>Beginner Foundation</option>
              <option>Intermediate Training</option>
              <option>Advanced Performance</option>
              <option>Weekend Intensive</option>
            </select>
          </div>
          <div className="field full">
            <label htmlFor="message">Tell us about your goals</label>
            <textarea id="message" rows={4} placeholder="Share your dance interests" value={form.message} required onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <button type="submit" className="primary">Submit Enquiry via WhatsApp</button>
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
              <p className="map-label">Find us on Google Maps</p>
              <div className="map-frame">
                <iframe
                  title="Taal Foundation Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3781.564959192824!2d73.7938534!3d18.593642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b90be673cd95%3A0xe2214cb4ca6cfc35!2sTaal%20Foundation%20Dance%20and%20Music%20Academy!5e0!3m2!1sen!2sin!4v1771308423671!5m2!1sen!2sin"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="reviews" className="section reviews">
        <div className="section-header">
          <p className="eyebrow">Reviews</p>
          <h2>What our dancers and parents say.</h2>
        </div>
        <div className="review-gallery" ref={reviewGalleryRef}>
          <div className="review-track">
            <article><h4>&ldquo;A nurturing academy with incredible mentors.&rdquo;</h4><p>— Ananya S.</p></article>
            <article><h4>&ldquo;My child gained confidence on and off stage.&rdquo;</h4><p>— Rakesh P.</p></article>
            <article><h4>&ldquo;Professional training with a warm community.&rdquo;</h4><p>— Kavya M.</p></article>
            <article><h4>&ldquo;Thoughtful feedback every class; love the discipline.&rdquo;</h4><p>— Meera T.</p></article>
            <article><h4>&ldquo;Great tabla accompaniment made my teen&apos;s practice better.&rdquo;</h4><p>— Arjun D.</p></article>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div>
          <Logo size={64} />
          <p>Empowering dancers through rhythm, discipline, and artistry.</p>
        </div>
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="#events">Events</a>
          <a href="#branches">Branches</a>
          <a href="#enquiry">Enquiry</a>
          <a href="/login" style={{ color: '#fbbf24' }}>Student Portal</a>
        </div>
      </footer>
    </div>
  )
}
