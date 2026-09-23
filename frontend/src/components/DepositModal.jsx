import { useState } from "react";
import Modal from "./Modal.jsx";
import "./DepositModal.css";

const QUICK_AMOUNTS = ["0.1", "0.5", "1"];
const ADMIN_FEE_RATE = 0.10;

export default function DepositModal({ open, onClose, option }) {
  const [amount, setAmount] = useState("1.500");

  if (!option) return null;

  const numericAmount = parseFloat(amount) || 0;
  const fee = numericAmount * ADMIN_FEE_RATE;
  const net = numericAmount - fee;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="deposit-modal">
        <div className="deposit-modal__header">
          <div>
            <p className="deposit-modal__eyebrow" style={{ color: `var(${option.colorVar})` }}>
              {option.label} &nbsp;·&nbsp; &ldquo;{option.statement}&rdquo;
            </p>
            <h3>Deposit ETH</h3>
          </div>
          <button type="button" className="deposit-modal__close" onClick={onClose}>&times;</button>
        </div>

        <p className="deposit-modal__notice">Deposits are final for this round. There is no sell or opt-out once staked.</p>

        <div className="deposit-modal__input">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.001"
            min="0"
          />
          <span>ETH</span>
        </div>

        <div className="deposit-modal__quick">
          {QUICK_AMOUNTS.map((q) => (
            <button key={q} type="button" onClick={() => setAmount(q)}>{q}</button>
          ))}
          <button type="button" className="deposit-modal__quick-max" onClick={() => setAmount("10")}>Max (10)</button>
        </div>

        <div className="deposit-modal__row">
          <span>Admin fee (10%)</span>
          <span>{fee.toFixed(3)} ETH</span>
        </div>
        <div className="deposit-modal__row deposit-modal__row--last">
          <span>Added to your {option.label} stake</span>
          <span>{net.toFixed(3)} ETH</span>
        </div>

        {/* TODO (later step): wire this to the real contract deposit() call once it exists */}
        <button type="button" className="deposit-modal__confirm">Confirm deposit</button>
      </div>
    </Modal>
  );
}
