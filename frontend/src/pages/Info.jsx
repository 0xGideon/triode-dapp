import NavBar from "../components/NavBar.jsx";
import Footer from "../components/Footer.jsx";
import "./Info.css";

export default function Info({ whitepaperUrl = "https://bit.ly/TriodeWhitepaper", testnetUrl = null }) {
  return (
    <div>
      <NavBar active="info" />

      <div className="info container">
        <h1>About TRIODE</h1>
        <p className="info__intro">
          TRIODE is a transparent market protocol built on Robinhood Chain. Each round, participants allocate ETH across three options. The option that ends up least contributed wins and shares the pooled deposits of the other two — pro-rata, entirely enforced by contract code.
        </p>

        <div className="info__testnet-callout">
          <span>Want to try TRIODE risk-free first?</span>
          {testnetUrl ? (
            <a href={testnetUrl} className="info__testnet-link">Open testnet version &rarr;</a>
          ) : (
            <span className="info__testnet-link info__testnet-link--disabled">Testnet link coming soon</span>
          )}
        </div>

        <div className="info__two-col">
          <div>
            <h2>How it works</h2>
            <div className="info__steps">
              <div className="info__step">
                <p className="info__step-title">1. Deposit</p>
                <p>Stake ETH on the option you think will end up least contributed.</p>
              </div>
              <div className="info__step">
                <p className="info__step-title">2. Round locks</p>
                <p>After 3.5 days, or 100 ETH total — whichever comes first.</p>
              </div>
              <div className="info__step">
                <p className="info__step-title">3. Resolution &amp; withdrawal</p>
                <p>Winners have 3.5 days to withdraw before rewards roll into the next round.</p>
              </div>
            </div>
          </div>

          <div>
            <h2>Whitepaper</h2>
            <div className="info__whitepaper-card">
              <div className="info__whitepaper-icon" />
              <div className="info__whitepaper-text">
                <p className="info__whitepaper-title">TRIODE Whitepaper v1.0</p>
                <p className="info__whitepaper-sub">Full protocol design, mechanics &amp; risk disclosure</p>
              </div>
              {whitepaperUrl ? (
                <a href={whitepaperUrl} target="_blank" rel="noreferrer" className="info__whitepaper-button">Read PDF</a>
              ) : (
                <span className="info__whitepaper-button info__whitepaper-button--disabled">Coming soon</span>
              )}
            </div>
          </div>
        </div>

        <h2>Launchpad</h2>
        <div className="info__launchpad-card">
          <div className="info__launchpad-top">
            <p className="info__launchpad-desc">
              A publicly funded balance that seeds early rounds automatically, one after another, each split at a fixed <b>1 : 2 : 3</b> ratio across Options A, B and C. Seeding continues round over round until the balance is exhausted — then rounds run on organic deposits alone.
            </p>
            <div className="info__launchpad-balance">
              <p>Remaining balance</p>
              <p className="info__launchpad-balance-value">6.300 ETH</p>
              <p className="info__launchpad-balance-note">~7 more rounds at current rate</p>
            </div>
          </div>
          <div className="info__launchpad-bar">
            <div style={{ width: "16.6%", background: "var(--green)" }} />
            <div style={{ width: "33.3%", background: "var(--blue)" }} />
            <div style={{ width: "50%", background: "var(--red)" }} />
          </div>
          <div className="info__launchpad-bar-labels">
            <span>Option A · 1x</span><span>Option B · 2x</span><span>Option C · 3x</span>
          </div>
          <div className="info__launchpad-seeded-row">
            <span>Rounds seeded so far</span><span>3 of an estimated 10</span>
          </div>
        </div>

        <h2>Network details</h2>
        <div className="info__network-grid">
          <div className="info__network-card">
            <p className="info__network-title info__network-title--mainnet">Robinhood Chain — Mainnet</p>
            <div className="info__network-rows">
              <div><span>Chain ID</span><span>4663</span></div>
              <div><span>Currency</span><span>ETH</span></div>
              <div><span>Explorer</span><span>robinhoodchain.blockscout.com</span></div>
            </div>
          </div>
          <div className="info__network-card">
            <p className="info__network-title">Robinhood Chain — Testnet</p>
            <div className="info__network-rows">
              <div><span>Chain ID</span><span>46630</span></div>
              <div><span>Native token</span><span>Ether (ETH)</span></div>
              <div><span>Explorer</span><span>Robinhood Chain Explorer</span></div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
