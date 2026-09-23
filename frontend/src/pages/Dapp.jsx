import { useState } from "react";
import NavBar from "../components/NavBar.jsx";
import Footer from "../components/Footer.jsx";
import DepositModal from "../components/DepositModal.jsx";
import ShareResultModal from "../components/ShareResultModal.jsx";
import "./Dapp.css";

// TODO (later step): replace all of this with real contract reads via wagmi.
const OPTIONS = [
  { key: "A", label: "Option A", tag: "Least contributed", colorVar: "--green", tagBgVar: "--green-tint", statement: "Go against the crowd", yourStake: "1.250", totalStake: "14.900", participants: 58 },
  { key: "B", label: "Option B", tag: "Middle contributed", colorVar: "--blue", tagBgVar: "--blue-tint", statement: "Stay neutral", yourStake: "0.000", totalStake: "21.760", participants: 74 },
  { key: "C", label: "Option C", tag: "Most contributed", colorVar: "--red", tagBgVar: "--red-tint", statement: "Follow the crowd", yourStake: "0.500", totalStake: "26.822", participants: 82 },
];

export default function Dapp() {
  const [depositOption, setDepositOption] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div>
      <NavBar active="dapp" />

      <div className="dapp container">
        <div className="dapp__header">
          <div className="dapp__title-row">
            <h1>Round #47</h1>
            <span className="dapp__seeded-badge">Seeded by Launchpad · 0.900 ETH</span>
          </div>
          <p className="dapp__subtitle">Pick the option you think ends up least contributed.</p>
        </div>

        <div className="dapp__timer-row">
          <span>Round ends in</span>
          <span className="dapp__timer-value">2d 14h 32m</span>
        </div>

        <div className="dapp__stats">
          <div className="dapp__stat-card">
            <p>Volume</p>
            <p className="dapp__stat-value">63.482 ETH</p>
          </div>
          <div className="dapp__stat-card">
            <p>Total participants</p>
            <p className="dapp__stat-value">214</p>
          </div>
          <div className="dapp__stat-card">
            <p>Deposit cap this round</p>
            <p className="dapp__stat-value">63.5 / 100 ETH</p>
          </div>
        </div>

        <div className="dapp__options">
          {OPTIONS.map((opt) => (
            <div className="option-card" key={opt.key}>
              <div className="option-card__bar" style={{ background: `var(${opt.colorVar})` }} />
              <div className="option-card__body">
                <div className="option-card__top">
                  <h3>{opt.label}</h3>
                  <span className="option-card__tag" style={{ background: `var(${opt.tagBgVar})`, color: `var(${opt.colorVar})` }}>
                    {opt.tag}
                  </span>
                </div>
                <p className="option-card__statement" style={{ color: `var(${opt.colorVar})` }}>&ldquo;{opt.statement}&rdquo;</p>
                <div className="option-card__rows">
                  <div><span>Your stake</span><span>{opt.yourStake} ETH</span></div>
                  <div><span>Total stake</span><span>{opt.totalStake} ETH</span></div>
                  <div><span>Participants</span><span>{opt.participants}</span></div>
                </div>
                <button type="button" className="option-card__deposit" onClick={() => setDepositOption(opt)}>
                  Deposit
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="dapp__reward">
          <p className="dapp__reward-label">Your expected reward if Option A wins</p>
          <p className="dapp__reward-value">3.184 ETH</p>
          <p className="dapp__reward-note">Includes 0.412 ETH rolled over from Round #46</p>
          {/* TODO (later step): wire to real contract withdraw() call once it exists */}
          <button type="button" className="dapp__withdraw" onClick={() => setShareOpen(true)}>Withdraw</button>
        </div>
        <p className="dapp__forfeit-note">Unclaimed rewards are forfeited 3.5 days after a round resolves and roll into the next round's pool.</p>
      </div>

      <Footer />

      <DepositModal
        open={!!depositOption}
        onClose={() => setDepositOption(null)}
        option={depositOption}
      />
      <ShareResultModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
