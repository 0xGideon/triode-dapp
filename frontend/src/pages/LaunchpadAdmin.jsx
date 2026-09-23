import { useState } from "react";
import CountdownTimer from "../components/CountdownTimer.jsx";
import FundLaunchpadModal from "../components/FundLaunchpadModal.jsx";
import "./LaunchpadAdmin.css";

// TODO (later step): replace all placeholder data with real contract reads via wagmi,
// and gate this whole page behind an owner-wallet check (only the admin address may view it).
const PLACEHOLDER_FUNDING_DEADLINE = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 54 + 60 * 60 * 8;

const HISTORY_ROWS = [
  { round: "#1", source: "Launchpad", seedPerOption: "0.150 / 0.300 / 0.450", total: "0.900 ETH", outcome: "Option A won", outcomeColorVar: "--green" },
  { round: "#2", source: "Launchpad", seedPerOption: "0.150 / 0.300 / 0.450", total: "0.900 ETH", outcome: "Option C won", outcomeColorVar: "--green" },
  { round: "#3", source: "Launchpad", seedPerOption: "0.150 / 0.300 / 0.450", total: "0.900 ETH", outcome: "Option B won", outcomeColorVar: "--green" },
  { round: "#4", source: "Organic", seedPerOption: "—", total: "—", outcome: "Pending est.", outcomeColorVar: "--text-muted", faded: true },
  { round: "#47", source: "Organic", seedPerOption: "—", total: "—", outcome: "Once balance runs out", outcomeColorVar: "--text-muted", faded: true },
];

export default function LaunchpadAdmin() {
  const [fundModalOpen, setFundModalOpen] = useState(false);

  return (
    <div className="admin">
      <nav className="admin__nav">
        <div className="admin__nav-left">
          <img src="/src/assets/triode-icon.svg" alt="" />
          <span>TRIODE</span>
          <span className="admin__badge">LAUNCHPAD ADMIN</span>
        </div>
        <span className="admin__nav-note">Owner-wallet gated · Same rules disclosed in whitepaper &amp; Info page</span>
        <div className="admin__wallet-pill">
          <span className="admin__wallet-dot" />
          0xA9F1...02Cc (owner)
        </div>
      </nav>

      <div className="admin__content container">
        <h1>Launchpad</h1>
        <p className="admin__intro">Every action here uses the same public deposit function and fixed 1 : 2 : 3 ratio shown on the website. There is no manual trigger and no way to target a specific option — this panel only funds the balance and reports status.</p>

        <div className="admin__stat-grid">
          <div className="admin__stat-card">
            <p className="admin__stat-label">Funding window</p>
            <CountdownTimer targetTimestampSeconds={PLACEHOLDER_FUNDING_DEADLINE} />
            <p className="admin__stat-footnote">Closes automatically at launch</p>
          </div>
          <div className="admin__stat-card">
            <p className="admin__stat-label">Launchpad balance</p>
            <p className="admin__stat-value">6.300 ETH</p>
            <button type="button" className="admin__fund-button" onClick={() => setFundModalOpen(true)}>Fund launchpad</button>
          </div>
          <div className="admin__stat-card">
            <p className="admin__stat-label">Allocation ratio (fixed)</p>
            <div className="admin__ratio-bar">
              <div style={{ width: "16.6%", background: "var(--green)" }} />
              <div style={{ width: "33.3%", background: "var(--blue)" }} />
              <div style={{ width: "50%", background: "var(--red)" }} />
            </div>
            <p className="admin__stat-footnote">A · 1x &nbsp; B · 2x &nbsp; C · 3x — not editable once deployed</p>
          </div>
          <div className="admin__stat-card">
            <p className="admin__stat-label">Seeding status</p>
            <div className="admin__status-row">
              <span className="admin__status-dot" />
              <span className="admin__status-text">Active — auto-seeding</span>
            </div>
            <p className="admin__stat-footnote">~7 more rounds at current rate</p>
          </div>
        </div>

        <div className="admin__notice">
          Round numbering never resets. Rounds run <b>#1, #2, #3…</b> continuously for the life of the protocol — seeded rounds and organic rounds share the same sequence, so "early stage" simply describes when the Launchpad balance runs out, not a separate counter.
        </div>

        <h2>Round-by-round history</h2>
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr><th>Round</th><th>Source</th><th>Seed / option</th><th>Total seeded</th><th>Outcome</th></tr>
            </thead>
            <tbody>
              {HISTORY_ROWS.map((row) => (
                <tr key={row.round} style={row.faded ? { opacity: 0.55 } : undefined}>
                  <td>{row.round}</td>
                  <td style={{ color: row.source === "Launchpad" ? "var(--orange-dark)" : "var(--text-muted)", fontWeight: 700 }}>{row.source}</td>
                  <td>{row.seedPerOption}</td>
                  <td>{row.total}</td>
                  <td style={{ color: `var(${row.outcomeColorVar})`, fontWeight: 700 }}>{row.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FundLaunchpadModal open={fundModalOpen} onClose={() => setFundModalOpen(false)} />
    </div>
  );
}
