import Modal from "./Modal.jsx";
import "./ShareResultModal.css";

export default function ShareResultModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="share-modal">
        <div className="share-modal__status">
          <span className="share-modal__check">&#10003;</span>
          <span>Withdrawal complete</span>
        </div>

        <div className="share-modal__card">
          <img src="/src/assets/triode-icon.svg" alt="" className="share-modal__watermark" />
          <div className="share-modal__card-content">
            <div className="share-modal__card-header">
              <img src="/src/assets/triode-icon.svg" alt="" />
              <span>TRIODE</span>
              <span className="share-modal__round">Round #47</span>
            </div>
            <p className="share-modal__result-label">WENT AGAINST THE CROWD &nbsp;·&nbsp; OPTION A WON</p>
            <p className="share-modal__amount">+3.184 ETH</p>
            <p className="share-modal__stake-line">Staked 1.250 ETH &nbsp;·&nbsp; 58 people chose Option A</p>
            <div className="share-modal__stats">
              <div>
                <p>Return</p>
                <p className="share-modal__stat-value share-modal__stat-value--green">+154.7%</p>
              </div>
              <div>
                <p>Round volume</p>
                <p className="share-modal__stat-value">63.482 ETH</p>
              </div>
              <div>
                <p>Read the crowd</p>
                <p className="share-modal__stat-value">Correctly</p>
              </div>
            </div>
          </div>
        </div>

        <p className="share-modal__privacy">Share your result — it never reveals your wallet address.</p>

        <div className="share-modal__actions">
          {/* TODO (later step): wire actual image export + Web Share API */}
          <button type="button" className="share-modal__download">Download image</button>
          <button type="button" className="share-modal__share">Share</button>
        </div>
      </div>
    </Modal>
  );
}
