import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Globe2,
  LayoutTemplate,
  Palette,
  FileText,
  CreditCard,
  Sparkles,
  Gem,
  Smartphone,
  Layers,
  Award,
  Menu,
  X,
} from "lucide-react";

/**
 * NIVORA marketing homepage — dark/gold luxury studio identity, adapted
 * from a design reference (ink #0a0b0a / ivory #f4f0e9 / gold #c7a064,
 * Georgia-serif headings in the reference, swapped here for the app's own
 * Cormorant Garamond + Lora so it reads as one typographic family with the
 * rest of the site). Self-contained header + footer — this page does not
 * use PublicLayout's light Header/Footer, which stay as-is for
 * /login, /register, etc.
 */

/**
 * No real photography exists yet for these cards — each gets a distinct
 * warm-toned gradient "swatch" instead of a flat background, so the grid
 * doesn't read as empty while real photos are still TODO. Replace each
 * `swatch` with a real photo (background-image) once one exists; the
 * gradients were picked to stay in-family with the gold/ink palette.
 */
const SERVICES = [
  {
    icon: Heart,
    title: "Animated Wedding Invitations",
    tagline: "Turn your wedding announcement into an experience.",
    cta: "Create My Wedding Invitation",
    href: "/create/wedding-invitation",
    swatch: "linear-gradient(135deg, #3d1f24, #160d10)",
    // A real animated invitation prototype (provided), shown live rather than as a flat photo.
    preview: "/templates/invitation-foulen-foulen.html",
  },
  {
    icon: Globe2,
    title: "Custom Wedding Websites",
    tagline: "Your love story, beautifully online.",
    cta: "Discover Wedding Websites",
    href: "/create/wedding-video",
    swatch: "linear-gradient(135deg, #1f2b30, #0d1416)",
    preview: undefined as string | undefined,
  },
  {
    icon: LayoutTemplate,
    title: "Business Websites",
    tagline: "A website that represents your business.",
    cta: "Build My Website",
    href: "/create",
    swatch: "linear-gradient(135deg, #20242f, #0d0e13)",
    preview: undefined as string | undefined,
  },
  {
    icon: Palette,
    title: "Logo & Brand Identity",
    tagline: "Give your brand a signature.",
    cta: "Create My Brand",
    href: "/create/brand-identity",
    swatch: "linear-gradient(135deg, #2f2416, #130f0a)",
    preview: undefined as string | undefined,
  },
  {
    icon: FileText,
    title: "Professional CV Design",
    tagline: "Make your experience look as strong as it is.",
    cta: "Design My CV",
    href: "/create/cv",
    swatch: "linear-gradient(135deg, #241f2f, #0f0d13)",
    preview: undefined as string | undefined,
  },
  {
    icon: CreditCard,
    title: "Business Cards & Digital Stationery",
    tagline: "Your identity, everywhere.",
    cta: "Create My Business Card",
    href: "/create/business-card",
    swatch: "linear-gradient(135deg, #2a2318, #12100a)",
    preview: undefined as string | undefined,
  },
] as const;

const BENEFITS = [
  {
    icon: Sparkles,
    title: "Personalized",
    body: "No generic designs. Every project is created around your personality, your brand, or your event.",
  },
  {
    icon: Gem,
    title: "Premium",
    body: "We focus on sophisticated layouts, typography, animation, interaction, and attention to detail.",
  },
  {
    icon: Smartphone,
    title: "Modern",
    body: "Our designs are created for today's digital world — responsive, mobile-friendly, and built to feel effortless.",
  },
  {
    icon: Layers,
    title: "One Creative Studio",
    body: "From your logo to your website, from your CV to your wedding invitation, NIVORA brings your visual identity together under one roof.",
  },
  {
    icon: Award,
    title: "Designed With Experience",
    body: "NIVORA is built on professional experience in web design, UI/UX, branding, and digital production, including the design and integration of more than 400 websites.",
  },
] as const;

