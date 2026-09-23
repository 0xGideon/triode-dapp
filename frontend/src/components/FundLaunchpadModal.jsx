import { useState } from "react";
import Modal from "./Modal.jsx";
import "./FundLaunchpadModal.css";

const ETH_PER_ROUND = 0.9;
const CURRENT_BALANCE = 6.3;
const ALREADY_COVERS_ROUNDS = 7;

export default function FundLaunchpadModal({ open, onClose }) {
  const [rounds, setRounds] = useState("12");
  const [eth, setEth] = useState("10.800");

  function handleRoundsChange(value) {
    setRounds(value);
    const numericRounds = parseFloat(value) || 0;
    setEth((numericRounds * ETH_PER_ROUND).toFixed(3));
  }

  function handleEthChange(value) {
    setEth(value);
    const numericEth = parseFloat(value) || 0;
    setRounds(String(Math.round(numericEth / ETH_PER_ROUND)));
  }

  const numericEth = parseFloat(eth) || 0;
  const newBalance = CURRENT_BALANCE + numericEth;
  const newRoundsCovered = Math.round(newBalance / ETH_PER_ROUND);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="fund-modal">
        <div className="fund-modal__header">
          <div>
            <p className="fund-modal__eyebrow">LAUNCHPAD &nbsp;·&nbsp; PUBLIC BALANCE</p>
            <h3>Fund launchpad</h3>
          </div>
          <button type="button" className="fund-modal__close" onClick={onClose}>&times;</button>
        </div>

        <p className="fund-modal__notice">Funds are added to the public Launchpad balance shown on the website. This uses the same deposit function anyone can view on-chain — there is no separate private balance.</p>

        <div className="fund-modal__inputs">
          <div className="fund-modal__input-group">
            <p>Rounds to fund</p>
            <div className="fund-modal__input">
              <input type="number" value={rounds} onChange={(e) => handleRoundsChange(e.target.value)} />
              <span>ROUNDS</span>
            </div>
          </div>
          <div className="fund-modal__input-group">
            <p>ETH to deposit</p>
            <div className="fund-modal__input">
              <input type="number" step="0.001" value={eth} onChange={(e) => handleEthChange(e.target.value)} />
              <span>ETH</span>
            </div>
          </div>
        </div>
        <p className="fund-modal__hint">Both fields are editable and stay in sync — change either one and the other updates to match, at 0.900 ETH per round. Override manually if you want an amount that doesn't land on a whole round.</p>

        <div className="fund-modal__row">
          <span>Current balance</span><span>{CURRENT_BALANCE.toFixed(3)} ETH</span>
        </div>
        <div className="fund-modal__row">
          <span>Already covers</span><span>{ALREADY_COVERS_ROUNDS} rounds</span>
        </div>
        <div className="fund-modal__row fund-modal__row--emphasis">
          <span>New balance after funding</span><span>{newBalance.toFixed(3)} ETH &nbsp;·&nbsp; {newRoundsCovered} rounds</span>
        </div>

        {/* TODO (later step): wire to real contract fundLaunchpad() call once it exists */}
        <button type="button" className="fund-modal__confirm">Confirm funding &nbsp;·&nbsp; {numericEth.toFixed(3)} ETH</button>
      </div>
    </Modal>
  );
}
