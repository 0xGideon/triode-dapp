import NavBar from "../components/NavBar.jsx";
import Footer from "../components/Footer.jsx";
import CountdownTimer from "../components/CountdownTimer.jsx";
import "./Home.css";

// TODO (later step): replace this placeholder timestamp with the real on-chain
// Launchpad countdown value once the contract and wagmi read hooks are wired up.
const PLACEHOLDER_COUNTDOWN_TIMESTAMP = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 54;

export default function Home() {
  return (
    <div>
      <div className="home-hero">
        <img src="/src/assets/triode-icon.svg" alt="" className="home-hero__watermark" />
        <NavBar onDark active="home" />
        <div className="home-hero__content">
          <h1 className="home-hero__title">Where consensus becomes the risk.</h1>
          <p className="home-hero__subtitle">
            TRIODE is a transparent, on-chain market protocol. Three options, one round, and a simple rule: the option everyone piles into is the one that loses.
          </p>
          <div className="home-hero__ctas">
            <a className="home-hero__cta-primary" href="/app">Enter the market</a>
            <a className="home-hero__cta-secondary" href="/info">Read the whitepaper</a>
          </div>
          <p className="home-hero__tags">Built on Robinhood Chain &nbsp;·&nbsp; Fully on-chain &nbsp;·&nbsp; No custodial control</p>
        </div>
      </div>

      <div className="home-launchpad-banner">
        <div className="home-launchpad-banner__text">
          <p className="home-launchpad-banner__eyebrow">LAUNCHPAD &nbsp;·&nbsp; PUBLIC &amp; ON-CHAIN</p>
          <p className="home-launchpad-banner__body">
            Bootstrap liquidity for early rounds — funded transparently, seeding round after round at a fixed <b>1 : 2 : 3</b> ratio across Options A, B and C until the balance runs out.
          </p>
        </div>
        <CountdownTimer targetTimestampSeconds={PLACEHOLDER_COUNTDOWN_TIMESTAMP} />
      </div>

      <div className="home-features container">
        <h2>A market that reacts to being watched</h2>
        <p className="home-features__intro">No permanently correct choice. Every round is a live contest between anticipation and crowd behavior.</p>
        <div className="home-features__grid">
          <div className="home-feature-card">
            <div className="home-feature-card__icon" style={{ background: "var(--orange-tint)" }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--orange)" }} />
            </div>
            <h3>Fully on-chain</h3>
            <p>Every deposit, resolution and payout is enforced by contract code — never by an operator's judgment.</p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-card__icon" style={{ background: "var(--orange-tint)" }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--orange-dark)" }} />
            </div>
            <h3>One transparent fee</h3>
            <p>A flat 10% is the only fee, applied at deposit. No hidden spreads, no variable house edge.</p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-card__icon" style={{ background: "var(--orange-tint)" }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--orange-light)" }} />
            </div>
            <h3>Wallet is your account</h3>
            <p>Connect MetaMask and sign. No sign-ups, no passwords, no off-chain identity.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