const STEPS = [
  { num: "01", title: "Tell Us Your Vision", body: "Share your idea, your style, your information, and what you want to achieve." },
  { num: "02", title: "We Design", body: "Our creative process transforms your information into a refined visual concept." },
  { num: "03", title: "You Review", body: "Review your design and request adjustments so everything feels right." },
  { num: "04", title: "We Perfect It", body: "We refine the details, animations, layout, typography, and responsive experience." },
  { num: "05", title: "Your Design Goes Live", body: "Receive your final digital product, ready to share with your guests, clients, recruiters, or audience." },
] as const;

const WORK = [
  { title: "Wedding Invitations", tagline: "Elegant. Emotional. Unforgettable.", swatch: "linear-gradient(160deg, #3d1f24, #160d10)" },
  { title: "Brand Identities", tagline: "Distinctive. Consistent. Recognizable.", swatch: "linear-gradient(160deg, #2f2416, #130f0a)" },
  { title: "Websites", tagline: "Modern. Responsive. Purposeful.", swatch: "linear-gradient(160deg, #20242f, #0d0e13)" },
  { title: "Professional Designs", tagline: "Clean. Strategic. Memorable.", swatch: "linear-gradient(160deg, #241f2f, #0f0d13)" },
] as const;

const FAQS = [
  {
    q: "What is an animated wedding invitation?",
    a: "An animated wedding invitation is a digital invitation enhanced with motion, transitions, typography, music, images, and personalized information. It can be shared easily through WhatsApp, Instagram, Messenger, email, or other digital channels.",
  },
  {
    q: "Can I customize my wedding invitation?",
    a: "Yes. Your names, date, venue, photos, colors, typography, music, animations, and other event information can be incorporated into your personalized design.",
  },
  {
    q: "Do you create wedding websites?",
    a: "Yes. NIVORA creates personalized wedding websites containing information such as your story, wedding schedule, venue, location, gallery, RSVP, and other details.",
  },
  {
    q: "Can NIVORA create a complete brand identity?",
    a: "Yes. We can create your logo and supporting visual identity, including typography, colors, and branded materials.",
  },
  {
    q: "Do you create professional CVs?",
    a: "Yes. NIVORA creates modern CV designs tailored to your professional profile, experience, and desired visual style.",
  },
  {
    q: "Do you create websites for businesses?",
    a: "Yes. We create modern, responsive websites for businesses, freelancers, services, and personal brands.",
  },
  {
    q: "Can I request a custom design?",
    a: "Absolutely. NIVORA focuses on personalized design rather than one-size-fits-all templates.",
  },
] as const;

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing">
      <style>{CSS}</style>

      <header className="lp-nav">
        <div className="lp-shell lp-nav-inner">
          <Link to="/" className="lp-brand">NIVORA</Link>
          <nav className={`lp-navlinks ${menuOpen ? "open" : ""}`}>
            <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="#work" onClick={() => setMenuOpen(false)}>Portfolio</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
            <a href="#footer" onClick={() => setMenuOpen(false)}>Contact</a>
          </nav>
          <div className="lp-nav-actions">
            <Link to="/create" className="lp-btn lp-btn-fill lp-nav-cta">Start Your Project →</Link>
            <button className="lp-menu-toggle" aria-label="Toggle menu" onClick={() => setMenuOpen((o) => !o)}>
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-shell lp-hero-grid">
          <div>
            <div className="lp-eyebrow">Ideas · Design · Lasting Impressions</div>
            <h1>Digital Design,<br />Crafted to Be<br />Remembered.</h1>
            <p className="lp-lede">Premium digital experiences for moments, brands, and people who deserve to stand out.</p>
            <p>
              From animated wedding invitations and elegant digital stationery to custom websites, professional
              CVs, business cards, logos, and brand identities, NIVORA transforms your ideas into refined digital
              designs made to leave an impression.
            </p>
            <div className="lp-actions">
              <a href="#services" className="lp-btn lp-btn-line">Explore Our Services</a>
              <Link to="/create" className="lp-btn lp-btn-fill">Start Your Project →</Link>
            </div>
          </div>
          <div className="lp-hero-visual">
            <img src="/images/hero-mockup.png" alt="NIVORA wedding website shown on a laptop and phone, alongside a save-the-date card" />
          </div>
        </div>
      </section>

      {/* About / intro */}
      <section id="about" className="lp-section lp-light">
        <div className="lp-shell lp-center">
          <div className="lp-eyebrow lp-eyebrow-dark">NIVORA</div>
          <h2 className="lp-title">Premium Digital Design Studio</h2>
          <p className="lp-body">
            At NIVORA, we create sophisticated digital designs that combine elegance, creativity, and modern
            technology.
          </p>
          <p className="lp-body">
            Whether you're announcing your wedding, building your professional identity, launching a business,
            or creating a powerful online presence, we design every detail around your story and your goals.
          </p>
          <p className="lp-gold lp-tagline">Designed with intention. Created for you.</p>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="lp-section lp-dark">
        <div className="lp-shell lp-center">
          <div className="lp-eyebrow">Our Services</div>
          <h2 className="lp-title">Everything You Need to Build a Remarkable Presence</h2>
          <div className="lp-grid lp-services">
            {SERVICES.map((s) => (
              <div key={s.title} className="lp-card">
                {s.preview ? (
                  <div className="lp-card-media lp-card-media-preview">
                    <iframe src={s.preview} title={s.title} scrolling="no" tabIndex={-1} />
                  </div>
                ) : (
                  <div className="lp-card-media" style={{ background: s.swatch }}>
                    <s.icon size={28} strokeWidth={1.2} />
                  </div>
                )}
                <div className="lp-card-body">
                  <h3>{s.title}</h3>
                  <p>{s.tagline}</p>
                  <Link to={s.href} className="lp-learn">{s.cta} →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why NIVORA */}
      <section className="lp-section lp-dark">
        <div className="lp-shell lp-center">
          <div className="lp-eyebrow">Why NIVORA?</div>
          <h2 className="lp-title">Design That Goes Beyond the Surface</h2>
          <div className="lp-grid lp-benefits">
            {BENEFITS.map((b) => (
              <div key={b.title} className="lp-benefit">
                <div className="lp-benefit-icon"><b.icon size={24} strokeWidth={1.5} /></div>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="lp-section lp-light">
        <div className="lp-shell lp-center">
          <div className="lp-eyebrow lp-eyebrow-dark">Our Process</div>
          <h2 className="lp-title">From Idea to Final Design</h2>
          <div className="lp-steps">
            {STEPS.map((s) => (
              <div key={s.num} className="lp-step">
                <div className="lp-step-num">{s.num}</div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Moment */}
      <section className="lp-moment">
        <div className="lp-shell">
          <h2>Made for Moments<br />That Matter</h2>
          <p className="lp-moment-lede">
            Some designs are temporary.
            <br />
            Some become part of your story.
          </p>
          <p>
            A wedding invitation announces one of the biggest moments of your life. A CV can open the door to
            your next opportunity. A logo becomes the face of your business. A website becomes the place where
            people discover your brand.
          </p>
          <p className="lp-gold">NIVORA creates digital experiences designed to matter.</p>
        </div>
      </section>

      {/* Featured creations */}
      <section id="work" className="lp-section lp-light">
        <div className="lp-shell lp-center">
          <div className="lp-eyebrow lp-eyebrow-dark">Our Work</div>
          <h2 className="lp-title">Featured Creations</h2>
          <div className="lp-grid lp-work">
            {WORK.map((w) => (
              <div key={w.title} className="lp-work-card" style={{ background: w.swatch }}>
                <span>{w.title}</span>
                <span className="lp-work-tagline">{w.tagline}</span>
              </div>
            ))}
          </div>
          <Link to="/create" className="lp-btn lp-btn-fill">View Our Portfolio →</Link>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <div className="lp-shell">
          <h2>Your Vision. Our Craft.</h2>
          <p>
            Whether you need an animated wedding invitation, a luxury wedding website, a professional CV, a
            business card, a custom logo, or a complete website, NIVORA is here to turn your idea into something
            exceptional.
          </p>
          <p className="lp-gold">Let's create something worth remembering.</p>
          <Link to="/create" className="lp-btn lp-btn-fill">Start Your Project →</Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="lp-section lp-light">
        <div className="lp-shell lp-faq-wrap">
          <div>
            <div className="lp-eyebrow lp-eyebrow-dark">Frequently Asked Questions</div>
            <h2 className="lp-title">FAQ</h2>
            <p className="lp-body">Quick answers to help you learn more about working with NIVORA.</p>
          </div>
          <div className="lp-faq">
            {FAQS.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="lp-final-cta">
        <div className="lp-shell">
          <h2>Ready to Create Something Exceptional?</h2>
          <p>Your idea is the beginning.<br />NIVORA is where it becomes a design.</p>
          <Link to="/create" className="lp-btn lp-btn-fill">Start Your Project →</Link>
        </div>
      </section>

      <footer id="footer" className="lp-footer">
        <div className="lp-shell">
          <div className="lp-footer-brand">NIVORA</div>
          <nav className="lp-footer-links">
            <a href="#services">Services</a>
            <a href="#work">Portfolio</a>
            <a href="#about">About</a>
            <a href="#faq">FAQ</a>
            <a href="mailto:hello@nivora.tn">Contact</a>
          </nav>
          <p className="lp-copyright">
            © {new Date().getFullYear()} NIVORA. All rights reserved. · Invitations · Designs · Websites
          </p>
        </div>
      </footer>
    </div>
  );
}

const CSS = `
.landing {
  --ink: #0a0b0a;
  --ink-soft: #111210;
  --ivory: #f4f0e9;
  --gold: #c7a064;
  --gold-light: #e7c993;
  --gold-dark: #c99450;
  --line-dark: #3b3328;
  --line-light: #ded5c4;
  --muted-dark: #bdb7ad;
  --muted-light: #5a5650;
  --text-on-dark: #f8f4ee;
  --text-on-light: #161514;
  background: var(--ink);
  color: var(--text-on-dark);
  font-family: 'Lora', Georgia, serif;
}
.landing h1, .landing h2, .landing h3 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 400;
  margin: 0;
}
.landing a { text-decoration: none; }
.lp-shell { width: min(100% - 48px, 1100px); margin: 0 auto; }
.lp-center { text-align: center; }
.lp-eyebrow {
  text-transform: uppercase; color: var(--gold-light); letter-spacing: 0.3em;
  font-size: 11px; font-weight: 600;
}
.lp-eyebrow-dark { color: var(--gold-dark); }
.lp-title { font-size: clamp(30px, 4vw, 42px); line-height: 1.1; margin: 10px 0 20px; }
.lp-gold { color: var(--gold-dark); }
.lp-tagline { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 22px; }
.lp-body { color: var(--muted-light); line-height: 1.7; max-width: 62ch; margin: 12px auto; }

/* nav */
.lp-nav {
  position: sticky; top: 0; z-index: 20;
  background: rgba(10,11,10,0.82); backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line-dark);
}
.lp-nav-inner { display: flex; align-items: center; justify-content: space-between; padding: 18px 0; }
.lp-brand { font-family: 'Cormorant Garamond', Georgia, serif; letter-spacing: 0.24em; color: var(--gold-light); font-size: 22px; }
.lp-navlinks { display: flex; gap: 28px; }
.lp-navlinks a { color: var(--text-on-dark); font-size: 14px; opacity: 0.85; }
.lp-navlinks a:hover { opacity: 1; color: var(--gold-light); }
.lp-nav-actions { display: flex; align-items: center; gap: 12px; }
.lp-menu-toggle {
  display: none; border: 1px solid var(--gold-dark); border-radius: 50%; width: 38px; height: 38px;
  background: var(--ink); color: var(--gold-light); align-items: center; justify-content: center; cursor: pointer;
}

/* buttons */
.lp-btn {
  display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 24px;
  border-radius: 999px; font-weight: 600; font-size: 14px; font-family: 'Lora', serif; cursor: pointer;
  transition: transform 180ms ease, opacity 180ms ease;
}
.lp-btn:hover { transform: translateY(-1px); }
.lp-btn-fill { color: #17110b; background: linear-gradient(90deg, var(--gold-light), var(--gold-dark)); border: none; }
.lp-btn-line { color: var(--gold-light); border: 1px solid var(--gold-dark); background: transparent; }
.lp-nav-cta { padding: 0 18px; min-height: 40px; font-size: 13px; }

/* hero */
.lp-hero {
  position: relative; padding: 96px 0 88px; overflow: hidden;
  background: radial-gradient(circle at 78% 20%, #3d2513 0%, transparent 45%), linear-gradient(150deg, #070807 55%, #1a120b 100%);
}
.lp-hero h1 { font-size: clamp(44px, 7vw, 76px); line-height: 0.98; margin: 20px 0; }
.lp-hero .lp-lede { color: var(--text-on-dark); font-size: 18px; max-width: 56ch; margin: 0 0 8px; }
.lp-hero p { color: var(--muted-dark); line-height: 1.7; max-width: 58ch; }
.lp-actions { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 32px; }
.lp-hero .lp-shell { width: min(100% - 48px, 1320px); }
.lp-hero-grid { display: grid; grid-template-columns: 1fr 1.35fr; gap: 24px; align-items: center; }
.lp-hero-visual { position: relative; overflow: visible; }
.lp-hero-visual img {
  width: 128%; max-width: none; height: auto; display: block;
  filter: drop-shadow(0 30px 60px rgba(0,0,0,0.55));
}
@media (max-width: 1200px) {
  .lp-hero-visual img { width: 112%; }
}
@media (max-width: 900px) {
  .lp-hero-grid { grid-template-columns: 1fr; }
  .lp-hero-visual { order: -1; max-width: 420px; margin: 0 auto 8px; }
  .lp-hero-visual img { width: 100%; }
}

/* sections */
.lp-section { padding: 88px 0; }
.lp-light { background: var(--ivory); color: var(--text-on-light); }
.lp-dark { background: var(--ink-soft); }

/* services */
.lp-grid { display: grid; gap: 20px; margin-top: 40px; }
.lp-services { grid-template-columns: repeat(3, 1fr); text-align: left; }
.lp-card {
  border: 1px solid var(--line-dark); background: #131412; border-radius: 8px; overflow: hidden;
  transition: border-color 200ms ease, transform 200ms ease;
}
.lp-card:hover { border-color: var(--gold-dark); transform: translateY(-3px); }
.lp-card-media {
  height: 190px; display: flex; align-items: center; justify-content: center; color: var(--gold-light);
  position: relative;
}
.lp-card-media::after {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), transparent 60%);
}
.lp-card-media-preview { overflow: hidden; padding: 0; background: #EFE8DC; }
.lp-card-media-preview iframe {
  width: 375px; height: 812px; border: 0; pointer-events: none; display: block;
  margin: -240px auto 0; transform: scale(0.95); transform-origin: top center;
}
.lp-card-body { padding: 22px 26px 26px; }
.lp-card h3 { font-size: 18px; margin: 0 0 8px; }
.lp-card p { color: var(--muted-dark); font-size: 14px; line-height: 1.5; margin: 0 0 18px; }
.lp-learn { color: var(--gold-light); font-size: 13px; font-weight: 600; }

/* benefits */
.lp-benefits { grid-template-columns: repeat(5, 1fr); }
.lp-benefit { padding: 24px 14px; border: 1px solid var(--line-dark); border-radius: 8px; text-align: center; }
.lp-benefit-icon { color: var(--gold-light); display: flex; justify-content: center; margin-bottom: 12px; }
.lp-benefit h3 { font-size: 15px; margin: 0 0 8px; }
.lp-benefit p { font-size: 13px; color: var(--muted-dark); line-height: 1.55; margin: 0; }

/* process */
.lp-steps { margin-top: 40px; max-width: 640px; margin-inline: auto; text-align: left; }
.lp-step { display: grid; grid-template-columns: 52px 1fr; gap: 18px; padding: 20px 0; border-bottom: 1px solid var(--line-light); }
.lp-step:last-child { border-bottom: none; }
.lp-step-num {
  display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%;
  background: linear-gradient(135deg, var(--gold-light), var(--gold-dark)); color: #17110b;
  font-weight: 700; font-family: 'Lora', serif; font-size: 15px;
}
.lp-step h3 { font-size: 16px; margin: 2px 0 6px; }
.lp-step p { margin: 0; font-size: 14px; color: var(--muted-light); line-height: 1.55; }

/* moment */
.lp-moment {
  min-height: 480px; display: flex; align-items: center; padding: 64px 0;
  background: radial-gradient(ellipse at 20% 50%, #3a2412 0%, transparent 55%), var(--ink);
}
.lp-moment h2 { font-size: clamp(32px, 5vw, 48px); line-height: 1.05; margin-bottom: 20px; }
.lp-moment-lede { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 20px; color: var(--text-on-dark); }
.lp-moment p { max-width: 480px; line-height: 1.7; color: var(--muted-dark); }
.lp-moment .lp-gold { color: var(--gold-light); font-weight: 600; }

/* work */
.lp-work { grid-template-columns: repeat(4, 1fr); }
.lp-work-card {
  display: flex; flex-direction: column; gap: 6px; padding: 28px 18px; min-height: 140px;
  justify-content: flex-end; border-radius: 8px; text-align: left;
  border: 1px solid var(--line-dark); color: var(--text-on-dark);
}
.lp-work-card span:first-child { font-family: 'Cormorant Garamond', serif; font-size: 22px; }
.lp-work-tagline { font-size: 12px; color: var(--gold-dark); }

/* cta */
.lp-cta, .lp-final-cta {
  padding: 72px 0; text-align: center;
  background: radial-gradient(ellipse at 30% 40%, #3d2513, transparent 50%), var(--ink);
}
.lp-cta h2, .lp-final-cta h2 { font-size: clamp(28px, 4vw, 40px); margin-bottom: 14px; }
.lp-cta p, .lp-final-cta p { color: var(--muted-dark); line-height: 1.7; max-width: 60ch; margin: 0 auto 10px; }
.lp-cta .lp-btn, .lp-final-cta .lp-btn { margin-top: 24px; }

/* faq */
.lp-faq-wrap { display: grid; grid-template-columns: 1fr 1.4fr; gap: 48px; text-align: left; }
.lp-faq details { border-bottom: 1px solid var(--line-light); padding: 16px 4px; }
.lp-faq summary { cursor: pointer; font-size: 15px; font-weight: 600; list-style: none; display: flex; justify-content: space-between; }
.lp-faq summary::-webkit-details-marker { display: none; }
.lp-faq summary::after { content: "+"; color: var(--gold-dark); font-size: 18px; }
.lp-faq details[open] summary::after { content: "−"; }
.lp-faq p { font-size: 14px; color: var(--muted-light); line-height: 1.6; margin: 12px 0 0; }

/* footer */
.lp-footer { padding: 56px 0 28px; background: #070807; text-align: center; }
.lp-footer-brand { font-family: 'Cormorant Garamond', serif; letter-spacing: 0.24em; font-size: 30px; color: var(--gold-light); }
.lp-footer-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; margin: 28px 0; }
.lp-footer-links a { color: var(--muted-dark); font-size: 13px; }
.lp-footer-links a:hover { color: var(--gold-light); }
.lp-copyright { color: #6f6b65; font-size: 12px; }

@media (max-width: 960px) {
  .lp-services { grid-template-columns: repeat(2, 1fr); }
  .lp-benefits { grid-template-columns: repeat(2, 1fr); }
  .lp-work { grid-template-columns: repeat(2, 1fr); }
  .lp-faq-wrap { grid-template-columns: 1fr; }
  .lp-navlinks { display: none; position: absolute; right: 24px; top: 64px; background: #111; border: 1px solid var(--line-dark); border-radius: 12px; padding: 18px 24px; flex-direction: column; gap: 16px; }
  .lp-navlinks.open { display: flex; }
  .lp-menu-toggle { display: flex; }
  .lp-nav-cta { display: none; }
}
@media (max-width: 560px) {
  .lp-services, .lp-benefits, .lp-work { grid-template-columns: 1fr; }
}
`;
