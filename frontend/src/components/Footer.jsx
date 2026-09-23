import { Link } from "react-router-dom";
import { XIcon, TelegramIcon } from "./icons/SocialIcons.jsx";
import "./Footer.css";

export default function Footer({ twitterUrl = null, telegramUrl = null }) {
  return (
    <footer className="triode-footer">
      <div className="triode-footer__brand">
        <img src="/src/assets/triode-icon.svg" alt="" className="triode-footer__icon" />
        <span>TRIODE</span>
      </div>
      <div className="triode-footer__right">
        <Link to="/">Home</Link>
        <Link to="/app">Dapp</Link>
        <Link to="/info">Info</Link>
        <span className="triode-footer__divider" />
        <div className="triode-footer__social">
          {twitterUrl ? (
            <a className="triode-footer__social-icon" href={twitterUrl} target="_blank" rel="noreferrer" title="X (Twitter)">
              <XIcon />
            </a>
          ) : (
            <span className="triode-footer__social-icon triode-footer__social-icon--disabled" title="Coming at mainnet launch">
              <XIcon />
            </span>
          )}
          {telegramUrl ? (
            <a className="triode-footer__social-icon" href={telegramUrl} target="_blank" rel="noreferrer" title="Telegram">
              <TelegramIcon />
            </a>
          ) : (
            <span className="triode-footer__social-icon triode-footer__social-icon--disabled" title="Coming at mainnet launch">
              <TelegramIcon />
            </span>
          )}
          <span>GitHub</span>
        </div>
      </div>
    </footer>
  );
}
